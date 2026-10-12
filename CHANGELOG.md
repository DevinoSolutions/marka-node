# Changelog

All notable changes to `@joinmarka/sdk` are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows
[Semantic Versioning](https://semver.org/). While the version is below 1.0, a minor release may
contain breaking changes; they are always listed under "Breaking".

## 0.2.0 — 2026-10-12

0.2.0 brings the SDK back in step with the current Marka API. Several request and response fields
were renamed on the server after 0.1.0 shipped, and the server no longer accepts the old names, so
a 0.1.0 client that sends them is rejected with a 400. Upgrade and rename the fields below.

### Requirements

A clarification, not a change: `MarkaClient` runs on Node 20.19+. `@joinmarka/sdk/mcp` and the
`marka-mcp-stdio` command need Node 22.13+, which is a requirement of `@mastra/core`. The same was
true of 0.1.0; the package's `engines` field (`>=20.19.0`) describes the client only.

### Breaking

- **Listing requests use `categoryPath`, not `categoryId`.** `createListing` and `updateListing`
  (and the `create_listing` MCP tool) now take `categoryPath`, a slash-separated lowercase path such
  as `"electronics/cameras"`. It is never an external marketplace's numeric category id. The server
  rejects the old `categoryId` key. Migration: rename the key and pass a path instead of an id.
  Omitting it still defaults to `"general"`.
- **Listing requests use `attributes`, not `attributesJson`.** Same two methods, same migration:
  rename the key. The value is unchanged.
- **Listing and order responses were renamed to match.** Replace `categoryId` with `categoryPath`
  and `attributesJson` with `attributes` on listings. On orders, replace `listingSnapshotJson` with
  `listingSnapshot`, `priceSnapshotJson` with `priceSnapshot`, and `checkoutShippingDetailsJson`
  with `checkoutShippingDetails`. Code that reads the old names gets a type error and, at runtime,
  `undefined`.
- **`checkoutShippingDetails` is now a typed object, not arbitrary JSON.** It is `null` or
  `{ name, email, phone, address: { line1, line2, city, state, postal_code, country } }`, where every
  field is a string or `null`. Narrowing code written against the old untyped JSON value can be
  removed; code that cast it to its own shape should switch to the exported type.
- **Three order statuses were removed from the types: `seller_cancelled`, `delivery_issue` and
  `resolved`.** The server never produced them, so no real order carries one, but they are no longer
  valid values for the `status` filter on `listOrders` or for the status field of an order. Code
  that names them will fail to type-check; delete those branches or filter values. (Dispute
  `resolved` is a different field and is unchanged.)
- **The `create_listing` MCP tool takes `categoryPath` instead of `categoryId`.** Tool inputs are
  strict, so an agent or saved prompt that still sends `categoryId` gets a validation error. Update
  the prompt or the call.
- **The listing MCP tools now validate their input before calling the API.** Titles over 200
  characters are rejected, and a `categoryPath` must be lowercase letters and digits separated by
  `-` or `/`. Callers that sent longer titles or other shapes were already getting a 400 from the
  server; they now get the error from the tool instead.

### Added

- `getMcpOAuthServerConfig()` (from `@joinmarka/sdk/mcp`) returns an MCP client configuration for
  the hosted gateway with no API key in it. The client signs in through the browser and holds a
  short-lived token that the account owner can revoke from Settings. Keep using `getMcpServerConfig`
  for scripts and CI, where there is no browser.
- The MCP configuration types (`MarkaHttpMcpConfig`, `MarkaStdioMcpConfig`, `MarkaOAuthMcpConfig`,
  `MarkaMcpServerConfig`, `MarkaMcpConfigOptions`, `MarkaMcpOptions`) are exported from the package
  root as types only, so importing them does not pull the MCP server into a browser bundle.
- Listings carry a `madeInCountry` field (an ISO 3166-1 alpha-2 country code such as `"CA"`, or
  `null`), which you can also set on `createListing` and `updateListing` and through the listing MCP
  tools; `null` clears it on an update. It is the item's country of manufacture: Marka sends it with
  international shipping rate requests, and it will be used on customs forms when shipping labels
  go live.
- The README explains the keyless OAuth setup.
- This changelog now ships inside the package.

### Changed

- `@mastra/core` is pinned to 1.68.0 (was 1.40.0), `@mastra/mcp` to 1.18.0 (was `^1.9.1`), and
  `zod` to 4.6.5 (was 4.3.6). The pins are exact. If your project also depends on these packages,
  align your versions with these so your package manager installs one copy of each.
- Nothing else about `MarkaClient` changed: the same methods, URLs, headers and error classes as
  0.1.0. The `marka-mcp-stdio` command and the other MCP tools are also unchanged.

### Fixed

- Importing `MarkaClient` from `@joinmarka/sdk` no longer loads zod. The client only needs a few
  constants and a string helper, which now come from a zod-free module, so browser and extension
  bundles that use only the client stay small. The MCP server remains available from
  `@joinmarka/sdk/mcp` only.

### Security

- Fixed a quadratic-time pattern in the base URL cleanup used by `MarkaClient` and the MCP helpers.
  A `baseUrl` ending in a very long run of `/` characters could keep the process busy for a long
  time (a regular-expression denial of service). Trailing slashes are now stripped in linear time,
  and the resulting URL is identical. This only matters if an untrusted value can reach `baseUrl`.

## 0.1.0 — 2026-08-18

Initial release.
