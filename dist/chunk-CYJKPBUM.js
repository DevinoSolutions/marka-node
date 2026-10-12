import { V1_PATH_PREFIX, OPENAPI_API_KEY_HEADER, MarkaClient, trimTrailingSlashes, OPENAPI_SERVER_URL, MarkaApiError } from './chunk-QD6XJU25.js';
import { MCPServer } from '@mastra/mcp';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

var V1JsonValueSchema = z.lazy(
  () => z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(V1JsonValueSchema),
    z.record(z.string(), V1JsonValueSchema)
  ])
);
var V1IsoDateTimeSchema = z.iso.datetime();
var V1GeoLocationSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string(),
  postalCode: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional()
});
var V1MoneyBreakdownSchema = z.object({
  itemSubtotal: z.int(),
  shippingAmount: z.int(),
  taxAmount: z.int(),
  /** Always 0 on Marka — sellers are merchant of record and the marketplace fee is 0%. */
  applicationFeeAmount: z.int(),
  currency: z.string()
});
function v1MinorUnits(description) {
  return z.int().nonnegative().describe(description);
}
function v1NullableMinorUnits(description) {
  return z.int().nonnegative().nullable().describe(description);
}
var V1_IMAGE_URL_MESSAGE = "Must be an absolute http(s) URL with a host, e.g. https://cdn.example.com/photo.jpg (not a relative path, a protocol-relative //host/path, or a javascript:/data: URI).";
var V1ImageUrlSchema = z.string().regex(/^https?:\/\/[^\s/?#]\S*$/, { message: V1_IMAGE_URL_MESSAGE, abort: true }).refine(
  (value) => {
    try {
      return new URL(value).hostname !== "";
    } catch {
      return false;
    }
  },
  { message: V1_IMAGE_URL_MESSAGE }
);
var V1PackageDimensionsMmSchema = z.object({
  lengthMm: z.int().nonnegative(),
  widthMm: z.int().nonnegative(),
  heightMm: z.int().nonnegative()
});
var V1_DEFAULT_PAGE_SIZE = 50;
var V1_MAX_PAGE_SIZE = 100;
var V1PaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(V1_MAX_PAGE_SIZE).optional().describe(`Page size, 1-${V1_MAX_PAGE_SIZE}. Defaults to ${V1_DEFAULT_PAGE_SIZE}.`),
  offset: z.coerce.number().int().min(0).optional().describe("Number of records to skip. Defaults to 0.")
});
var V1PaginationFields = {
  limit: z.int().min(1).max(V1_MAX_PAGE_SIZE),
  offset: z.int().min(0),
  hasMore: z.boolean()
};
var V1ErrorSchema = z.object({
  /** Human-readable message. Never contains provider internals — see toApiError. */
  error: z.string(),
  /** Originating DomainError / Prisma code when one applies. */
  code: z.string().optional()
});

// ../shared/src/enums.ts
var LISTING_AUTHORITIES = ["MARKA", "EBAY", "ETSY", "SHOPIFY"];
var LISTING_STATUSES = [
  "draft",
  "active",
  "reserved",
  "sold",
  "paused",
  "removed"
];
var LISTING_CONDITIONS = [
  "new",
  "refurbished",
  "like_new",
  "good",
  "fair",
  "for_parts"
];
var INVENTORY_TYPES = ["unique", "multi_qty"];
var ORDER_RAILS = ["DIRECT", "CHECKOUT"];
var FULFILLMENT_MODES = ["PICKUP", "SHIPPING"];
var PROTECTION_TIERS = [
  "DIRECT_BASIC",
  "CHECKOUT_PICKUP",
  "CHECKOUT_SHIPPING",
  "VERIFIED_HIGH_RISK"
];
var ORDER_STATUSES = [
  "created",
  "checkout_pending",
  "payment_captured",
  "seller_accepted",
  "scheduled",
  "inspecting",
  "packing",
  "shipped",
  "delivered",
  "inspection_window",
  "completed",
  "abandoned",
  "cancelled",
  "refunded",
  "buyer_no_show",
  "seller_no_show",
  "rejected_at_pickup",
  "dispute_open"
];
var REVIEW_ELIGIBILITY_STATES = [
  "not_eligible",
  "completed_transaction_review",
  "seller_cancel_feedback",
  "structured_no_show_feedback",
  "resolution_only"
];
var DISPUTE_STATES = [
  "none",
  "open",
  "resolved",
  "chargeback_open",
  "chargeback_resolved"
];
var RISK_CATEGORIES = [
  "general",
  "phone",
  "tablet",
  "luxury",
  "collectible",
  "high_end_electronics"
];
var SELLER_SUBSCRIPTION_TIERS = ["free", "pro", "business"];
var ENTITLEMENT_FEATURES = [
  "api_write",
  "cross_post_oneway",
  "cross_post_bidirectional",
  "ai_unlimited",
  "custom_storefront",
  "editorial_spot"
];

