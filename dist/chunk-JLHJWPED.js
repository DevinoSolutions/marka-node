import { z } from 'zod';
export { z } from 'zod';

// ../shared/src/api-contracts/listings.ts

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
  "seller_cancelled",
  "buyer_no_show",
  "seller_no_show",
  "rejected_at_pickup",
  "delivery_issue",
  "dispute_open",
  "resolved"
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

// ../shared/src/api-contracts/listings.ts
var V1ListingSchema = z.object({
  id: z.string(),
  sellerAccountId: z.string(),
  authority: z.enum(LISTING_AUTHORITIES),
  status: z.enum(LISTING_STATUSES),
  inventoryType: z.enum(INVENTORY_TYPES),
  quantityTotal: z.int().nonnegative(),
  quantityReserved: z.int().nonnegative(),
  categoryId: z.string(),
  condition: z.enum(LISTING_CONDITIONS),
  title: z.string(),
  description: z.string(),
  attributesJson: V1JsonValueSchema,
  imageUrls: z.array(z.string()),
  brand: z.string().nullable(),
  gtin: z.string().nullable().describe("UPC, EAN, ISBN or other GTIN \u2014 digits only."),
  packageWeightGrams: z.int().nonnegative().nullable(),
  packageDimensionsMm: V1PackageDimensionsMmSchema.nullable(),
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
  title: z.string().min(1),
  description: z.string(),
  price: v1MinorUnits("Integer minor units of `currency` (e.g. cents for USD)."),
  currency: z.string().length(3).optional().describe("ISO 4217 code. Defaults to the platform default currency."),
  categoryId: z.string().optional().describe('Defaults to "general".'),
  condition: z.enum(LISTING_CONDITIONS).optional().describe('Defaults to "good".'),
  inventoryType: z.enum(INVENTORY_TYPES).optional().describe('Defaults to "unique".'),
  quantityTotal: z.int().positive().optional().describe("Defaults to 1."),
  attributesJson: V1JsonValueSchema.optional(),
  location: V1GeoLocationSchema.optional(),
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
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: v1MinorUnits("Integer minor units of the listing's currency.").optional(),
  imageUrls: z.array(z.string()).optional(),
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
var V1ErrorSchema = z.object({
  /** Human-readable message. Never contains provider internals — see toApiError. */
  error: z.string(),
  /** Originating DomainError / Prisma code when one applies. */
  code: z.string().optional()
});
var V1ListingSummarySchema = V1ListingSchema.pick({
  id: true,
  sellerAccountId: true,
  title: true,
  categoryId: true,
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
  categoryId: z.string(),
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
  listingSnapshotJson: V1ListingSchema.describe(
    "Immutable copy of the listing as it was when the order was placed."
  ),
  priceSnapshotJson: V1MoneyBreakdownSchema.describe(
    "Immutable price breakdown, integer minor units."
  ),
  stripeCheckoutSessionId: z.string().nullable(),
  checkoutShippingDetailsJson: V1JsonValueSchema.nullable().describe(
    "Buyer-supplied shipping contact and address from Stripe Checkout \u2014 typically name, email, phone and postal address, which the seller needs to buy a shipping label. Contains personal data: handle accordingly and do not log it. Null on the DIRECT (pickup) rail."
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

// ../shared/src/api-contracts/routes.ts
var V1_PATH_PREFIX = "/api";
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
var OPENAPI_SERVER_URL = "https://joinmarka.com";
var OPENAPI_API_KEY_HEADER = "x-api-key";
new Map(
  Object.entries(V1_COMPONENT_SCHEMAS).map(([name, schema]) => [schema, name])
);

// ../shared/src/countries.ts
var COUNTRIES = [
  { code: "AD", nameEn: "Andorra" },
  { code: "AE", nameEn: "United Arab Emirates" },
  { code: "AF", nameEn: "Afghanistan" },
  { code: "AG", nameEn: "Antigua and Barbuda" },
  { code: "AI", nameEn: "Anguilla" },
  { code: "AL", nameEn: "Albania" },
  { code: "AM", nameEn: "Armenia" },
  { code: "AO", nameEn: "Angola" },
  { code: "AQ", nameEn: "Antarctica" },
  { code: "AR", nameEn: "Argentina" },
  { code: "AS", nameEn: "American Samoa" },
  { code: "AT", nameEn: "Austria" },
  { code: "AU", nameEn: "Australia" },
  { code: "AW", nameEn: "Aruba" },
  { code: "AX", nameEn: "\xC5land Islands" },
  { code: "AZ", nameEn: "Azerbaijan" },
  { code: "BA", nameEn: "Bosnia and Herzegovina" },
  { code: "BB", nameEn: "Barbados" },
  { code: "BD", nameEn: "Bangladesh" },
  { code: "BE", nameEn: "Belgium" },
  { code: "BF", nameEn: "Burkina Faso" },
  { code: "BG", nameEn: "Bulgaria" },
  { code: "BH", nameEn: "Bahrain" },
  { code: "BI", nameEn: "Burundi" },
  { code: "BJ", nameEn: "Benin" },
  { code: "BL", nameEn: "Saint Barth\xE9lemy" },
  { code: "BM", nameEn: "Bermuda" },
  { code: "BN", nameEn: "Brunei" },
  { code: "BO", nameEn: "Bolivia" },
  { code: "BQ", nameEn: "Caribbean Netherlands" },
  { code: "BR", nameEn: "Brazil" },
  { code: "BS", nameEn: "Bahamas" },
  { code: "BT", nameEn: "Bhutan" },
  { code: "BV", nameEn: "Bouvet Island" },
  { code: "BW", nameEn: "Botswana" },
  { code: "BY", nameEn: "Belarus" },
  { code: "BZ", nameEn: "Belize" },
  { code: "CA", nameEn: "Canada" },
  { code: "CC", nameEn: "Cocos (Keeling) Islands" },
  { code: "CD", nameEn: "DR Congo" },
  { code: "CF", nameEn: "Central African Republic" },
  { code: "CG", nameEn: "Congo" },
  { code: "CH", nameEn: "Switzerland" },
  { code: "CI", nameEn: "C\xF4te d'Ivoire" },
  { code: "CK", nameEn: "Cook Islands" },
  { code: "CL", nameEn: "Chile" },
  { code: "CM", nameEn: "Cameroon" },
  { code: "CN", nameEn: "China" },
  { code: "CO", nameEn: "Colombia" },
  { code: "CR", nameEn: "Costa Rica" },
  { code: "CU", nameEn: "Cuba" },
  { code: "CV", nameEn: "Cape Verde" },
  { code: "CW", nameEn: "Cura\xE7ao" },
  { code: "CX", nameEn: "Christmas Island" },
  { code: "CY", nameEn: "Cyprus" },
  { code: "CZ", nameEn: "Czechia" },
  { code: "DE", nameEn: "Germany" },
  { code: "DJ", nameEn: "Djibouti" },
  { code: "DK", nameEn: "Denmark" },
  { code: "DM", nameEn: "Dominica" },
  { code: "DO", nameEn: "Dominican Republic" },
  { code: "DZ", nameEn: "Algeria" },
  { code: "EC", nameEn: "Ecuador" },
  { code: "EE", nameEn: "Estonia" },
  { code: "EG", nameEn: "Egypt" },
  { code: "EH", nameEn: "Western Sahara" },
  { code: "ER", nameEn: "Eritrea" },
  { code: "ES", nameEn: "Spain" },
  { code: "ET", nameEn: "Ethiopia" },
  { code: "FI", nameEn: "Finland" },
  { code: "FJ", nameEn: "Fiji" },
  { code: "FK", nameEn: "Falkland Islands" },
  { code: "FM", nameEn: "Micronesia" },
  { code: "FO", nameEn: "Faroe Islands" },
  { code: "FR", nameEn: "France" },
  { code: "GA", nameEn: "Gabon" },
  { code: "GB", nameEn: "United Kingdom" },
  { code: "GD", nameEn: "Grenada" },
  { code: "GE", nameEn: "Georgia" },
  { code: "GF", nameEn: "French Guiana" },
  { code: "GG", nameEn: "Guernsey" },
  { code: "GH", nameEn: "Ghana" },
  { code: "GI", nameEn: "Gibraltar" },
  { code: "GL", nameEn: "Greenland" },
  { code: "GM", nameEn: "Gambia" },
  { code: "GN", nameEn: "Guinea" },
  { code: "GP", nameEn: "Guadeloupe" },
  { code: "GQ", nameEn: "Equatorial Guinea" },
  { code: "GR", nameEn: "Greece" },
  { code: "GS", nameEn: "South Georgia" },
  { code: "GT", nameEn: "Guatemala" },
  { code: "GU", nameEn: "Guam" },
  { code: "GW", nameEn: "Guinea-Bissau" },
  { code: "GY", nameEn: "Guyana" },
  { code: "HK", nameEn: "Hong Kong" },
  { code: "HM", nameEn: "Heard & McDonald Islands" },
  { code: "HN", nameEn: "Honduras" },
  { code: "HR", nameEn: "Croatia" },
  { code: "HT", nameEn: "Haiti" },
  { code: "HU", nameEn: "Hungary" },
  { code: "ID", nameEn: "Indonesia" },
  { code: "IE", nameEn: "Ireland" },
  { code: "IL", nameEn: "Israel" },
  { code: "IM", nameEn: "Isle of Man" },
  { code: "IN", nameEn: "India" },
  { code: "IO", nameEn: "British Indian Ocean Territory" },
  { code: "IQ", nameEn: "Iraq" },
  { code: "IR", nameEn: "Iran" },
  { code: "IS", nameEn: "Iceland" },
  { code: "IT", nameEn: "Italy" },
  { code: "JE", nameEn: "Jersey" },
  { code: "JM", nameEn: "Jamaica" },
  { code: "JO", nameEn: "Jordan" },
  { code: "JP", nameEn: "Japan" },
  { code: "KE", nameEn: "Kenya" },
  { code: "KG", nameEn: "Kyrgyzstan" },
  { code: "KH", nameEn: "Cambodia" },
  { code: "KI", nameEn: "Kiribati" },
  { code: "KM", nameEn: "Comoros" },
  { code: "KN", nameEn: "Saint Kitts and Nevis" },
  { code: "KP", nameEn: "North Korea" },
  { code: "KR", nameEn: "South Korea" },
  { code: "KW", nameEn: "Kuwait" },
  { code: "KY", nameEn: "Cayman Islands" },
  { code: "KZ", nameEn: "Kazakhstan" },
  { code: "LA", nameEn: "Laos" },
  { code: "LB", nameEn: "Lebanon" },
  { code: "LC", nameEn: "Saint Lucia" },
  { code: "LI", nameEn: "Liechtenstein" },
  { code: "LK", nameEn: "Sri Lanka" },
  { code: "LR", nameEn: "Liberia" },
  { code: "LS", nameEn: "Lesotho" },
  { code: "LT", nameEn: "Lithuania" },
  { code: "LU", nameEn: "Luxembourg" },
  { code: "LV", nameEn: "Latvia" },
  { code: "LY", nameEn: "Libya" },
  { code: "MA", nameEn: "Morocco" },
  { code: "MC", nameEn: "Monaco" },
  { code: "MD", nameEn: "Moldova" },
  { code: "ME", nameEn: "Montenegro" },
  { code: "MF", nameEn: "Saint Martin" },
  { code: "MG", nameEn: "Madagascar" },
  { code: "MH", nameEn: "Marshall Islands" },
  { code: "MK", nameEn: "North Macedonia" },
  { code: "ML", nameEn: "Mali" },
  { code: "MM", nameEn: "Myanmar" },
  { code: "MN", nameEn: "Mongolia" },
  { code: "MO", nameEn: "Macao" },
  { code: "MP", nameEn: "Northern Mariana Islands" },
  { code: "MQ", nameEn: "Martinique" },
  { code: "MR", nameEn: "Mauritania" },
  { code: "MS", nameEn: "Montserrat" },
  { code: "MT", nameEn: "Malta" },
  { code: "MU", nameEn: "Mauritius" },
  { code: "MV", nameEn: "Maldives" },
  { code: "MW", nameEn: "Malawi" },
  { code: "MX", nameEn: "Mexico" },
  { code: "MY", nameEn: "Malaysia" },
  { code: "MZ", nameEn: "Mozambique" },
  { code: "NA", nameEn: "Namibia" },
  { code: "NC", nameEn: "New Caledonia" },
  { code: "NE", nameEn: "Niger" },
  { code: "NF", nameEn: "Norfolk Island" },
  { code: "NG", nameEn: "Nigeria" },
  { code: "NI", nameEn: "Nicaragua" },
  { code: "NL", nameEn: "Netherlands" },
  { code: "NO", nameEn: "Norway" },
  { code: "NP", nameEn: "Nepal" },
  { code: "NR", nameEn: "Nauru" },
  { code: "NU", nameEn: "Niue" },
  { code: "NZ", nameEn: "New Zealand" },
  { code: "OM", nameEn: "Oman" },
  { code: "PA", nameEn: "Panama" },
  { code: "PE", nameEn: "Peru" },
  { code: "PF", nameEn: "French Polynesia" },
  { code: "PG", nameEn: "Papua New Guinea" },
  { code: "PH", nameEn: "Philippines" },
  { code: "PK", nameEn: "Pakistan" },
  { code: "PL", nameEn: "Poland" },
  { code: "PM", nameEn: "Saint Pierre and Miquelon" },
  { code: "PN", nameEn: "Pitcairn Islands" },
  { code: "PR", nameEn: "Puerto Rico" },
  { code: "PS", nameEn: "Palestine" },
  { code: "PT", nameEn: "Portugal" },
  { code: "PW", nameEn: "Palau" },
  { code: "PY", nameEn: "Paraguay" },
  { code: "QA", nameEn: "Qatar" },
  { code: "RE", nameEn: "R\xE9union" },
  { code: "RO", nameEn: "Romania" },
  { code: "RS", nameEn: "Serbia" },
  { code: "RU", nameEn: "Russia" },
  { code: "RW", nameEn: "Rwanda" },
  { code: "SA", nameEn: "Saudi Arabia" },
  { code: "SB", nameEn: "Solomon Islands" },
  { code: "SC", nameEn: "Seychelles" },
  { code: "SD", nameEn: "Sudan" },
  { code: "SE", nameEn: "Sweden" },
  { code: "SG", nameEn: "Singapore" },
  { code: "SH", nameEn: "Saint Helena" },
  { code: "SI", nameEn: "Slovenia" },
  { code: "SJ", nameEn: "Svalbard and Jan Mayen" },
  { code: "SK", nameEn: "Slovakia" },
  { code: "SL", nameEn: "Sierra Leone" },
  { code: "SM", nameEn: "San Marino" },
  { code: "SN", nameEn: "Senegal" },
  { code: "SO", nameEn: "Somalia" },
  { code: "SR", nameEn: "Suriname" },
  { code: "SS", nameEn: "South Sudan" },
  { code: "ST", nameEn: "S\xE3o Tom\xE9 and Pr\xEDncipe" },
  { code: "SV", nameEn: "El Salvador" },
  { code: "SX", nameEn: "Sint Maarten" },
  { code: "SY", nameEn: "Syria" },
  { code: "SZ", nameEn: "Eswatini" },
  { code: "TC", nameEn: "Turks and Caicos Islands" },
  { code: "TD", nameEn: "Chad" },
  { code: "TF", nameEn: "French Southern Territories" },
  { code: "TG", nameEn: "Togo" },
  { code: "TH", nameEn: "Thailand" },
  { code: "TJ", nameEn: "Tajikistan" },
  { code: "TK", nameEn: "Tokelau" },
  { code: "TL", nameEn: "Timor-Leste" },
  { code: "TM", nameEn: "Turkmenistan" },
  { code: "TN", nameEn: "Tunisia" },
  { code: "TO", nameEn: "Tonga" },
  { code: "TR", nameEn: "Turkey" },
  { code: "TT", nameEn: "Trinidad and Tobago" },
  { code: "TV", nameEn: "Tuvalu" },
  { code: "TW", nameEn: "Taiwan" },
  { code: "TZ", nameEn: "Tanzania" },
  { code: "UA", nameEn: "Ukraine" },
  { code: "UG", nameEn: "Uganda" },
  { code: "UM", nameEn: "U.S. Outlying Islands" },
  { code: "US", nameEn: "United States" },
  { code: "UY", nameEn: "Uruguay" },
  { code: "UZ", nameEn: "Uzbekistan" },
  { code: "VA", nameEn: "Vatican City" },
  { code: "VC", nameEn: "Saint Vincent and the Grenadines" },
  { code: "VE", nameEn: "Venezuela" },
  { code: "VG", nameEn: "British Virgin Islands" },
  { code: "VI", nameEn: "U.S. Virgin Islands" },
  { code: "VN", nameEn: "Vietnam" },
  { code: "VU", nameEn: "Vanuatu" },
  { code: "WF", nameEn: "Wallis and Futuna" },
  { code: "WS", nameEn: "Samoa" },
  { code: "YE", nameEn: "Yemen" },
  { code: "YT", nameEn: "Mayotte" },
  { code: "ZA", nameEn: "South Africa" },
  { code: "ZM", nameEn: "Zambia" },
  { code: "ZW", nameEn: "Zimbabwe" }
];
Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c])
);
({
  worldwide: COUNTRIES.map((c) => c.code)
});

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
    this.#baseUrl = (options.baseUrl ?? OPENAPI_SERVER_URL).replace(/\/+$/, "");
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

export { MarkaApiError, MarkaClient, MarkaNetworkError, OPENAPI_API_KEY_HEADER, OPENAPI_SERVER_URL, V1CreateListingRequestSchema, V1UpdateListingRequestSchema, V1_PATH_PREFIX };
//# sourceMappingURL=chunk-JLHJWPED.js.map
//# sourceMappingURL=chunk-JLHJWPED.js.map