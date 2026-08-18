import { z } from 'zod';

type JsonValue = string | number | boolean | null | JsonValue[] | {
    [key: string]: JsonValue;
};

declare const V1MeResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodEmail;
        name: z.ZodString;
    }, z.core.$strip>;
    plan: z.ZodObject<{
        tier: z.ZodEnum<{
            free: "free";
            pro: "pro";
            business: "business";
        }>;
        entitlements: z.ZodArray<z.ZodEnum<{
            api_write: "api_write";
            cross_post_oneway: "cross_post_oneway";
            cross_post_bidirectional: "cross_post_bidirectional";
            ai_unlimited: "ai_unlimited";
            custom_storefront: "custom_storefront";
            editorial_spot: "editorial_spot";
        }>>;
        limits: z.ZodObject<{
            maxActiveListings: z.ZodNullable<z.ZodInt>;
            aiCopilotRunsPerMonth: z.ZodNullable<z.ZodInt>;
            apiRequestsPerMonth: z.ZodInt;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
type V1MeResponse = z.infer<typeof V1MeResponseSchema>;

/**
 * Body for `POST /v1/listings`. Only the fields a draft genuinely needs are required; every
 * other field carries a server-side default (see buildCreateListingDraftInput in
 * apps/web/app/api/listings/route.ts) and is omitted rather than given a zod `.default()`, so
 * the request and response views of this schema are identical.
 *
 * `.strict()`: an unknown key is a 400, not silently dropped. A caller who misspells a field, or
 * reaches for one this endpoint does not accept (`status`, `quantityReserved`), is told so —
 * rather than getting a 200 and a listing that quietly ignored half the request.
 */
declare const V1CreateListingRequestSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    price: z.ZodNumber;
    currency: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    condition: z.ZodOptional<z.ZodEnum<{
        new: "new";
        refurbished: "refurbished";
        like_new: "like_new";
        good: "good";
        fair: "fair";
        for_parts: "for_parts";
    }>>;
    inventoryType: z.ZodOptional<z.ZodEnum<{
        unique: "unique";
        multi_qty: "multi_qty";
    }>>;
    quantityTotal: z.ZodOptional<z.ZodInt>;
    attributesJson: z.ZodOptional<z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
    location: z.ZodOptional<z.ZodObject<{
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
        city: z.ZodOptional<z.ZodString>;
        region: z.ZodOptional<z.ZodString>;
        country: z.ZodString;
        postalCode: z.ZodOptional<z.ZodString>;
        addressLine1: z.ZodOptional<z.ZodString>;
        addressLine2: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    pickupEnabled: z.ZodOptional<z.ZodBoolean>;
    shippingEnabled: z.ZodOptional<z.ZodBoolean>;
    shippingProfileId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    shippingFlatAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    directEnabled: z.ZodOptional<z.ZodBoolean>;
    checkoutEnabled: z.ZodOptional<z.ZodBoolean>;
    visibilityRadiusKm: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    riskCategory: z.ZodOptional<z.ZodEnum<{
        general: "general";
        phone: "phone";
        tablet: "tablet";
        luxury: "luxury";
        collectible: "collectible";
        high_end_electronics: "high_end_electronics";
    }>>;
}, z.core.$strict>;
type V1CreateListingRequest = z.infer<typeof V1CreateListingRequestSchema>;
/**
 * Body for `PATCH /v1/listings/{id}` — a partial field update. Lifecycle transitions are NOT
 * expressed here: publishing is `POST /v1/listings/{id}/publish`, which runs the domain guards
 * (activateListing) that a bare status write would bypass.
 *
 * `.strict()` is what MAKES that true. Without it zod strips unknown keys, so `{"status":"active"}`
 * parsed clean, updated nothing, and answered 200 — a caller reaching for the lifecycle through
 * this endpoint was told it had worked. Now the same body is a 400 that names the offending key,
 * pointing at the publish endpoint instead of silently doing nothing.
 *
 * Every field is optional, so `{}` is a legal (no-op) request. That is deliberate: which fields
 * are present IS the update, and demanding at least one would make a client that diffs its local
 * state have to special-case "nothing changed".
 */
declare const V1UpdateListingRequestSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    imageUrls: z.ZodOptional<z.ZodArray<z.ZodString>>;
    pickupEnabled: z.ZodOptional<z.ZodBoolean>;
    shippingEnabled: z.ZodOptional<z.ZodBoolean>;
    directEnabled: z.ZodOptional<z.ZodBoolean>;
    checkoutEnabled: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
type V1UpdateListingRequest = z.infer<typeof V1UpdateListingRequestSchema>;
declare const V1ListListingsQuerySchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
type V1ListListingsQuery = z.infer<typeof V1ListListingsQuerySchema>;
declare const V1ListListingsResponseSchema: z.ZodObject<{
    limit: z.ZodInt;
    offset: z.ZodInt;
    hasMore: z.ZodBoolean;
    listings: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sellerAccountId: z.ZodString;
        authority: z.ZodEnum<{
            MARKA: "MARKA";
            EBAY: "EBAY";
            ETSY: "ETSY";
            SHOPIFY: "SHOPIFY";
        }>;
        status: z.ZodEnum<{
            draft: "draft";
            active: "active";
            reserved: "reserved";
            sold: "sold";
            paused: "paused";
            removed: "removed";
        }>;
        inventoryType: z.ZodEnum<{
            unique: "unique";
            multi_qty: "multi_qty";
        }>;
        quantityTotal: z.ZodInt;
        quantityReserved: z.ZodInt;
        categoryId: z.ZodString;
        condition: z.ZodEnum<{
            new: "new";
            refurbished: "refurbished";
            like_new: "like_new";
            good: "good";
            fair: "fair";
            for_parts: "for_parts";
        }>;
        title: z.ZodString;
        description: z.ZodString;
        attributesJson: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
        imageUrls: z.ZodArray<z.ZodString>;
        brand: z.ZodNullable<z.ZodString>;
        gtin: z.ZodNullable<z.ZodString>;
        packageWeightGrams: z.ZodNullable<z.ZodInt>;
        packageDimensionsMm: z.ZodNullable<z.ZodObject<{
            lengthMm: z.ZodInt;
            widthMm: z.ZodInt;
            heightMm: z.ZodInt;
        }, z.core.$strip>>;
        acceptsOffers: z.ZodBoolean;
        autoAcceptOfferAmount: z.ZodNullable<z.ZodNumber>;
        price: z.ZodNumber;
        currency: z.ZodString;
        location: z.ZodObject<{
            latitude: z.ZodOptional<z.ZodNumber>;
            longitude: z.ZodOptional<z.ZodNumber>;
            city: z.ZodOptional<z.ZodString>;
            region: z.ZodOptional<z.ZodString>;
            country: z.ZodString;
            postalCode: z.ZodOptional<z.ZodString>;
            addressLine1: z.ZodOptional<z.ZodString>;
            addressLine2: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        pickupEnabled: z.ZodBoolean;
        shippingEnabled: z.ZodBoolean;
        shippingProfileId: z.ZodNullable<z.ZodString>;
        shippingFlatAmount: z.ZodNullable<z.ZodNumber>;
        directEnabled: z.ZodBoolean;
        checkoutEnabled: z.ZodBoolean;
        visibilityRadiusKm: z.ZodNullable<z.ZodNumber>;
        riskCategory: z.ZodEnum<{
            general: "general";
            phone: "phone";
            tablet: "tablet";
            luxury: "luxury";
            collectible: "collectible";
            high_end_electronics: "high_end_electronics";
        }>;
        createdAt: z.ZodISODateTime;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strip>>;
}, z.core.$strip>;
type V1ListListingsResponse = z.infer<typeof V1ListListingsResponseSchema>;
declare const V1ListingResponseSchema: z.ZodObject<{
    listing: z.ZodObject<{
        id: z.ZodString;
        sellerAccountId: z.ZodString;
        authority: z.ZodEnum<{
            MARKA: "MARKA";
            EBAY: "EBAY";
            ETSY: "ETSY";
            SHOPIFY: "SHOPIFY";
        }>;
        status: z.ZodEnum<{
            draft: "draft";
            active: "active";
            reserved: "reserved";
            sold: "sold";
            paused: "paused";
            removed: "removed";
        }>;
        inventoryType: z.ZodEnum<{
            unique: "unique";
            multi_qty: "multi_qty";
        }>;
        quantityTotal: z.ZodInt;
        quantityReserved: z.ZodInt;
        categoryId: z.ZodString;
        condition: z.ZodEnum<{
            new: "new";
            refurbished: "refurbished";
            like_new: "like_new";
            good: "good";
            fair: "fair";
            for_parts: "for_parts";
        }>;
        title: z.ZodString;
        description: z.ZodString;
        attributesJson: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
        imageUrls: z.ZodArray<z.ZodString>;
        brand: z.ZodNullable<z.ZodString>;
        gtin: z.ZodNullable<z.ZodString>;
        packageWeightGrams: z.ZodNullable<z.ZodInt>;
        packageDimensionsMm: z.ZodNullable<z.ZodObject<{
            lengthMm: z.ZodInt;
            widthMm: z.ZodInt;
            heightMm: z.ZodInt;
        }, z.core.$strip>>;
        acceptsOffers: z.ZodBoolean;
        autoAcceptOfferAmount: z.ZodNullable<z.ZodNumber>;
        price: z.ZodNumber;
        currency: z.ZodString;
        location: z.ZodObject<{
            latitude: z.ZodOptional<z.ZodNumber>;
            longitude: z.ZodOptional<z.ZodNumber>;
            city: z.ZodOptional<z.ZodString>;
            region: z.ZodOptional<z.ZodString>;
            country: z.ZodString;
            postalCode: z.ZodOptional<z.ZodString>;
            addressLine1: z.ZodOptional<z.ZodString>;
            addressLine2: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        pickupEnabled: z.ZodBoolean;
        shippingEnabled: z.ZodBoolean;
        shippingProfileId: z.ZodNullable<z.ZodString>;
        shippingFlatAmount: z.ZodNullable<z.ZodNumber>;
        directEnabled: z.ZodBoolean;
        checkoutEnabled: z.ZodBoolean;
        visibilityRadiusKm: z.ZodNullable<z.ZodNumber>;
        riskCategory: z.ZodEnum<{
            general: "general";
            phone: "phone";
            tablet: "tablet";
            luxury: "luxury";
            collectible: "collectible";
            high_end_electronics: "high_end_electronics";
        }>;
        createdAt: z.ZodISODateTime;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strip>;
}, z.core.$strip>;
type V1ListingResponse = z.infer<typeof V1ListingResponseSchema>;

/**
 * `GET /v1/search` query. Booleans and numbers are coerced from query-string text; the OpenAPI
 * document renders them as their logical types.
 *
 * Only filters the search layer actually honours are modeled — `searchTypesense` /
 * `searchListings` (packages/search) support the query text, the pickup/shipping flags, a price
 * band, and an origin+radius geo filter. There is deliberately no facet output: the current
 * search returns ranked listing IDs only, so a `facets` field would be a promise the
 * implementation cannot keep.
 */
declare const V1SearchQuerySchema: z.ZodObject<{
    offset: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    q: z.ZodOptional<z.ZodString>;
    pickup: z.ZodOptional<z.ZodCodec<z.ZodString, z.ZodBoolean>>;
    shipping: z.ZodOptional<z.ZodCodec<z.ZodString, z.ZodBoolean>>;
    city: z.ZodOptional<z.ZodString>;
    radiusKm: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    minPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    maxPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
type V1SearchQuery = z.infer<typeof V1SearchQuerySchema>;
declare const V1SearchResponseSchema: z.ZodObject<{
    limit: z.ZodInt;
    offset: z.ZodInt;
    hasMore: z.ZodBoolean;
    query: z.ZodString;
    results: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        currency: z.ZodString;
        location: z.ZodObject<{
            latitude: z.ZodOptional<z.ZodNumber>;
            longitude: z.ZodOptional<z.ZodNumber>;
            city: z.ZodOptional<z.ZodString>;
            region: z.ZodOptional<z.ZodString>;
            country: z.ZodString;
            postalCode: z.ZodOptional<z.ZodString>;
            addressLine1: z.ZodOptional<z.ZodString>;
            addressLine2: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        createdAt: z.ZodISODateTime;
        sellerAccountId: z.ZodString;
        categoryId: z.ZodString;
        condition: z.ZodEnum<{
            new: "new";
            refurbished: "refurbished";
            like_new: "like_new";
            good: "good";
            fair: "fair";
            for_parts: "for_parts";
        }>;
        imageUrls: z.ZodArray<z.ZodString>;
        price: z.ZodNumber;
        pickupEnabled: z.ZodBoolean;
        shippingEnabled: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>;
type V1SearchResponse = z.infer<typeof V1SearchResponseSchema>;

declare const V1ListCategoriesQuerySchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
type V1ListCategoriesQuery = z.infer<typeof V1ListCategoriesQuerySchema>;
/** Ordered by `count`, descending. */
declare const V1ListCategoriesResponseSchema: z.ZodObject<{
    categories: z.ZodArray<z.ZodObject<{
        categoryId: z.ZodString;
        label: z.ZodString;
        count: z.ZodInt;
    }, z.core.$strip>>;
}, z.core.$strip>;
type V1ListCategoriesResponse = z.infer<typeof V1ListCategoriesResponseSchema>;

declare const V1ListOrdersQuerySchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    status: z.ZodOptional<z.ZodEnum<{
        created: "created";
        checkout_pending: "checkout_pending";
        payment_captured: "payment_captured";
        seller_accepted: "seller_accepted";
        scheduled: "scheduled";
        inspecting: "inspecting";
        packing: "packing";
        shipped: "shipped";
        delivered: "delivered";
        inspection_window: "inspection_window";
        completed: "completed";
        abandoned: "abandoned";
        cancelled: "cancelled";
        refunded: "refunded";
        seller_cancelled: "seller_cancelled";
        buyer_no_show: "buyer_no_show";
        seller_no_show: "seller_no_show";
        rejected_at_pickup: "rejected_at_pickup";
        delivery_issue: "delivery_issue";
        dispute_open: "dispute_open";
        resolved: "resolved";
    }>>;
}, z.core.$strip>;
type V1ListOrdersQuery = z.infer<typeof V1ListOrdersQuerySchema>;
/** Newest first, matching getOrdersForSeller. */
declare const V1ListOrdersResponseSchema: z.ZodObject<{
    limit: z.ZodInt;
    offset: z.ZodInt;
    hasMore: z.ZodBoolean;
    orders: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        listingId: z.ZodString;
        buyerId: z.ZodString;
        sellerAccountId: z.ZodString;
        connectedAccountId: z.ZodNullable<z.ZodString>;
        quantity: z.ZodInt;
        rail: z.ZodEnum<{
            DIRECT: "DIRECT";
            CHECKOUT: "CHECKOUT";
        }>;
        fulfillmentMode: z.ZodEnum<{
            PICKUP: "PICKUP";
            SHIPPING: "SHIPPING";
        }>;
        protectionTier: z.ZodEnum<{
            DIRECT_BASIC: "DIRECT_BASIC";
            CHECKOUT_PICKUP: "CHECKOUT_PICKUP";
            CHECKOUT_SHIPPING: "CHECKOUT_SHIPPING";
            VERIFIED_HIGH_RISK: "VERIFIED_HIGH_RISK";
        }>;
        status: z.ZodEnum<{
            created: "created";
            checkout_pending: "checkout_pending";
            payment_captured: "payment_captured";
            seller_accepted: "seller_accepted";
            scheduled: "scheduled";
            inspecting: "inspecting";
            packing: "packing";
            shipped: "shipped";
            delivered: "delivered";
            inspection_window: "inspection_window";
            completed: "completed";
            abandoned: "abandoned";
            cancelled: "cancelled";
            refunded: "refunded";
            seller_cancelled: "seller_cancelled";
            buyer_no_show: "buyer_no_show";
            seller_no_show: "seller_no_show";
            rejected_at_pickup: "rejected_at_pickup";
            delivery_issue: "delivery_issue";
            dispute_open: "dispute_open";
            resolved: "resolved";
        }>;
        listingSnapshotJson: z.ZodObject<{
            id: z.ZodString;
            sellerAccountId: z.ZodString;
            authority: z.ZodEnum<{
                MARKA: "MARKA";
                EBAY: "EBAY";
                ETSY: "ETSY";
                SHOPIFY: "SHOPIFY";
            }>;
            status: z.ZodEnum<{
                draft: "draft";
                active: "active";
                reserved: "reserved";
                sold: "sold";
                paused: "paused";
                removed: "removed";
            }>;
            inventoryType: z.ZodEnum<{
                unique: "unique";
                multi_qty: "multi_qty";
            }>;
            quantityTotal: z.ZodInt;
            quantityReserved: z.ZodInt;
            categoryId: z.ZodString;
            condition: z.ZodEnum<{
                new: "new";
                refurbished: "refurbished";
                like_new: "like_new";
                good: "good";
                fair: "fair";
                for_parts: "for_parts";
            }>;
            title: z.ZodString;
            description: z.ZodString;
            attributesJson: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
            imageUrls: z.ZodArray<z.ZodString>;
            brand: z.ZodNullable<z.ZodString>;
            gtin: z.ZodNullable<z.ZodString>;
            packageWeightGrams: z.ZodNullable<z.ZodInt>;
            packageDimensionsMm: z.ZodNullable<z.ZodObject<{
                lengthMm: z.ZodInt;
                widthMm: z.ZodInt;
                heightMm: z.ZodInt;
            }, z.core.$strip>>;
            acceptsOffers: z.ZodBoolean;
            autoAcceptOfferAmount: z.ZodNullable<z.ZodNumber>;
            price: z.ZodNumber;
            currency: z.ZodString;
            location: z.ZodObject<{
                latitude: z.ZodOptional<z.ZodNumber>;
                longitude: z.ZodOptional<z.ZodNumber>;
                city: z.ZodOptional<z.ZodString>;
                region: z.ZodOptional<z.ZodString>;
                country: z.ZodString;
                postalCode: z.ZodOptional<z.ZodString>;
                addressLine1: z.ZodOptional<z.ZodString>;
                addressLine2: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>;
            pickupEnabled: z.ZodBoolean;
            shippingEnabled: z.ZodBoolean;
            shippingProfileId: z.ZodNullable<z.ZodString>;
            shippingFlatAmount: z.ZodNullable<z.ZodNumber>;
            directEnabled: z.ZodBoolean;
            checkoutEnabled: z.ZodBoolean;
            visibilityRadiusKm: z.ZodNullable<z.ZodNumber>;
            riskCategory: z.ZodEnum<{
                general: "general";
                phone: "phone";
                tablet: "tablet";
                luxury: "luxury";
                collectible: "collectible";
                high_end_electronics: "high_end_electronics";
            }>;
            createdAt: z.ZodISODateTime;
            updatedAt: z.ZodISODateTime;
        }, z.core.$strip>;
        priceSnapshotJson: z.ZodObject<{
            itemSubtotal: z.ZodInt;
            shippingAmount: z.ZodInt;
            taxAmount: z.ZodInt;
            applicationFeeAmount: z.ZodInt;
            currency: z.ZodString;
        }, z.core.$strip>;
        stripeCheckoutSessionId: z.ZodNullable<z.ZodString>;
        checkoutShippingDetailsJson: z.ZodNullable<z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
        paymentId: z.ZodNullable<z.ZodString>;
        pickupSessionId: z.ZodNullable<z.ZodString>;
        shipmentId: z.ZodNullable<z.ZodString>;
        reviewEligibilityState: z.ZodEnum<{
            not_eligible: "not_eligible";
            completed_transaction_review: "completed_transaction_review";
            seller_cancel_feedback: "seller_cancel_feedback";
            structured_no_show_feedback: "structured_no_show_feedback";
            resolution_only: "resolution_only";
        }>;
        disputeState: z.ZodEnum<{
            resolved: "resolved";
            none: "none";
            open: "open";
            chargeback_open: "chargeback_open";
            chargeback_resolved: "chargeback_resolved";
        }>;
        createdAt: z.ZodISODateTime;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strip>>;
}, z.core.$strip>;
type V1ListOrdersResponse = z.infer<typeof V1ListOrdersResponseSchema>;
declare const V1OrderResponseSchema: z.ZodObject<{
    order: z.ZodObject<{
        id: z.ZodString;
        listingId: z.ZodString;
        buyerId: z.ZodString;
        sellerAccountId: z.ZodString;
        connectedAccountId: z.ZodNullable<z.ZodString>;
        quantity: z.ZodInt;
        rail: z.ZodEnum<{
            DIRECT: "DIRECT";
            CHECKOUT: "CHECKOUT";
        }>;
        fulfillmentMode: z.ZodEnum<{
            PICKUP: "PICKUP";
            SHIPPING: "SHIPPING";
        }>;
        protectionTier: z.ZodEnum<{
            DIRECT_BASIC: "DIRECT_BASIC";
            CHECKOUT_PICKUP: "CHECKOUT_PICKUP";
            CHECKOUT_SHIPPING: "CHECKOUT_SHIPPING";
            VERIFIED_HIGH_RISK: "VERIFIED_HIGH_RISK";
        }>;
        status: z.ZodEnum<{
            created: "created";
            checkout_pending: "checkout_pending";
            payment_captured: "payment_captured";
            seller_accepted: "seller_accepted";
            scheduled: "scheduled";
            inspecting: "inspecting";
            packing: "packing";
            shipped: "shipped";
            delivered: "delivered";
            inspection_window: "inspection_window";
            completed: "completed";
            abandoned: "abandoned";
            cancelled: "cancelled";
            refunded: "refunded";
            seller_cancelled: "seller_cancelled";
            buyer_no_show: "buyer_no_show";
            seller_no_show: "seller_no_show";
            rejected_at_pickup: "rejected_at_pickup";
            delivery_issue: "delivery_issue";
            dispute_open: "dispute_open";
            resolved: "resolved";
        }>;
        listingSnapshotJson: z.ZodObject<{
            id: z.ZodString;
            sellerAccountId: z.ZodString;
            authority: z.ZodEnum<{
                MARKA: "MARKA";
                EBAY: "EBAY";
                ETSY: "ETSY";
                SHOPIFY: "SHOPIFY";
            }>;
            status: z.ZodEnum<{
                draft: "draft";
                active: "active";
                reserved: "reserved";
                sold: "sold";
                paused: "paused";
                removed: "removed";
            }>;
            inventoryType: z.ZodEnum<{
                unique: "unique";
                multi_qty: "multi_qty";
            }>;
            quantityTotal: z.ZodInt;
            quantityReserved: z.ZodInt;
            categoryId: z.ZodString;
            condition: z.ZodEnum<{
                new: "new";
                refurbished: "refurbished";
                like_new: "like_new";
                good: "good";
                fair: "fair";
                for_parts: "for_parts";
            }>;
            title: z.ZodString;
            description: z.ZodString;
            attributesJson: z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>;
            imageUrls: z.ZodArray<z.ZodString>;
            brand: z.ZodNullable<z.ZodString>;
            gtin: z.ZodNullable<z.ZodString>;
            packageWeightGrams: z.ZodNullable<z.ZodInt>;
            packageDimensionsMm: z.ZodNullable<z.ZodObject<{
                lengthMm: z.ZodInt;
                widthMm: z.ZodInt;
                heightMm: z.ZodInt;
            }, z.core.$strip>>;
            acceptsOffers: z.ZodBoolean;
            autoAcceptOfferAmount: z.ZodNullable<z.ZodNumber>;
            price: z.ZodNumber;
            currency: z.ZodString;
            location: z.ZodObject<{
                latitude: z.ZodOptional<z.ZodNumber>;
                longitude: z.ZodOptional<z.ZodNumber>;
                city: z.ZodOptional<z.ZodString>;
                region: z.ZodOptional<z.ZodString>;
                country: z.ZodString;
                postalCode: z.ZodOptional<z.ZodString>;
                addressLine1: z.ZodOptional<z.ZodString>;
                addressLine2: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>;
            pickupEnabled: z.ZodBoolean;
            shippingEnabled: z.ZodBoolean;
            shippingProfileId: z.ZodNullable<z.ZodString>;
            shippingFlatAmount: z.ZodNullable<z.ZodNumber>;
            directEnabled: z.ZodBoolean;
            checkoutEnabled: z.ZodBoolean;
            visibilityRadiusKm: z.ZodNullable<z.ZodNumber>;
            riskCategory: z.ZodEnum<{
                general: "general";
                phone: "phone";
                tablet: "tablet";
                luxury: "luxury";
                collectible: "collectible";
                high_end_electronics: "high_end_electronics";
            }>;
            createdAt: z.ZodISODateTime;
            updatedAt: z.ZodISODateTime;
        }, z.core.$strip>;
        priceSnapshotJson: z.ZodObject<{
            itemSubtotal: z.ZodInt;
            shippingAmount: z.ZodInt;
            taxAmount: z.ZodInt;
            applicationFeeAmount: z.ZodInt;
            currency: z.ZodString;
        }, z.core.$strip>;
        stripeCheckoutSessionId: z.ZodNullable<z.ZodString>;
        checkoutShippingDetailsJson: z.ZodNullable<z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
        paymentId: z.ZodNullable<z.ZodString>;
        pickupSessionId: z.ZodNullable<z.ZodString>;
        shipmentId: z.ZodNullable<z.ZodString>;
        reviewEligibilityState: z.ZodEnum<{
            not_eligible: "not_eligible";
            completed_transaction_review: "completed_transaction_review";
            seller_cancel_feedback: "seller_cancel_feedback";
            structured_no_show_feedback: "structured_no_show_feedback";
            resolution_only: "resolution_only";
        }>;
        disputeState: z.ZodEnum<{
            resolved: "resolved";
            none: "none";
            open: "open";
            chargeback_open: "chargeback_open";
            chargeback_resolved: "chargeback_resolved";
        }>;
        createdAt: z.ZodISODateTime;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strip>;
}, z.core.$strip>;
type V1OrderResponse = z.infer<typeof V1OrderResponseSchema>;

export type { V1CreateListingRequest, V1ListCategoriesQuery, V1ListCategoriesResponse, V1ListListingsQuery, V1ListListingsResponse, V1ListOrdersQuery, V1ListOrdersResponse, V1ListingResponse, V1MeResponse, V1OrderResponse, V1SearchQuery, V1SearchResponse, V1UpdateListingRequest };
