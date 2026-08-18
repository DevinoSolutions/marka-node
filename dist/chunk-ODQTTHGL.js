import { V1CreateListingRequestSchema, V1UpdateListingRequestSchema, z, V1_PATH_PREFIX, OPENAPI_API_KEY_HEADER, MarkaClient, OPENAPI_SERVER_URL, MarkaApiError } from './chunk-JLHJWPED.js';
import { MCPServer } from '@mastra/mcp';
import { createTool } from '@mastra/core/tools';

var MCP_HTTP_PATH = `${V1_PATH_PREFIX}/mcp`;
var MARKA_MCP_STDIO_BIN = "marka-mcp-stdio";
function normalizeOrigin(baseUrl) {
  return (baseUrl ?? OPENAPI_SERVER_URL).replace(/\/+$/, "");
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
var createListingInput = V1CreateListingRequestSchema.pick({
  title: true,
  description: true,
  price: true,
  currency: true,
  categoryId: true,
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
    version: "1.0.0",
    description: "Search Marka listings and draft new ones through the public Marka API.",
    tools: buildTools(client)
  });
}

export { MARKA_MCP_STDIO_BIN, createMarkaMcpServer, getMcpServerConfig };
//# sourceMappingURL=chunk-ODQTTHGL.js.map
//# sourceMappingURL=chunk-ODQTTHGL.js.map