// ../shared/src/api-contracts/me.ts
var V1UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string()
});
var V1PlanLimitsSchema = z.object({
  maxActiveListings: z.int().nonnegative().nullable().describe(
    "Max simultaneously-active listings; null means unlimited. Enforced at the publish transition, not at creation."
  ),
  aiCopilotRunsPerMonth: z.int().nonnegative().nullable().describe("AI copilot runs per month; null means unlimited."),
  apiRequestsPerMonth: z.int().nonnegative().describe(
    "ADVISORY, not currently enforced: the published monthly request allowance for the tier (0 on free, and finite on every tier). No monthly counter is metered against it today. The limit that IS enforced is a per-key burst budget of 1000 requests, whose window clears only after 60 consecutive seconds of idle time; exceeding it answers 429."
  )
});
var V1PlanSchema = z.object({
  tier: z.enum(SELLER_SUBSCRIPTION_TIERS).describe(
    'Effective tier. A seller with no subscription \u2014 or one that lapsed \u2014 resolves to "free".'
  ),
  entitlements: z.array(z.enum(ENTITLEMENT_FEATURES)).describe('Features the effective tier unlocks. Programmatic writes require "api_write".'),
  limits: V1PlanLimitsSchema
});
var V1MeResponseSchema = z.object({
  user: V1UserSchema,
  plan: V1PlanSchema
});

// ../shared/src/contracts.ts
var LISTING_TITLE_MAX_LENGTH = 200;
var DEFAULT_CATEGORY_PATH = "general";
var CATEGORY_PATH_MAX_LENGTH = 64;
var CATEGORY_PATH_PATTERN = /^[a-z0-9]+(?:[-/][a-z0-9]+)*$/;
var ALL_DIGITS_PATTERN = /^[0-9]+$/;
function isPlausibleCategoryPath(value) {
  if (!CATEGORY_PATH_PATTERN.test(value) || value.length > CATEGORY_PATH_MAX_LENGTH) return false;
  return !value.split("/").some((segment) => ALL_DIGITS_PATTERN.test(segment));
}
var CATEGORY_PATH_MESSAGE = 'Must be a lowercase slash-delimited taxonomy path such as "electronics/cameras" \u2014 never a numeric marketplace category id.';

