import { V1MeResponse, V1ListListingsQuery, V1ListListingsResponse, V1CreateListingRequest, V1ListingResponse, V1UpdateListingRequest, V1SearchQuery, V1SearchResponse, V1ListCategoriesQuery, V1ListCategoriesResponse, V1ListOrdersQuery, V1ListOrdersResponse, V1OrderResponse } from './_shared.js';

interface MarkaClientOptions {
    /** An API key created in Marka account settings (`mk_…`). Sent on every request. */
    readonly apiKey: string;
    /**
     * API **origin** — scheme and host only, e.g. `http://localhost:3001`. The `/api` mount point
     * (`V1_PATH_PREFIX`) and the `/v1/…` contract path are appended by the client, so do NOT include
     * either here. Defaults to production; point it at a local web app to develop against it.
     */
    readonly baseUrl?: string | undefined;
    /** Injectable transport. Defaults to the runtime's global `fetch`. */
    readonly fetch?: typeof globalThis.fetch | undefined;
}
declare class MarkaClient {
    #private;
    constructor(options: MarkaClientOptions);
    /** Get the authenticated account and its plan. */
    getMe(): Promise<V1MeResponse>;
    /** List your listings, newest first. */
    listListings(query?: V1ListListingsQuery): Promise<V1ListListingsResponse>;
    /** Create a draft listing. Requires the `api_write` entitlement on a key-authenticated call. */
    createListing(body: V1CreateListingRequest): Promise<V1ListingResponse>;
    /** Get one of your listings by id. */
    getListing(id: string): Promise<V1ListingResponse>;
    /** Update listing fields. Lifecycle transitions go through {@link publishListing}. */
    updateListing(id: string, body: V1UpdateListingRequest): Promise<V1ListingResponse>;
    /** Publish a draft listing, running the domain's activation guards. */
    publishListing(id: string): Promise<V1ListingResponse>;
    /** Search active listings across the marketplace. */
    search(query?: V1SearchQuery): Promise<V1SearchResponse>;
    /** List the categories active listings are filed under, most populated first. */
    listCategories(query?: V1ListCategoriesQuery): Promise<V1ListCategoriesResponse>;
    /** List orders placed on your listings, newest first. */
    listOrders(query?: V1ListOrdersQuery): Promise<V1ListOrdersResponse>;
    /** Get one order on your listings by id. */
    getOrder(id: string): Promise<V1OrderResponse>;
}

/**
 * The two failure modes an SDK call has. Both are thrown, never returned, so a caller who only
 * writes the happy path cannot silently proceed on a failed request.
 *
 * The split is deliberate: a `MarkaApiError` means the API answered and said no — it carries the
 * status and code a caller branches on. A `MarkaNetworkError` means the request never produced an
 * answer at all (DNS, TLS, timeout, aborted socket), which is an operational condition with no
 * status to reason about and is usually worth retrying.
 */
/**
 * A non-2xx answer from `/api/v1`, carrying the surface's one error envelope.
 *
 * `message` is the envelope's `error` string verbatim — it is written for the caller and never
 * contains provider internals (see `toApiError` in apps/web/lib/api-errors.ts).
 *
 * `code` is the envelope's optional refinement, NOT an enum: it carries whichever DomainError
 * code fired (`"listing.authority_locked"`, …) plus the API-level codes the v1 layer adds
 * (`"entitlement_required"` on 402, `"invalid_request"` on 400, `"rate_limited"` on 429). New
 * codes appear without a contract change, so branch on `status` first and treat `code` as the
 * refinement.
 *
 * One code is raised by the SDK rather than the server: `"invalid_response"`, for a 2xx whose body
 * is not JSON at all. It carries the response's own status, which is why it is this type and not a
 * third one — the API answered, it just did not answer with the contract.
 */
declare class MarkaApiError extends Error {
    /** HTTP status of the response. */
    readonly status: number;
    /** Envelope `code`, when the response carried one. */
    readonly code: string | undefined;
    constructor(status: number, message: string, code?: string);
}
/**
 * A request that never got an answer. The original transport failure is preserved on `cause`
 * rather than flattened into the message, so a caller's logging still sees the real reason.
 */
declare class MarkaNetworkError extends Error {
    constructor(message: string, options: {
        cause: unknown;
    });
}

export { MarkaApiError, MarkaClient, type MarkaClientOptions, MarkaNetworkError };
