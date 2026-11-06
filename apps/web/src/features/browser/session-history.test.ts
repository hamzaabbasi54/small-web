import { describe, expect, it } from 'vitest';
import {
  EMPTY_SESSION,
  canGoBack,
  canGoForward,
  sessionReducer,
  type SessionEntry,
  type SessionState,
} from './session-history';

function page(address: string): SessionEntry {
  return { id: address, kind: 'page', address, scrollY: 0 };
}

// Navigates through the given addresses from an empty session.
function visit(...addresses: string[]): SessionState {
  return addresses.reduce(
    (state, address) => sessionReducer(state, { type: 'navigate', entry: page(address) }),
    EMPTY_SESSION,
  );
}

function addresses(state: SessionState): string[] {
  return state.entries.map((entry) => (entry.kind === 'page' ? entry.address : entry.query));
}

describe('sessionReducer', () => {
  it('navigate on an empty session creates one entry at index 0', () => {
    const state = visit('a.zz');
    expect(addresses(state)).toEqual(['a.zz']);
    expect(state.index).toBe(0);
  });

  it('navigate three times keeps the entries in order and points at the last', () => {
    const state = visit('a.zz', 'b.zz', 'c.zz');
    expect(addresses(state)).toEqual(['a.zz', 'b.zz', 'c.zz']);
    expect(state.index).toBe(2);
  });

  it('back then navigate drops the forward entries', () => {
    const back = sessionReducer(visit('a.zz', 'b.zz', 'c.zz'), { type: 'goTo', index: 0 });
    const state = sessionReducer(back, { type: 'navigate', entry: page('d.zz') });
    expect(addresses(state)).toEqual(['a.zz', 'd.zz']);
    expect(state.index).toBe(1);
    expect(canGoForward(state)).toBe(false);
  });

  it('goTo out of range leaves the state unchanged', () => {
    const state = visit('a.zz', 'b.zz');
    expect(sessionReducer(state, { type: 'goTo', index: -1 })).toBe(state);
    expect(sessionReducer(state, { type: 'goTo', index: 2 })).toBe(state);
  });

  it('back and forward move only the index, never the entries', () => {
    const state = visit('a.zz', 'b.zz', 'c.zz');
    const back = sessionReducer(state, { type: 'goTo', index: 1 });
    const forward = sessionReducer(back, { type: 'goTo', index: 2 });
    expect(back.index).toBe(1);
    expect(forward.index).toBe(2);
    expect(back.entries).toBe(state.entries);
    expect(forward.entries).toBe(state.entries);
  });

  it('canGoBack and canGoForward at the start, middle and end', () => {
    const state = visit('a.zz', 'b.zz', 'c.zz');
    const atStart = sessionReducer(state, { type: 'goTo', index: 0 });
    const inMiddle = sessionReducer(state, { type: 'goTo', index: 1 });
    expect([canGoBack(atStart), canGoForward(atStart)]).toEqual([false, true]);
    expect([canGoBack(inMiddle), canGoForward(inMiddle)]).toEqual([true, true]);
    expect([canGoBack(state), canGoForward(state)]).toEqual([true, false]);
    expect([canGoBack(EMPTY_SESSION), canGoForward(EMPTY_SESSION)]).toEqual([false, false]);
  });

  it('navigate to the current address adds no entry', () => {
    const state = visit('a.zz', 'b.zz');
    const again = sessionReducer(state, {
      type: 'navigate',
      entry: { id: 'other-id', kind: 'page', address: 'b.zz', scrollY: 0 },
    });
    expect(again).toBe(state);
  });

  it('saveScroll updates only the entry with that id', () => {
    const state = visit('a.zz', 'b.zz');
    const saved = sessionReducer(state, { type: 'saveScroll', entryId: 'a.zz', scrollY: 420 });
    expect(saved.entries[0].scrollY).toBe(420);
    expect(saved.entries[1]).toBe(state.entries[1]);
    expect(sessionReducer(state, { type: 'saveScroll', entryId: 'nope', scrollY: 1 })).toBe(state);
  });

  it('never mutates the previous state', () => {
    const state = visit('a.zz', 'b.zz');
    Object.freeze(state);
    Object.freeze(state.entries);
    state.entries.forEach((entry) => Object.freeze(entry));
    expect(() => {
      sessionReducer(state, { type: 'navigate', entry: page('c.zz') });
      sessionReducer(state, { type: 'goTo', index: 0 });
      sessionReducer(state, { type: 'saveScroll', entryId: 'a.zz', scrollY: 5 });
    }).not.toThrow();
    expect(addresses(state)).toEqual(['a.zz', 'b.zz']);
    expect(state.entries[0].scrollY).toBe(0);
  });
});