// ../shared/src/api-contracts/listings.ts
var MADE_IN_COUNTRY_DESCRIPTION = "Country of manufacture as an ISO 3166-1 alpha-2 code (e.g. CA, DE), stored uppercase; null when not specified. Used as the item's origin country on international shipping labels (customs and duties).";
var V1MadeInCountryInputSchema = z.string().length(2).nullable().optional().describe(
  `${MADE_IN_COUNTRY_DESCRIPTION} A lowercase code is accepted and uppercased; an unknown code is rejected. On an update, null clears it and omitting the field leaves it unchanged.`
);
var V1ListingSchema = z.object({
  id: z.string(),
  sellerAccountId: z.string(),
  authority: z.enum(LISTING_AUTHORITIES),
  status: z.enum(LISTING_STATUSES),
  inventoryType: z.enum(INVENTORY_TYPES),
  quantityTotal: z.int().nonnegative(),
  quantityReserved: z.int().nonnegative(),
  categoryPath: z.string(),
  condition: z.enum(LISTING_CONDITIONS),
  title: z.string(),
  description: z.string(),
  attributes: V1JsonValueSchema,
  imageUrls: z.array(z.string()),
  brand: z.string().nullable(),
  gtin: z.string().nullable().describe("UPC, EAN, ISBN or other GTIN \u2014 digits only."),
  packageWeightGrams: z.int().nonnegative().nullable(),
  packageDimensionsMm: V1PackageDimensionsMmSchema.nullable(),
  madeInCountry: z.string().nullable().describe(MADE_IN_COUNTRY_DESCRIPTION),
  acceptsOffers: z.boolean(),
  autoAcceptOfferAmount: v1NullableMinorUnits(
    "Offers at or above this amount are auto-accepted. Integer minor units."
  ),
  price: v1MinorUnits("Integer minor units of `currency` (e.g. cents for USD)."),
  currency: z.string().describe("ISO 4217 currency code."),
  location: V1GeoLocationSchema,
  pickupEnabled: z.boolean(),
  shippingEnabled: z.boolean(),
  shippingProfileId: z.string().nullable(),
  shippingFlatAmount: v1NullableMinorUnits(
    "Flat per-order shipping charged at checkout. Integer minor units of `currency`."
  ),
  directEnabled: z.boolean().describe("Available on the DIRECT rail (in-person pickup, no Stripe)."),
  checkoutEnabled: z.boolean().describe("Available on the CHECKOUT rail (Stripe Connect payment)."),
  visibilityRadiusKm: z.number().positive().nullable(),
  riskCategory: z.enum(RISK_CATEGORIES),
  createdAt: V1IsoDateTimeSchema,
  updatedAt: V1IsoDateTimeSchema
});
var V1CreateListingRequestSchema = z.object({
  title: z.string().min(1).max(LISTING_TITLE_MAX_LENGTH),
  description: z.string(),
  price: v1MinorUnits("Integer minor units of `currency` (e.g. cents for USD)."),
  currency: z.string().length(3).optional().describe("ISO 4217 code. Defaults to the platform default currency."),
  // .regex before .refine on purpose: the pattern serializes into the OpenAPI document as a
  // machine-readable constraint, while the refine carries the numeric-segment and length clauses
  // the pattern cannot express. Both name themselves, so a 400 says which rule was broken.
  categoryPath: z.string().regex(CATEGORY_PATH_PATTERN, {
    message: "Must be lowercase alphanumeric parts joined by '-' or '/', with no leading or trailing separator."
  }).refine(isPlausibleCategoryPath, {
    message: CATEGORY_PATH_MESSAGE
  }).optional().describe(
    `Slash-delimited lowercase taxonomy path, e.g. "electronics/cameras" \u2014 never an external marketplace's numeric category id. Defaults to "${DEFAULT_CATEGORY_PATH}".`
  ),
  condition: z.enum(LISTING_CONDITIONS).optional().describe('Defaults to "good".'),
  inventoryType: z.enum(INVENTORY_TYPES).optional().describe('Defaults to "unique".'),
  quantityTotal: z.int().positive().optional().describe("Defaults to 1."),
  attributes: V1JsonValueSchema.optional(),
  location: V1GeoLocationSchema.optional(),
  madeInCountry: V1MadeInCountryInputSchema,
  pickupEnabled: z.boolean().optional(),
  shippingEnabled: z.boolean().optional(),
  shippingProfileId: z.string().nullable().optional(),
  shippingFlatAmount: v1NullableMinorUnits(
    "Integer minor units. Must be greater than 0 before a shipping-enabled listing can be published."
  ).optional(),
  directEnabled: z.boolean().optional(),
  checkoutEnabled: z.boolean().optional(),
  visibilityRadiusKm: z.number().positive().nullable().optional(),
  riskCategory: z.enum(RISK_CATEGORIES).optional().describe('Defaults to "general".')
}).strict();
var V1UpdateListingRequestSchema = z.object({
  title: z.string().min(1).max(LISTING_TITLE_MAX_LENGTH).optional(),
  description: z.string().optional(),
  price: v1MinorUnits("Integer minor units of the listing's currency.").optional(),
  imageUrls: z.array(V1ImageUrlSchema).optional().describe(
    "Absolute http(s) image URLs in display order; the first is the cover. Replaces the whole list. Only URLs under Marka's media storage are linked to the listing's photo assets (the cover image on market and seller pages); any other host is stored but not shown."
  ),
  madeInCountry: V1MadeInCountryInputSchema,
  pickupEnabled: z.boolean().optional(),
  shippingEnabled: z.boolean().optional(),
  directEnabled: z.boolean().optional(),
  checkoutEnabled: z.boolean().optional()
}).strict();
var V1ListingIdParamsSchema = z.object({
  id: z.string().min(1).describe("Listing id.")
});
var V1ListListingsQuerySchema = V1PaginationQuerySchema;
var V1ListListingsResponseSchema = z.object({
  listings: z.array(V1ListingSchema),
  ...V1PaginationFields
});
var V1ListingResponseSchema = z.object({
  listing: V1ListingSchema
});
var V1ListingSummarySchema = V1ListingSchema.pick({
  id: true,
  sellerAccountId: true,
  title: true,
  categoryPath: true,
  condition: true,
  price: true,
  currency: true,
  imageUrls: true,
  pickupEnabled: true,
  shippingEnabled: true,
  location: true,
  createdAt: true
});
var V1_SEARCH_SCAN_CEILING = 200;
var V1SearchQuerySchema = z.object({
  q: z.string().optional().describe("Free-text query. Omit to browse without a text filter."),
  pickup: z.stringbool().optional().describe("Only listings offering local pickup."),
  shipping: z.stringbool().optional().describe("Only listings offering shipping."),
  city: z.string().optional().describe(
    "City to anchor the radius filter on; must match a city present in the catalogue. A city that matches none \u2014 including one whose listings have all sold \u2014 returns no results, rather than silently dropping the location filter and answering with the whole country."
  ),
  radiusKm: z.coerce.number().positive().optional().describe("Search radius around `city`, in kilometres. Ignored unless `city` is supplied."),
  minPrice: z.coerce.number().int().nonnegative().optional().describe("Lowest acceptable price, in integer minor units."),
  maxPrice: z.coerce.number().int().nonnegative().optional().describe("Highest acceptable price, in integer minor units."),
  ...V1PaginationQuerySchema.shape,
  // Overrides the shared pagination description: on search, `offset` has a hard end that the
  // generic "records to skip" wording would not warn a paging client about.
  offset: V1PaginationQuerySchema.shape.offset.describe(
    `Number of results to skip. Defaults to 0. Search covers the ${V1_SEARCH_SCAN_CEILING} most recently listed active listings, so an offset at or past that ceiling returns an empty page \u2014 it does not reach older items.`
  )
});
var V1SearchResponseSchema = z.object({
  /** Echo of the query text that produced these results ("" when none was supplied). */
  query: z.string(),
  results: z.array(V1ListingSummarySchema).describe(
    `Ranked results, best first, drawn from the ${V1_SEARCH_SCAN_CEILING} most recently listed active listings.`
  ),
  ...V1PaginationFields
});
var V1CategorySchema = z.object({
  categoryPath: z.string(),
  label: z.string(),
  count: z.int().nonnegative()
});
var V1_CATEGORIES_MAX_LIMIT = 50;
var V1ListCategoriesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(V1_CATEGORIES_MAX_LIMIT).optional().describe(
    `How many categories to return, 1-${V1_CATEGORIES_MAX_LIMIT}. Defaults to ${V1_CATEGORIES_MAX_LIMIT}, which returns the whole set unless more than ${V1_CATEGORIES_MAX_LIMIT} categories carry active listings \u2014 there is no second page, so a lower limit only truncates the tail, it never surfaces different categories.`
  )
});
var V1ListCategoriesResponseSchema = z.object({
  categories: z.array(V1CategorySchema)
});
var CheckoutShippingAddressSchema = z.object({
  line1: z.string().nullable(),
  line2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postal_code: z.string().nullable(),
  country: z.string().nullable()
});
var CheckoutShippingDetailsSchema = z.object({
  name: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: CheckoutShippingAddressSchema
});
z.object({
  name: z.string().nullish(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  address: z.object({
    line1: z.string().nullish(),
    line2: z.string().nullish(),
    city: z.string().nullish(),
    state: z.string().nullish(),
    postal_code: z.string().nullish(),
    country: z.string().nullish()
  })
});

// ../shared/src/api-contracts/orders.ts
var V1OrderSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  buyerId: z.string(),
  sellerAccountId: z.string(),
  connectedAccountId: z.string().nullable(),
  quantity: z.int().positive(),
  rail: z.enum(ORDER_RAILS),
  fulfillmentMode: z.enum(FULFILLMENT_MODES),
  protectionTier: z.enum(PROTECTION_TIERS),
  status: z.enum(ORDER_STATUSES),
  listingSnapshot: V1ListingSchema.describe(
    "Immutable copy of the listing as it was when the order was placed."
  ),
  priceSnapshot: V1MoneyBreakdownSchema.describe("Immutable price breakdown, integer minor units."),
  stripeCheckoutSessionId: z.string().nullable(),
  checkoutShippingDetails: CheckoutShippingDetailsSchema.nullable().describe(
    "Buyer-supplied shipping contact from Stripe Checkout: name, email, phone and the postal address (Stripe field names, e.g. `postal_code`), which the seller needs to buy a shipping label. Contains personal data: handle accordingly and do not log it. Null on the DIRECT (pickup) rail and on non-shipping orders."
  ),
  paymentId: z.string().nullable(),
  pickupSessionId: z.string().nullable(),
  shipmentId: z.string().nullable(),
  reviewEligibilityState: z.enum(REVIEW_ELIGIBILITY_STATES),
  disputeState: z.enum(DISPUTE_STATES),
  createdAt: V1IsoDateTimeSchema,
  updatedAt: V1IsoDateTimeSchema
});
var V1OrderIdParamsSchema = z.object({
  id: z.string().min(1).describe("Order id.")
});
var V1ListOrdersQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional().describe("Restrict to a single order status. Omit for all statuses."),
  ...V1PaginationQuerySchema.shape
});
var V1ListOrdersResponseSchema = z.object({
  orders: z.array(V1OrderSchema),
  ...V1PaginationFields
});
var V1OrderResponseSchema = z.object({
  order: V1OrderSchema
});

