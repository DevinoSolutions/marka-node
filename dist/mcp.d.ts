import { MCPServer } from '@mastra/mcp';

/**
 * The `bin` this package declares, which is what Claude Desktop spawns for the stdio bridge.
 *
 * It resolves as a bare command wherever @joinmarka/sdk is installed — from npm, inside this
 * monorepo, or from a checkout. Without an install, `npx -p @joinmarka/sdk marka-mcp-stdio` fetches
 * the package and runs the same bin; a checkout points `bridgeCommand` at the file instead.
 */
declare const MARKA_MCP_STDIO_BIN = "marka-mcp-stdio";
interface MarkaMcpOptions {
    /** An API key created in Marka account settings (`mk_…`). */
    readonly apiKey: string;
    /** API origin — scheme and host only, e.g. `http://localhost:3001`. Defaults to production. */
    readonly baseUrl?: string | undefined;
    /** Injectable transport, forwarded to the underlying {@link MarkaClient}. Tests use this. */
    readonly fetch?: typeof globalThis.fetch | undefined;
}
interface MarkaMcpConfigOptions {
    readonly apiKey: string;
    readonly baseUrl?: string | undefined;
    /**
     * How Claude Desktop should launch the stdio bridge, as `[command, ...args]`. Defaults to the
     * `marka-mcp-stdio` bin, which resolves once @joinmarka/sdk is installed. Without an install,
     * pass `["npx", "-p", "@joinmarka/sdk", "marka-mcp-stdio"]`; from a checkout, pass
     * `["node", "/abs/path/to/packages/sdk/bin/mcp-stdio.mjs"]`.
     */
    readonly bridgeCommand?: readonly string[] | undefined;
}
/** A `mcpServers` block for a client that speaks streamable HTTP natively. */
interface MarkaHttpMcpConfig {
    readonly mcpServers: {
        readonly marka: {
            readonly type: "http";
            readonly url: string;
            readonly headers: Readonly<Record<string, string>>;
        };
    };
}
/** A `mcpServers` block for claude_desktop_config.json, which spawns a stdio subprocess. */
interface MarkaStdioMcpConfig {
    readonly mcpServers: {
        readonly marka: {
            readonly command: string;
            readonly args: readonly string[];
            readonly env: Readonly<Record<string, string>>;
        };
    };
}
interface MarkaMcpServerConfig {
    /** Paste into any client that connects to a remote MCP server over streamable HTTP. */
    readonly http: MarkaHttpMcpConfig;
    /** Paste into claude_desktop_config.json, which has no HTTP transport and spawns a command. */
    readonly claudeDesktop: MarkaStdioMcpConfig;
}
/**
 * Ready-to-paste MCP client configuration for both transports.
 *
 * The HTTP form points at Marka's hosted gateway (`/api/mcp`) — the richer, database-backed
 * server. The Claude Desktop form runs THIS package's local server over stdio, because
 * claude_desktop_config.json cannot dial an HTTP MCP server directly.
 */
declare function getMcpServerConfig(options: MarkaMcpConfigOptions): MarkaMcpServerConfig;
/**
 * An MCP server exposing Marka's public API as tools, backed entirely by {@link MarkaClient}.
 *
 * Unlike the hosted gateway this runs in the CALLER's process against their own key, so the
 * error-redaction proxy that apps/ai/src/mastra/mcp.ts wraps its tools in is not repeated here:
 * there is no second party to leak to, and flattening a failure would cost the caller the status
 * and code (`entitlement_required`, `rate_limited`) their client needs to explain what went wrong.
 */
declare function createMarkaMcpServer(options: MarkaMcpOptions): MCPServer;

export { MARKA_MCP_STDIO_BIN, type MarkaHttpMcpConfig, type MarkaMcpConfigOptions, type MarkaMcpOptions, type MarkaMcpServerConfig, type MarkaStdioMcpConfig, createMarkaMcpServer, getMcpServerConfig };
