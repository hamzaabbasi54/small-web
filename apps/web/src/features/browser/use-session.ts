'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { VisitVia } from '@smallweb/shared';
import {
  EMPTY_SESSION,
  canGoBack,
  canGoForward,
  currentEntry,
  sessionReducer,
  type SessionAction,
  type SessionEntry,
  type SessionState,
} from './session-history';

export type Destination = { kind: 'page'; address: string } | { kind: 'search'; query: string };

// One arrival at the current entry. `seq` goes up on every navigation (even to the page you are
// already on), so the view knows when to load again; `via` is how we got here.
export interface Arrival {
  seq: number;
  via: VisitVia;
}

const STORAGE_KEY = 'smallweb.session';

// What we keep in window.history.state for each browser history entry.
interface HistoryState {
  sessionIndex: number;
}

// Every entry has its own URL, so the address is visible, shareable and survives reload.
function urlFor(entry: SessionEntry): string {
  return entry.kind === 'page'
    ? `/?addr=${encodeURIComponent(entry.address)}`
    : `/?q=${encodeURIComponent(entry.query)}`;
}

function readHistoryIndex(state: unknown): number | null {
  const index = (state as Partial<HistoryState> | null)?.sessionIndex;
  return typeof index === 'number' ? index : null;
}

// sessionStorage can throw (private mode, blocked storage); the browser still works without it.
function loadStoredSession(): SessionState | null {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as SessionState) : null;
  } catch {
    return null;
  }
}

function storeSession(session: SessionState): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Not stored: a reload starts from the URL instead. Nothing else depends on it.
  }
}

// The session to start with when the page loads.
function initialSession(): SessionState {
  // We restore scroll positions ourselves, per entry; the browser's own restoring would fight it.
  window.history.scrollRestoration = 'manual';
  // A reload: the browser still remembers which entry we were on, and sessionStorage has the list.
  const stored = loadStoredSession();
  const historyIndex = readHistoryIndex(window.history.state);
  if (stored && historyIndex !== null && historyIndex < stored.entries.length) {
    return { ...stored, index: historyIndex };
  }
  // A fresh load of a URL like /?addr=tidepool.zz or /?q=fog starts a new session there.
  const params = new URLSearchParams(window.location.search);
  const address = params.get('addr');
  const query = params.get('q');
  const destination: Destination | null = address
    ? { kind: 'page', address }
    : query
      ? { kind: 'search', query }
      : null;
  if (!destination) return EMPTY_SESSION;
  const entry: SessionEntry = { ...destination, id: crypto.randomUUID(), scrollY: 0 };
  window.history.replaceState({ sessionIndex: 0 } satisfies HistoryState, '', urlFor(entry));
  return { entries: [entry], index: 0 };
}

// Owns the session (entries + pointer), mirrors it into the browser's own history, and records
// how we arrived at the current entry. Must only run in the browser (it reads window at start).
export function useSession() {
  const [session, setSession] = useState<SessionState>(initialSession);
  const [arrival, setArrival] = useState<Arrival>({ seq: 0, via: 'typed' });
  // The latest session, readable inside callbacks without waiting for a re-render.
  const sessionRef = useRef(session);

  const update = useCallback((action: SessionAction): SessionState => {
    const next = sessionReducer(sessionRef.current, action);
    sessionRef.current = next;
    setSession(next);
    return next;
  }, []);

  const navigate = useCallback(
    (destination: Destination, via: VisitVia) => {
      const previous = sessionRef.current;
      const entry: SessionEntry = { ...destination, id: crypto.randomUUID(), scrollY: 0 };
      const next = update({ type: 'navigate', entry });
      if (next !== previous) {
        const state: HistoryState = { sessionIndex: next.index };
        // pushState drops the browser's own forward entries, just like the reducer does. The
        // first page replaces the empty start page instead, so back from it leaves the app.
        if (previous.index === -1) window.history.replaceState(state, '', urlFor(entry));
        else window.history.pushState(state, '', urlFor(entry));
      }
      setArrival((current) => ({ seq: current.seq + 1, via }));
    },
    [update],
  );

  // The one path for back and forward: our ◀ ▶ buttons, the browser's buttons and the mouse's
  // back button all end in a popstate event, and only this handler moves the pointer.
  useEffect(() => {
    function handlePopState(event: PopStateEvent) {
      const index = readHistoryIndex(event.state);
      if (index === null) return;
      const previousIndex = sessionRef.current.index;
      const next = update({ type: 'goTo', index });
      if (next.index === previousIndex) return;
      const via: VisitVia = next.index < previousIndex ? 'back' : 'forward';
      setArrival((current) => ({ seq: current.seq + 1, via }));
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [update]);

  // Kept after every change, so a reload comes back to the same stack and position.
  useEffect(() => storeSession(session), [session]);

  const back = useCallback(() => window.history.back(), []);
  const forward = useCallback(() => window.history.forward(), []);

  const saveScroll = useCallback(
    (entryId: string, scrollY: number) => update({ type: 'saveScroll', entryId, scrollY }),
    [update],
  );

  return {
    entry: currentEntry(session),
    arrival,
    canGoBack: canGoBack(session),
    canGoForward: canGoForward(session),
    navigate,
    back,
    forward,
    saveScroll,
  };
}
