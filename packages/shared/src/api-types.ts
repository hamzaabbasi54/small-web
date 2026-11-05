/** Largest site HTML the API accepts on publish. */
export const MAX_HTML_BYTES = 100_000;

/** A list response. `nextCursor` is null when there are no more items. */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface PersonView {
  id: string;
  name: string;
}

export interface SiteView {
  address: string;
  title: string;
  /** Already sanitized on the server. */
  html: string;
  author: PersonView;
  createdAt: string;
}

export interface CreateSiteRequest {
  address: string;
  title: string;
  html: string;
  authorId: string;
}

export interface SearchResultView {
  address: string;
  title: string;
  snippet: string;
  author: PersonView;
}

/** How a person arrived at an address. */
export type VisitVia = 'typed' | 'link' | 'back' | 'forward' | 'history' | 'search' | 'publish';

export interface VisitView {
  id: string;
  address: string;
  /** Site title at visit time; null when the address led nowhere. */
  title: string | null;
  found: boolean;
  via: VisitVia;
  visitedAt: string;
}

export interface CreateVisitRequest {
  address: string;
  via: VisitVia;
}

export interface CreateVisitResponse {
  visit: VisitView;
  /** Earlier visits by this person to the same address. */
  priorVisitCount: number;
}
