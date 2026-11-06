'use client';

import { useEffect, useRef, useState } from 'react';
import { ErrorCode, normalizeAddress, type SiteView } from '@smallweb/shared';
import { ApiError, getSite, recordVisit } from '@/lib/api-client';
import { PersonPicker } from '@/features/people/PersonPicker';
import { usePerson } from '@/features/people/use-person';
import { BrowserChrome } from './BrowserChrome';
import { NowherePage } from './NowherePage';
import { PageFrame } from './PageFrame';
import { StatusLine } from './StatusLine';
import { useSession } from './use-session';

// What one arrival at an entry resolved to. `seq` ties it to that arrival: while it doesn't match
// the current arrival, the view is still loading.
type LoadedView =
  | { seq: number; status: 'shown'; site: SiteView }
  | { seq: number; status: 'nowhere'; address: string }
  | { seq: number; status: 'error'; message: string };

export function Browser() {
  const session = useSession();
  const { entry, arrival, navigate, saveScroll } = session;
  // What each entry loaded, by entry id, so returning to an entry shows it instantly (memory only:
  // after a reload, entries load again).
  const [cache, setCache] = useState<Record<string, LoadedView>>({});

  const address = entry?.kind === 'page' ? entry.address : null;
  const entryId = entry?.id ?? null;
  const cached = entryId ? cache[entryId] : undefined;
  const isReturn = arrival.via === 'back' || arrival.via === 'forward';
  // Restore on return: back/forward reuse what the entry showed before (unless it was an error).
  // Any other arrival, including navigating to the same address again, loads fresh.
  const view =
    cached && (cached.seq === arrival.seq || (isReturn && cached.status !== 'error'))
      ? cached
      : null;
  const needsLoad = address !== null && view === null;

  useEffect(() => {
    if (!needsLoad || address === null || entryId === null) return;
    const setLoaded = (loaded: LoadedView) =>
      setCache((previous) => ({ ...previous, [entryId]: loaded }));
    // If the user moves on before this answer arrives, the late answer is ignored.
    let cancelled = false;
    const seq = arrival.seq;
    getSite(address)
      .then((site) => {
        if (!cancelled) setLoaded({ seq, status: 'shown', site });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        // No site at this address is a normal outcome of browsing, not an error.
        if (error instanceof ApiError && error.code === ErrorCode.SITE_NOT_FOUND) {
          setLoaded({ seq, status: 'nowhere', address });
          return;
        }
        const message = error instanceof ApiError ? error.message : 'Something went wrong';
        setLoaded({ seq, status: 'error', message });
      });
    return () => {
      cancelled = true;
    };
  }, [needsLoad, address, entryId, arrival.seq]);

  const { people, person, choose, forget } = usePerson();
  const personId = person?.id ?? null;

  // Every arrival that resolves to a page or to Nowhere is a visit, including back and forward.
  // The answer says how often this person was here before: the brief's "In history" state is
  // derived from that, not stored.
  const [priorVisits, setPriorVisits] = useState<{ seq: number; count: number } | null>(null);
  const recordedSeq = useRef<number | null>(null);
  const resolved = view?.status === 'shown' || view?.status === 'nowhere';
  useEffect(() => {
    if (!resolved || address === null || personId === null) return;
    if (recordedSeq.current === arrival.seq) return;
    recordedSeq.current = arrival.seq;
    const seq = arrival.seq;
    recordVisit(personId, { address, via: arrival.via })
      .then((response) => setPriorVisits({ seq, count: response.priorVisitCount }))
      .catch((error: unknown) => {
        // The chosen person no longer exists: forget them so the picker falls back to someone real.
        if (error instanceof ApiError && error.code === ErrorCode.PERSON_NOT_FOUND) forget();
        // Any other failure is ignored on purpose: recording history must never get in the way
        // of reading, so the page stays as it is.
      });
  }, [resolved, address, personId, arrival.seq, arrival.via, forget]);
  const priorVisitCount = priorVisits?.seq === arrival.seq ? priorVisits.count : 0;

  function renderView() {
    if (!entry) {
      return (
        <section className="start">
          <h1>Small Web</h1>
          <p>Type an address above to start, for example tidepool.zz.</p>
        </section>
      );
    }
    if (!view) return null;
    if (view.status === 'nowhere') return <NowherePage address={view.address} />;
    if (view.status === 'error') {
      return (
        <section className="start" role="alert">
          <p>{view.message}</p>
          {address && (
            <button type="button" onClick={() => navigate({ kind: 'page', address }, 'typed')}>
              Try again
            </button>
          )}
        </section>
      );
    }
    return (
      <PageFrame
        // A fresh frame for every arrival, so it never shows the previous page's content.
        key={arrival.seq}
        title={view.site.title}
        safeHtml={view.site.html}
        restoreY={entry.scrollY}
        onNavigate={(target) =>
          navigate({ kind: 'page', address: normalizeAddress(target) }, 'link')
        }
        onScroll={(y) => saveScroll(entry.id, y)}
      />
    );
  }

  return (
    <div className="browser">
      <BrowserChrome
        address={address ?? ''}
        canGoBack={session.canGoBack}
        canGoForward={session.canGoForward}
        onBack={session.back}
        onForward={session.forward}
        onGo={(target) => navigate({ kind: 'page', address: target }, 'typed')}
      >
        <PersonPicker people={people} person={person} onChoose={choose} />
      </BrowserChrome>
      <StatusLine text={statusText(entry !== null, view, priorVisitCount)} />
      <main className="view">{renderView()}</main>
    </div>
  );
}

function statusText(hasEntry: boolean, view: LoadedView | null, priorVisitCount: number): string {
  if (!hasEntry) return 'Ready';
  if (!view) return 'Loading…';
  if (view.status === 'error') return 'Error';
  const state = view.status === 'shown' ? 'Shown' : 'Nowhere';
  if (priorVisitCount === 0) return state;
  const times = priorVisitCount === 1 ? 'once' : `${priorVisitCount} times`;
  return `${state} · In history: visited ${times} before`;
}