// ../shared/src/api-contracts/routes.ts
function errorResponses(...statuses) {
  return Object.fromEntries(statuses.map((status) => [status, V1ErrorSchema]));
}
[
  {
    operationId: "getMe",
    path: "/v1/me",
    method: "get",
    summary: "Get the authenticated account and its plan",
    tags: ["Account"],
    security: "apiKey",
    request: {},
    responses: { 200: V1MeResponseSchema, ...errorResponses(401, 429) }
  },
  {
    operationId: "listListings",
    path: "/v1/listings",
    method: "get",
    summary: "List your listings",
    tags: ["Listings"],
    security: "apiKey",
    request: { query: V1ListListingsQuerySchema },
    responses: { 200: V1ListListingsResponseSchema, ...errorResponses(400, 401, 429) }
  },
  {
    operationId: "createListing",
    path: "/v1/listings",
    method: "post",
    summary: "Create a draft listing",
    tags: ["Listings"],
    security: "apiKey",
    request: { body: V1CreateListingRequestSchema },
    responses: { 201: V1ListingResponseSchema, ...errorResponses(400, 401, 402, 403, 429) }
  },
  {
    operationId: "getListing",
    path: "/v1/listings/{id}",
    method: "get",
    summary: "Get a listing by id",
    tags: ["Listings"],
    security: "apiKey",
    request: { params: V1ListingIdParamsSchema },
    responses: { 200: V1ListingResponseSchema, ...errorResponses(401, 404, 429) }
  },
  {
    operationId: "updateListing",
    path: "/v1/listings/{id}",
    method: "patch",
    summary: "Update listing fields",
    tags: ["Listings"],
    security: "apiKey",
    request: { params: V1ListingIdParamsSchema, body: V1UpdateListingRequestSchema },
    responses: { 200: V1ListingResponseSchema, ...errorResponses(400, 401, 402, 403, 404, 429) }
  },
  {
    operationId: "publishListing",
    path: "/v1/listings/{id}/publish",
    method: "post",
    summary: "Publish a draft listing",
    tags: ["Listings"],
    security: "apiKey",
    request: { params: V1ListingIdParamsSchema },
    responses: { 200: V1ListingResponseSchema, ...errorResponses(400, 401, 402, 403, 404, 429) }
  },
  {
    operationId: "search",
    path: "/v1/search",
    method: "get",
    summary: `Search the ${V1_SEARCH_SCAN_CEILING} most recently listed active listings`,
    tags: ["Search"],
    security: "apiKey",
    request: { query: V1SearchQuerySchema },
    responses: { 200: V1SearchResponseSchema, ...errorResponses(400, 401, 429) }
  },
  {
    operationId: "listCategories",
    path: "/v1/categories",
    method: "get",
    summary: "List active listing categories",
    tags: ["Search"],
    security: "apiKey",
    request: { query: V1ListCategoriesQuerySchema },
    responses: { 200: V1ListCategoriesResponseSchema, ...errorResponses(400, 401, 429) }
  },
  {
    operationId: "listOrders",
    path: "/v1/orders",
    method: "get",
    summary: "List orders on your listings",
    tags: ["Orders"],
    security: "apiKey",
    request: { query: V1ListOrdersQuerySchema },
    responses: { 200: V1ListOrdersResponseSchema, ...errorResponses(400, 401, 429) }
  },
  {
    operationId: "getOrder",
    path: "/v1/orders/{id}",
    method: "get",
    summary: "Get an order by id",
    tags: ["Orders"],
    security: "apiKey",
    request: { params: V1OrderIdParamsSchema },
    responses: { 200: V1OrderResponseSchema, ...errorResponses(401, 404, 429) }
  }
];
var V1_COMPONENT_SCHEMAS = {
  Error: V1ErrorSchema,
  IsoDateTime: V1IsoDateTimeSchema,
  JsonValue: V1JsonValueSchema,
  GeoLocation: V1GeoLocationSchema,
  MoneyBreakdown: V1MoneyBreakdownSchema,
  PackageDimensionsMm: V1PackageDimensionsMmSchema,
  Listing: V1ListingSchema,
  ListingSummary: V1ListingSummarySchema,
  CreateListingRequest: V1CreateListingRequestSchema,
  UpdateListingRequest: V1UpdateListingRequestSchema,
  ListListingsResponse: V1ListListingsResponseSchema,
  ListingResponse: V1ListingResponseSchema,
  SearchResponse: V1SearchResponseSchema,
  Category: V1CategorySchema,
  ListCategoriesResponse: V1ListCategoriesResponseSchema,
  Order: V1OrderSchema,
  ListOrdersResponse: V1ListOrdersResponseSchema,
  OrderResponse: V1OrderResponseSchema,
  User: V1UserSchema,
  PlanLimits: V1PlanLimitsSchema,
  Plan: V1PlanSchema,
  MeResponse: V1MeResponseSchema
};
new Map(
  Object.entries(V1_COMPONENT_SCHEMAS).map(([name, schema]) => [schema, name])
);

