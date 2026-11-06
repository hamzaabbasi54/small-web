// The browser's back/forward model: a list of entries plus a pointer to the current one.
// A pure reducer (no React, DOM or fetch), so every rule can be unit-tested.

export type SessionEntry =
  | { id: string; kind: 'page'; address: string; scrollY: number }
  | { id: string; kind: 'search'; query: string; scrollY: number };

export interface SessionState {
  entries: SessionEntry[];
  index: number; // position of the current entry; -1 means empty
}

export type SessionAction =
  | { type: 'navigate'; entry: SessionEntry }
  | { type: 'goTo'; index: number }
  | { type: 'saveScroll'; entryId: string; scrollY: number };

export const EMPTY_SESSION: SessionState = { entries: [], index: -1 };

function isSameDestination(a: SessionEntry, b: SessionEntry): boolean {
  if (a.kind === 'page' && b.kind === 'page') return a.address === b.address;
  if (a.kind === 'search' && b.kind === 'search') return a.query === b.query;
  return false;
}

export function currentEntry(state: SessionState): SessionEntry | null {
  return state.entries[state.index] ?? null;
}

export function canGoBack(state: SessionState): boolean {
  return state.index > 0;
}

export function canGoForward(state: SessionState): boolean {
  return state.index < state.entries.length - 1;
}

// Never mutates `state`; always returns a new object (or the same one when nothing changes).
export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'navigate': {
      // Going to where you already are doesn't add an entry, like re-entering a URL in a browser.
      const current = currentEntry(state);
      if (current && isSameDestination(current, action.entry)) return state;
      // Everything after the current entry is dropped: this is how forward gets lost.
      const entries = [...state.entries.slice(0, state.index + 1), action.entry];
      return { entries, index: entries.length - 1 };
    }
    case 'goTo': {
      // Back and forward only move the pointer; the entries stay exactly as they were.
      if (action.index < 0 || action.index >= state.entries.length) return state;
      return { ...state, index: action.index };
    }
    case 'saveScroll': {
      // Matched by id, not position, so a late scroll report can't land on the wrong entry.
      if (!state.entries.some((entry) => entry.id === action.entryId)) return state;
      const entries = state.entries.map((entry) =>
        entry.id === action.entryId ? { ...entry, scrollY: action.scrollY } : entry,
      );
      return { ...state, entries };
    }
  }
}
