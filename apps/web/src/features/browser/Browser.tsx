'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ErrorCode,
  normalizeAddress,
  type SearchResultView,
  type SiteView,
  type VisitView,
} from '@smallweb/shared';
import { HistoryPanel } from '@/features/history/HistoryPanel';
import { PublishForm } from '@/features/publish/PublishForm';
import { SearchResults } from '@/features/search/SearchResults';
import { ApiError, getSite, recordVisit, search } from '@/lib/api-client';
import { PersonPicker } from '@/features/people/PersonPicker';
import { usePerson } from '@/features/people/use-person';
import { BrowserChrome } from './BrowserChrome';
import { NowherePage } from './NowherePage';
import { PageFrame } from './PageFrame';
import { StatusLine } from './StatusLine';
import type { SessionEntry } from './session-history';
import { useSession, type Destination } from './use-session';

// What one arrival at an entry resolved to. `seq` ties it to that arrival: while it doesn't match
// the current arrival, the view is still loading.
type LoadedView =
  | { seq: number; status: 'shown'; site: SiteView }
  | { seq: number; status: 'nowhere'; address: string }
  | { seq: number; status: 'results'; query: string; results: SearchResultView[] }
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
  const query = entry?.kind === 'search' ? entry.query : null;
  const needsLoad = entry !== null && view === null;

  useEffect(() => {
    if (!needsLoad || entryId === null) return;
    const setLoaded = (loaded: LoadedView) =>
      setCache((previous) => ({ ...previous, [entryId]: loaded }));
    // If the user moves on before this answer arrives, the late answer is ignored.
    let cancelled = false;
    const seq = arrival.seq;

    const load: Promise<LoadedView> =
      query !== null
        ? search(query).then((page) => ({ seq, status: 'results', query, results: page.items }))
        : getSite(address ?? '').then((site) => ({ seq, status: 'shown', site }));

    load
      .then((loaded) => {
        if (!cancelled) setLoaded(loaded);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        // No site at this address is a normal outcome of browsing, not an error.
        if (error instanceof ApiError && error.code === ErrorCode.SITE_NOT_FOUND) {
          setLoaded({ seq, status: 'nowhere', address: address ?? '' });
          return;
        }
        const message = error instanceof ApiError ? error.message : 'Something went wrong';
        setLoaded({ seq, status: 'error', message });
      });
    return () => {
      cancelled = true;
    };
  }, [needsLoad, address, query, entryId, arrival.seq]);

  const { people, person, choose, forget } = usePerson();
  const personId = person?.id ?? null;

  // Every arrival that resolves to a page or to Nowhere is a visit, including back and forward.
  // The answer says how often this person was here before: the brief's "In history" state is
  // derived from that, not stored.
  const [priorVisits, setPriorVisits] = useState<{ seq: number; count: number } | null>(null);
  // Visits recorded in this tab, newest first, so an open history panel shows them immediately.
  const [recent, setRecent] = useState<{ personId: string; visits: VisitView[] } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  // The publish form is open for the arrival it was opened on; any navigation closes it.
  const [publishSeq, setPublishSeq] = useState<number | null>(null);
  const publishOpen = publishSeq === arrival.seq;
  const recordedSeq = useRef<number | null>(null);
  const resolved = view?.status === 'shown' || view?.status === 'nowhere';
  useEffect(() => {
    if (!resolved || address === null || personId === null) return;
    if (recordedSeq.current === arrival.seq) return;
    recordedSeq.current = arrival.seq;
    const seq = arrival.seq;
    recordVisit(personId, { address, via: arrival.via })
      .then((response) => {
        setPriorVisits({ seq, count: response.priorVisitCount });
        setRecent((previous) => ({
          personId,
          visits:
            previous?.personId === personId
              ? [response.visit, ...previous.visits]
              : [response.visit],
        }));
      })
      .catch((error: unknown) => {
        // The chosen person no longer exists: forget them so the picker falls back to someone real.
        if (error instanceof ApiError && error.code === ErrorCode.PERSON_NOT_FOUND) forget();
        // Any other failure is ignored on purpose: recording history must never get in the way
        // of reading, so the page stays as it is.
      });
  }, [resolved, address, personId, arrival.seq, arrival.via, forget]);
  const priorVisitCount = priorVisits?.seq === arrival.seq ? priorVisits.count : 0;

  function renderView() {
    if (publishOpen) {
      return (
        <PublishForm
          author={person}
          // Opening the new site is a navigation like any other, recorded as via publish.
          onPublished={(target) => navigate({ kind: 'page', address: target }, 'publish')}
          onPersonGone={forget}
          onCancel={() => setPublishSeq(null)}
        />
      );
    }
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
          <button type="button" onClick={() => navigate(destinationOf(entry), arrival.via)}>
            Try again
          </button>
        </section>
      );
    }
    if (view.status === 'results') {
      return (
        <SearchResults
          // Like the page frame: a fresh list per arrival, scrolled to where this entry was left.
          key={arrival.seq}
          query={view.query}
          results={view.results}
          restoreY={entry.scrollY}
          onOpen={(target) => navigate({ kind: 'page', address: target }, 'search')}
          onScroll={(y) => saveScroll(entry.id, y)}
        />
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
        query={query ?? ''}
        // A search is an entry of its own, so back from a result returns to the results.
        onSearch={(text) => navigate({ kind: 'search', query: text }, 'typed')}
      >
        <button
          type="button"
          aria-pressed={historyOpen}
          onClick={() => setHistoryOpen((open) => !open)}
        >
          History
        </button>
        <button
          type="button"
          aria-pressed={publishOpen}
          onClick={() => setPublishSeq(publishOpen ? null : arrival.seq)}
        >
          Publish
        </button>
        <PersonPicker people={people} person={person} onChoose={choose} />
      </BrowserChrome>
      <StatusLine text={statusText(entry !== null, view, priorVisitCount)} />
      <div className="body">
        <main className="view">{renderView()}</main>
        {historyOpen && personId && (
          <HistoryPanel
            // A new person gets a fresh panel that starts loading from the top.
            key={personId}
            personId={personId}
            recentVisits={recent?.personId === personId ? recent.visits : []}
            // Like a real browser's history page: opening an old entry is a new navigation,
            // so it drops anything forward of the current entry.
            onOpen={(target) => navigate({ kind: 'page', address: target }, 'history')}
          />
        )}
      </div>
    </div>
  );
}

function destinationOf(entry: SessionEntry): Destination {
  return entry.kind === 'page'
    ? { kind: 'page', address: entry.address }
    : { kind: 'search', query: entry.query };
}

function statusText(hasEntry: boolean, view: LoadedView | null, priorVisitCount: number): string {
  if (!hasEntry) return 'Ready';
  if (!view) return 'Loading…';
  if (view.status === 'error') return 'Error';
  if (view.status === 'results') {
    return `${view.results.length} result${view.results.length === 1 ? '' : 's'} for “${view.query}”`;
  }
  const state = view.status === 'shown' ? 'Shown' : 'Nowhere';
  if (priorVisitCount === 0) return state;
  const times = priorVisitCount === 1 ? 'once' : `${priorVisitCount} times`;
  return `${state} · In history: visited ${times} before`;
}