// package.json
var version = "0.2.1";

// src/mcp.ts
var MCP_HTTP_PATH = `${V1_PATH_PREFIX}/mcp`;
var MARKA_MCP_STDIO_BIN = "marka-mcp-stdio";
function normalizeOrigin(baseUrl) {
  return trimTrailingSlashes(baseUrl ?? OPENAPI_SERVER_URL);
}
function getMcpServerConfig(options) {
  const origin = normalizeOrigin(options.baseUrl);
  const [command = MARKA_MCP_STDIO_BIN, ...args] = options.bridgeCommand ?? [];
  return {
    http: {
      mcpServers: {
        marka: {
          type: "http",
          url: `${origin}${MCP_HTTP_PATH}`,
          headers: { [OPENAPI_API_KEY_HEADER]: options.apiKey }
        }
      }
    },
    claudeDesktop: {
      mcpServers: {
        marka: {
          command,
          args,
          env: {
            MARKA_API_KEY: options.apiKey,
            ...options.baseUrl === void 0 ? {} : { MARKA_BASE_URL: origin }
          }
        }
      }
    }
  };
}
function getMcpOAuthServerConfig(options = {}) {
  return {
    mcpServers: {
      marka: { type: "http", url: `${normalizeOrigin(options.baseUrl)}${MCP_HTTP_PATH}` }
    }
  };
}
var createListingInput = V1CreateListingRequestSchema.pick({
  title: true,
  description: true,
  price: true,
  currency: true,
  categoryPath: true,
  quantityTotal: true,
  pickupEnabled: true,
  shippingEnabled: true,
  shippingFlatAmount: true,
  directEnabled: true,
  checkoutEnabled: true
});
var updateListingInput = V1UpdateListingRequestSchema.pick({
  title: true,
  description: true,
  price: true,
  pickupEnabled: true,
  shippingEnabled: true,
  directEnabled: true,
  checkoutEnabled: true
}).extend({ id: z.string().min(1).describe("The listing id.") });
function buildTools(client) {
  return {
    search_listings: createTool({
      id: "search_listings",
      description: "Search active Marka listings by text, location, price band and fulfilment options. Prices are integer minor units of the returned currency.",
      inputSchema: z.object({
        q: z.string().optional().describe("Free-text query. Omit to browse."),
        city: z.string().optional().describe("City to anchor a radius search on."),
        radiusKm: z.number().positive().optional().describe("Radius around `city`, in km."),
        pickup: z.boolean().optional().describe("Only listings offering local pickup."),
        shipping: z.boolean().optional().describe("Only listings offering shipping."),
        minPrice: z.number().int().nonnegative().optional().describe("Integer minor units."),
        maxPrice: z.number().int().nonnegative().optional().describe("Integer minor units."),
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional()
      }),
      execute: async (inputData) => client.search(inputData)
    }),
    get_listing: createTool({
      id: "get_listing",
      description: "Fetch one listing by id. Answers `{ found: false }` when there is no such id.",
      inputSchema: z.object({ id: z.string().describe("The listing id.") }),
      execute: async (inputData) => {
        try {
          const { listing } = await client.getListing(inputData.id);
          return { found: true, listing };
        } catch (error) {
          if (error instanceof MarkaApiError && error.status === 404) return { found: false };
          throw error;
        }
      }
    }),
    list_categories: createTool({
      id: "list_categories",
      description: "List the categories active listings are filed under, most populated first.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(50).optional()
      }),
      execute: async (inputData) => client.listCategories(inputData)
    }),
    get_me: createTool({
      id: "get_me",
      description: "Identify the account behind the API key and report its plan. Check for the `api_write` entitlement before attempting a write: without it, writes answer 402.",
      inputSchema: z.object({}),
      execute: async () => client.getMe()
    }),
    create_listing: createTool({
      id: "create_listing",
      description: "Create a DRAFT listing. Drafts are not visible to buyers until they are published, which is a separate step this server deliberately does not expose. `price` is integer minor units (e.g. 4500 = $45.00). To leave the draft publishable, set at least one of pickupEnabled/shippingEnabled AND at least one of directEnabled (in-person handoff, no card) / checkoutEnabled (card payment, requires the seller's Stripe account); every one of these defaults to false. Shipping additionally needs a shippingFlatAmount above 0.",
      inputSchema: createListingInput,
      execute: async (inputData) => client.createListing(inputData)
    }),
    update_listing: createTool({
      id: "update_listing",
      description: "Update fields on an existing listing. Does not change its lifecycle state \u2014 publishing is a separate step this server deliberately does not expose. Note that the update contract carries no shippingFlatAmount, so a listing that needs one must be given it at creation or edited in the web app.",
      inputSchema: updateListingInput,
      execute: async (inputData) => {
        const { id, ...fields } = inputData;
        return client.updateListing(id, fields);
      }
    })
    // No publish_listing — publishing requires in-app HITL confirmation.
  };
}
function createMarkaMcpServer(options) {
  const client = new MarkaClient({
    apiKey: options.apiKey,
    baseUrl: options.baseUrl,
    fetch: options.fetch
  });
  return new MCPServer({
    id: "marka",
    name: "Marka",
    version,
    description: "Search Marka listings and draft new ones through the public Marka API.",
    tools: buildTools(client)
  });
}

export { MARKA_MCP_STDIO_BIN, createMarkaMcpServer, getMcpOAuthServerConfig, getMcpServerConfig };
//# sourceMappingURL=chunk-CYJKPBUM.js.map
//# sourceMappingURL=chunk-CYJKPBUM.js.map