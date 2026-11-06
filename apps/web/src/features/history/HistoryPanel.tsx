'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { VisitView } from '@smallweb/shared';
import { ApiError, getVisits } from '@/lib/api-client';

interface HistoryPanelProps {
  personId: string;
  // Visits recorded since the panel opened, newest first; shown on top without reloading.
  recentVisits: VisitView[];
  onOpen: (address: string) => void;
}

// One person's history, newest first. Give it a new `key` per person so switching person starts
// from the top. Older pages load as you scroll to the bottom (cursor pagination).
export function HistoryPanel({ personId, recentVisits, onOpen }: HistoryPanelProps) {
  const [loaded, setLoaded] = useState<VisitView[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A ref, not state: it only stops two requests for the same page, nothing renders from it.
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLLIElement>(null);

  const loadMore = useCallback(() => {
    if (loadingRef.current || finished) return;
    loadingRef.current = true;
    getVisits(personId, nextCursor)
      .then((page) => {
        setLoaded((previous) => [...previous, ...page.items]);
        setNextCursor(page.nextCursor);
        setFinished(page.nextCursor === null);
        setError(null);
      })
      .catch((caught: unknown) => {
        setError(caught instanceof ApiError ? caught.message : 'Could not load history');
      })
      .finally(() => {
        loadingRef.current = false;
      });
  }, [personId, nextCursor, finished]);

  // Loads the next page whenever the marker under the list scrolls into view (and on open, when
  // the list is still empty and the marker is visible straight away).
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || error) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, error]);

  // A recent visit can also arrive in a loaded page; show each visit once.
  const loadedIds = new Set(loaded.map((visit) => visit.id));
  const visits = [...recentVisits.filter((visit) => !loadedIds.has(visit.id)), ...loaded];

  return (
    <aside className="history-panel" aria-label="History">
      <h2>History</h2>
      <ul>
        {visits.map((visit) => (
          <li key={visit.id}>
            <button type="button" onClick={() => onOpen(visit.address)}>
              <span className={visit.found ? 'history-title' : 'history-title nowhere-mark'}>
                {visit.found ? visit.title : 'Nowhere'}
              </span>
              <span className="history-meta">
                {visit.address} · {visit.via} · {new Date(visit.visitedAt).toLocaleString()}
              </span>
            </button>
          </li>
        ))}
        <li ref={sentinelRef} className="history-end">
          {error ? (
            <button type="button" onClick={() => setError(null)}>
              {error}. Try again
            </button>
          ) : finished ? (
            'That is everything.'
          ) : (
            'Loading…'
          )}
        </li>
      </ul>
    </aside>
  );
}
