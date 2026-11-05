'use client';

import { useCallback, useEffect, useState } from 'react';
import { ErrorCode, normalizeAddress, type SiteView } from '@smallweb/shared';
import { ApiError, getSite } from '@/lib/api-client';
import { NowherePage } from './NowherePage';
import { PageFrame } from './PageFrame';

// Temporary: one page at a time, links followed in place, no back/forward yet.
// Phase 4 replaces this with the real browser.
const START_ADDRESS = 'tidepool.zz';

// The result of loading one address. While `result.address` isn't the current address, we're loading.
type Result =
  | { address: string; status: 'shown'; site: SiteView }
  | { address: string; status: 'nowhere' }
  | { address: string; status: 'error'; message: string };

export function Browser() {
  const [address, setAddress] = useState(START_ADDRESS);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    // If the address changes before this request finishes, its late answer is ignored.
    let cancelled = false;
    getSite(address)
      .then((site) => {
        if (!cancelled) setResult({ address, status: 'shown', site });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        // No site at this address is a normal outcome, not an error.
        if (error instanceof ApiError && error.code === ErrorCode.SITE_NOT_FOUND) {
          setResult({ address, status: 'nowhere' });
          return;
        }
        const message = error instanceof ApiError ? error.message : 'Something went wrong';
        setResult({ address, status: 'error', message });
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

  const handleNavigate = useCallback((target: string) => setAddress(normalizeAddress(target)), []);
  const handleScroll = useCallback(() => {}, []);

  if (result?.address !== address) return <p>Loading…</p>;
  if (result.status === 'error') return <p role="alert">{result.message}</p>;
  if (result.status === 'nowhere') return <NowherePage address={result.address} />;
  return (
    <PageFrame
      key={result.site.address}
      title={result.site.title}
      safeHtml={result.site.html}
      restoreY={0}
      onNavigate={handleNavigate}
      onScroll={handleScroll}
    />
  );
}
