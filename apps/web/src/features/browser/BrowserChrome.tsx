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
  children?: ReactNode; // toolbar items on the right
}

export function BrowserChrome({
  address,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onGo,
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
      <AddressBar key={address} address={address} onGo={onGo} />
      {children}
    </header>
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
