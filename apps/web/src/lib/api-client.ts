import type {
  ApiErrorBody,
  CreateSiteRequest,
  CreateVisitRequest,
  CreateVisitResponse,
  Page,
  PersonView,
  SearchResultView,
  SiteView,
  VisitView,
} from '@smallweb/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

// Web-only code for "the server could not be reached at all". Every other code comes from the API.
const NETWORK_ERROR = 'NETWORK_ERROR';

// Every failed request becomes an ApiError, so the UI checks `error.code` in one consistent way.
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
    public readonly details?: { field: string; message: string }[],
  ) {
    super(message);
  }
}

// The one place that calls fetch. Returns the parsed JSON, or throws an ApiError.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    // fetch only rejects when no response arrived (server down, offline).
    throw new ApiError(NETWORK_ERROR, 0, "Can't reach the server");
  }

  if (!response.ok) {
    const body = (await response.json()) as ApiErrorBody;
    throw new ApiError(body.error.code, response.status, body.error.message, body.error.details);
  }
  return (await response.json()) as T;
}

export function getSite(address: string): Promise<SiteView> {
  return request<SiteView>(`/sites/${encodeURIComponent(address)}`);
}

export function getPeople(): Promise<Page<PersonView>> {
  return request<Page<PersonView>>('/people');
}

export function createSite(site: CreateSiteRequest): Promise<SiteView> {
  return request<SiteView>('/sites', { method: 'POST', body: JSON.stringify(site) });
}

export function search(query: string): Promise<Page<SearchResultView>> {
  return request<Page<SearchResultView>>(`/search?q=${encodeURIComponent(query)}`);
}

// One page of a person's history, newest first. Pass the previous page's nextCursor for the next.
export function getVisits(personId: string, cursor: string | null): Promise<Page<VisitView>> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return request<Page<VisitView>>(`/people/${encodeURIComponent(personId)}/visits${query}`);
}

export function recordVisit(
  personId: string,
  visit: CreateVisitRequest,
): Promise<CreateVisitResponse> {
  return request<CreateVisitResponse>(`/people/${encodeURIComponent(personId)}/visits`, {
    method: 'POST',
    body: JSON.stringify(visit),
  });
}
