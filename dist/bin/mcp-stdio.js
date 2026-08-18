#!/usr/bin/env node
import { createMarkaMcpServer } from '../chunk-ODQTTHGL.js';
import '../chunk-JLHJWPED.js';

// src/bin/mcp-stdio.ts
function readFlag(argv2, name) {
  const prefixed = argv2.find((arg) => arg.startsWith(`--${name}=`));
  if (prefixed !== void 0) return prefixed.slice(`--${name}=`.length);
  const index = argv2.indexOf(`--${name}`);
  if (index !== -1 && index + 1 < argv2.length) return argv2[index + 1];
  return void 0;
}
var argv = process.argv.slice(2);
if (argv.includes("--help") || argv.includes("-h")) {
  process.stdout.write(
    "marka-mcp-stdio \u2014 Marka MCP server over stdio\n\n  --api-key=<key>    Marka API key (or set MARKA_API_KEY)\n  --base-url=<url>   API origin, scheme and host only (or set MARKA_BASE_URL)\n"
  );
  process.exit(0);
}
var apiKey = readFlag(argv, "api-key") ?? process.env.MARKA_API_KEY;
var baseUrl = readFlag(argv, "base-url") ?? process.env.MARKA_BASE_URL;
if (apiKey === void 0 || apiKey === "") {
  process.stderr.write("marka-mcp-stdio: no API key. Pass --api-key=mk_\u2026 or set MARKA_API_KEY.\n");
  process.exit(1);
}
var server = createMarkaMcpServer(baseUrl === void 0 ? { apiKey } : { apiKey, baseUrl });
await server.startStdio();
//# sourceMappingURL=mcp-stdio.js.map
//# sourceMappingURL=mcp-stdio.js.map