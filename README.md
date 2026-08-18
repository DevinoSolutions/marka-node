# @joinmarka/sdk

The official TypeScript client for [Marka](https://joinmarka.com)'s public API, plus an MCP server
built on top of it.

Marka is a canonical-listing marketplace: you create one listing, and Marka projects it to external
channels. This package talks to the public `/api/v1` surface — listings, search, categories, orders
and the account behind your key.

Request and response types come from the same contract that generates Marka's OpenAPI document, so
the SDK cannot describe an endpoint the API does not have.

```bash
npm install @joinmarka/sdk
```

Requires Node.js 20.19 or newer. ESM only.

## Quickstart

Create an API key in Marka under **Settings → API keys** (it looks like `mk_…`).

```ts
import { MarkaClient } from "@joinmarka/sdk";

const marka = new MarkaClient({ apiKey: process.env.MARKA_API_KEY! });

const { user, plan } = await marka.getMe();
console.log(`${user.email} — ${plan.tier}`);

const { results } = await marka.search({ q: "road bike", limit: 5 });
for (const listing of results) {
  // Integer minor units — the SDK converts nothing. 4500 is $45.00.
  console.log(listing.title, listing.price, listing.currency);
}
```

### Configuration

```ts
new MarkaClient({
  apiKey: "mk_…",
  baseUrl: "http://localhost:3001", // optional — scheme and host ONLY, no /api, no /v1
  fetch: myFetch,                   // optional injectable transport
});
```

Configuration is constructor arguments only. The SDK never reads `process.env`, so the same instance
is safe in a browser, a worker, or a multi-tenant server.

### Methods

| Method | Endpoint |
| --- | --- |
| `getMe()` | `GET /v1/me` |
| `listListings(query?)` | `GET /v1/listings` |
| `createListing(body)` | `POST /v1/listings` |
| `getListing(id)` | `GET /v1/listings/{id}` |
| `updateListing(id, body)` | `PATCH /v1/listings/{id}` |
| `publishListing(id)` | `POST /v1/listings/{id}/publish` |
| `search(query?)` | `GET /v1/search` |
| `listCategories(query?)` | `GET /v1/categories` |
| `listOrders(query?)` | `GET /v1/orders` |
| `getOrder(id)` | `GET /v1/orders/{id}` |

### Errors

Failures are thrown, never returned:

```ts
import { MarkaApiError, MarkaNetworkError } from "@joinmarka/sdk";

try {
  await marka.createListing({ title: "…", description: "…", price: 4500 });
} catch (error) {
  if (error instanceof MarkaApiError) {
    // The API answered and said no. Branch on `status`, then `code`.
    if (error.status === 402 && error.code === "entitlement_required") {
      console.error("This plan cannot write through the API.");
    }
  } else if (error instanceof MarkaNetworkError) {
    // No answer at all: DNS, TLS, timeout, aborted socket. The original is on `error.cause`.
  }
}
```

Writes (`createListing`, `updateListing`, `publishListing`) require the `api_write` entitlement and
answer `402` without it.

## MCP

### As a subprocess (Claude Desktop and friends)

The package ships a `marka-mcp-stdio` bin that serves Marka's tools over stdio. Add this to
`claude_desktop_config.json` and restart the app — no install step, `npx` fetches the package:

```json
{
  "mcpServers": {
    "marka": {
      "command": "npx",
      "args": ["-y", "-p", "@joinmarka/sdk", "marka-mcp-stdio"],
      "env": {
        "MARKA_API_KEY": "mk_YOUR_KEY_HERE"
      }
    }
  }
}
```

Where the package is already installed, `"command": "marka-mcp-stdio"` with `"args": []` does the
same thing. The bridge also takes `--api-key=` and `--base-url=` flags, which is handy for testing
it by hand:

```bash
npx -p @joinmarka/sdk marka-mcp-stdio --help
```

Six tools: `search_listings`, `get_listing`, `list_categories`, `get_me`, `create_listing`,
`update_listing`. Publishing is deliberately not exposed — it needs a human in the loop — and
neither are orders, which carry buyer contact details (use `marka.listOrders()` if you want them).

### In your own process

```ts
import { createMarkaMcpServer } from "@joinmarka/sdk/mcp";

const server = createMarkaMcpServer({ apiKey: "mk_…" });
await server.startStdio();
```

`getMcpServerConfig({ apiKey })` returns ready-to-paste `mcpServers` blocks for both transports —
the stdio one above, and an HTTP one pointing at Marka's hosted MCP gateway, which is a **different
server with a different tool set** backed by Marka's own database.

## Docs

Full documentation, including the API reference and the hosted MCP gateway, is at
[joinmarka.com](https://joinmarka.com).

## License

MIT
