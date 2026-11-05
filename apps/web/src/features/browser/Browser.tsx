'use client';

import { useEffect, useState } from 'react';
import type { SiteView } from '@smallweb/shared';
import { ApiError, getSite } from '@/lib/api-client';

// Temporary: loads one fixed address. Phase 4 replaces this with the real browser.
const START_ADDRESS = 'tidepool.zz';

type View =
  | { status: 'loading' }
  | { status: 'shown'; site: SiteView }
  | { status: 'error'; message: string };

export function Browser() {
  const [view, setView] = useState<View>({ status: 'loading' });

  useEffect(() => {
    getSite(START_ADDRESS)
      .then((site) => setView({ status: 'shown', site }))
      .catch((error: unknown) => {
        const message = error instanceof ApiError ? error.message : 'Something went wrong';
        setView({ status: 'error', message });
      });
  }, []);

  if (view.status === 'loading') return <p>Loading…</p>;
  if (view.status === 'error') return <p role="alert">{view.message}</p>;
  return <h1>{view.site.title}</h1>;
}
