'use client';

import { useCallback, useRef, useState } from 'react';
import type { VisitVia } from '@smallweb/shared';
import {
  EMPTY_SESSION,
  canGoBack,
  canGoForward,
  currentEntry,
  sessionReducer,
  type SessionAction,
  type SessionState,
} from './session-history';

export type Destination = { kind: 'page'; address: string } | { kind: 'search'; query: string };

// One arrival at the current entry. `seq` goes up on every navigation (even to the page you are
// already on), so the view knows when to load again; `via` is how we got here.
export interface Arrival {
  seq: number;
  via: VisitVia;
}

// Owns the session (entries + pointer) and how we arrived at the current entry.
export function useSession() {
  const [session, setSession] = useState<SessionState>(EMPTY_SESSION);
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
      update({ type: 'navigate', entry: { ...destination, id: crypto.randomUUID(), scrollY: 0 } });
      setArrival((previous) => ({ seq: previous.seq + 1, via }));
    },
    [update],
  );

  const goTo = useCallback(
    (index: number) => {
      const previousIndex = sessionRef.current.index;
      const next = update({ type: 'goTo', index });
      if (next.index === previousIndex) return;
      const via: VisitVia = next.index < previousIndex ? 'back' : 'forward';
      setArrival((previous) => ({ seq: previous.seq + 1, via }));
    },
    [update],
  );

  const back = useCallback(() => goTo(sessionRef.current.index - 1), [goTo]);
  const forward = useCallback(() => goTo(sessionRef.current.index + 1), [goTo]);

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
