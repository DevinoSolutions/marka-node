// ../shared/src/trailing-slashes.ts
function trimTrailingSlashes(s) {
  let end = s.length;
  while (end > 0 && s.charCodeAt(end - 1) === 47) end -= 1;
  return end === s.length ? s : s.slice(0, end);
}

// ../shared/src/wire-lite.ts
var OPENAPI_SERVER_URL = "https://joinmarka.com";
var OPENAPI_API_KEY_HEADER = "x-api-key";
var V1_PATH_PREFIX = "/api";

// src/errors.ts
var MarkaApiError = class extends Error {
  /** HTTP status of the response. */
  status;
  /** Envelope `code`, when the response carried one. */
  code;
  constructor(status, message, code) {
    super(message);
    this.name = "MarkaApiError";
    this.status = status;
    this.code = code;
  }
};
var MarkaNetworkError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "MarkaNetworkError";
  }
};

// src/client.ts
function buildQueryString(query) {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(query)) {
    if (value === void 0) continue;
    params.set(name, String(value));
  }
  const serialized = params.toString();
  return serialized === "" ? "" : `?${serialized}`;
}
function isErrorEnvelope(payload) {
  if (typeof payload !== "object" || payload === null) return false;
  const candidate = payload;
  if (typeof candidate.error !== "string") return false;
  return candidate.code === void 0 || typeof candidate.code === "string";
}
var MarkaClient = class {
  #apiKey;
  #baseUrl;
  #fetch;
  constructor(options) {
    this.#apiKey = options.apiKey;
    this.#baseUrl = trimTrailingSlashes(options.baseUrl ?? OPENAPI_SERVER_URL);
    const injected = options.fetch;
    this.#fetch = injected ?? ((input, init) => globalThis.fetch(input, init));
  }
  /** Get the authenticated account and its plan. */
  getMe() {
    return this.#request("get", "/v1/me", {});
  }
  /** List your listings, newest first. */
  listListings(query) {
    return this.#request("get", "/v1/listings", { query });
  }
  /** Create a draft listing. Requires the `api_write` entitlement on a key-authenticated call. */
  createListing(body) {
    return this.#request("post", "/v1/listings", { body });
  }
  /** Get one of your listings by id. */
  getListing(id) {
    return this.#request("get", `/v1/listings/${encodeURIComponent(id)}`, {});
  }
  /** Update listing fields. Lifecycle transitions go through {@link publishListing}. */
  updateListing(id, body) {
    return this.#request("patch", `/v1/listings/${encodeURIComponent(id)}`, { body });
  }
  /** Publish a draft listing, running the domain's activation guards. */
  publishListing(id) {
    return this.#request("post", `/v1/listings/${encodeURIComponent(id)}/publish`, {});
  }
  /** Search active listings across the marketplace. */
  search(query) {
    return this.#request("get", "/v1/search", { query });
  }
  /** List the categories active listings are filed under, most populated first. */
  listCategories(query) {
    return this.#request("get", "/v1/categories", { query });
  }
  /** List orders placed on your listings, newest first. */
  listOrders(query) {
    return this.#request("get", "/v1/orders", { query });
  }
  /** Get one order on your listings by id. */
  getOrder(id) {
    return this.#request("get", `/v1/orders/${encodeURIComponent(id)}`, {});
  }
  /**
   * The one place a request is made. `path` is the contract path (`/v1/…`); the `/api` prefix,
   * the key header, and the error contract are applied here so no method restates them.
   */
  async #request(method, path, options) {
    const url = `${this.#baseUrl}${V1_PATH_PREFIX}${path}${buildQueryString(options.query)}`;
    const hasBody = options.body !== void 0;
    const init = {
      method: method.toUpperCase(),
      headers: {
        [OPENAPI_API_KEY_HEADER]: this.#apiKey,
        accept: "application/json",
        ...hasBody ? { "content-type": "application/json" } : {}
      },
      ...hasBody ? { body: JSON.stringify(options.body) } : {}
    };
    let response;
    let text;
    try {
      response = await this.#fetch(url, init);
      text = await response.text();
    } catch (error) {
      throw new MarkaNetworkError(
        `${method.toUpperCase()} ${path} failed: no complete response from the API.`,
        { cause: error }
      );
    }
    if (!response.ok) throw toApiError(response, text);
    const payload = parseJson(text);
    if (payload === void 0) {
      throw new MarkaApiError(
        response.status,
        "The API returned a success status with a body that is not JSON.",
        "invalid_response"
      );
    }
    return payload;
  }
};
function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return void 0;
  }
}
function toApiError(response, text) {
  const payload = parseJson(text);
  if (isErrorEnvelope(payload)) {
    return payload.code === void 0 ? new MarkaApiError(response.status, payload.error) : new MarkaApiError(response.status, payload.error, payload.code);
  }
  const statusText = response.statusText === "" ? "" : ` ${response.statusText}`;
  return new MarkaApiError(
    response.status,
    `Request failed with status ${response.status}${statusText}.`
  );
}

export { MarkaApiError, MarkaClient, MarkaNetworkError, OPENAPI_API_KEY_HEADER, OPENAPI_SERVER_URL, V1_PATH_PREFIX, trimTrailingSlashes };
//# sourceMappingURL=chunk-QD6XJU25.js.map
//# sourceMappingURL=chunk-QD6XJU25.js.map