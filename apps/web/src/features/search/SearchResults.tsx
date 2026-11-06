'use client';

import { useEffect, useRef, useState } from 'react';
import type { SearchResultView } from '@smallweb/shared';

// Scroll is reported once scrolling pauses for this long, not on every frame.
const SCROLL_REPORT_DELAY_MS = 100;

interface SearchResultsProps {
  query: string;
  results: SearchResultView[];
  restoreY: number;
  onOpen: (address: string) => void;
  onScroll: (y: number) => void;
}

// The results of one search. Give it a new `key` per arrival: like the page frame, it scrolls to
// restoreY once when it appears and reports its scroll position as you move.
export function SearchResults({ query, results, restoreY, onOpen, onScroll }: SearchResultsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [initialY] = useState(restoreY);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    listRef.current?.scrollTo(0, initialY);
    return () => clearTimeout(timerRef.current);
  }, [initialY]);

  function handleScroll() {
    clearTimeout(timerRef.current);
    const y = listRef.current?.scrollTop ?? 0;
    timerRef.current = setTimeout(() => onScroll(y), SCROLL_REPORT_DELAY_MS);
  }

  return (
    <div ref={listRef} className="search-results" onScroll={handleScroll}>
      <h1>Search: {query}</h1>
      {results.length === 0 ? (
        <p>Nothing on the small web mentions that.</p>
      ) : (
        <ol>
          {results.map((result) => (
            <li key={result.address}>
              <button type="button" onClick={() => onOpen(result.address)}>
                <span className="result-title">{result.title}</span>
                <span className="result-address">
                  {result.address} · by {result.author.name}
                </span>
                <span className="result-snippet">{result.snippet}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
