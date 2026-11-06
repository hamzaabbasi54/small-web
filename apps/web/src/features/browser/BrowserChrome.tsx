'use client';

import { useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { normalizeAddress } from '@smallweb/shared';

interface BrowserChromeProps {
  address: string; // the current entry's address, '' when there is none
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onGo: (address: string) => void;
  query: string; // the current entry's search, '' when it isn't a search
  onSearch: (query: string) => void;
  children?: ReactNode; // toolbar items on the right
}

// Matches the API's minimum, so a too-short search is stopped by the browser's form check.
const MIN_QUERY_LENGTH = 2;

export function BrowserChrome({
  address,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onGo,
  query,
  onSearch,
  children,
}: BrowserChromeProps) {
  return (
    <header className="chrome">
      <button type="button" onClick={onBack} disabled={!canGoBack} aria-label="Back">
        ◀
      </button>
      <button type="button" onClick={onForward} disabled={!canGoForward} aria-label="Forward">
        ▶
      </button>
      {/* A new key whenever the current address changes throws away any half-typed draft. */}
      {/* Prefixed so the two keys can never be equal (both are '' on the start page). */}
      <AddressBar key={`address:${address}`} address={address} onGo={onGo} />
      <SearchBox key={`search:${query}`} query={query} onSearch={onSearch} />
      {children}
    </header>
  );
}

interface SearchBoxProps {
  query: string;
  onSearch: (query: string) => void;
}

function SearchBox({ query, onSearch }: SearchBoxProps) {
  const [draft, setDraft] = useState(query);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSearch(draft.trim());
  }

  return (
    <form className="search-box" onSubmit={handleSubmit} role="search">
      <input
        aria-label="Search the small web"
        type="search"
        value={draft}
        placeholder="Search"
        required
        minLength={MIN_QUERY_LENGTH}
        onChange={(event) => setDraft(event.target.value)}
      />
    </form>
  );
}

interface AddressBarProps {
  address: string;
  onGo: (address: string) => void;
}

// Shows the current address. Typing makes a local draft (the brief's "Typed" state); Enter goes
// there, Escape puts the current address back.
function AddressBar({ address, onGo }: AddressBarProps) {
  const [draft, setDraft] = useState(address);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const target = normalizeAddress(draft);
    // Anything non-empty is navigated to; an address that isn't valid simply leads to Nowhere.
    if (target) onGo(target);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') setDraft(address);
  }

  return (
    <form className="address-bar" onSubmit={handleSubmit}>
      <input
        aria-label="Address"
        value={draft}
        placeholder="Type an address, like tidepool.zz"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoComplete="off"
      />
    </form>
  );
}
