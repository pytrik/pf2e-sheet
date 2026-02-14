# Character Sharing — Research & Design

## Paste Service Research

Several external paste/storage services were evaluated for sharing character JSON (~10 KB for a level 2 character):

| Service | Issue |
|---------|-------|
| **dpaste.org** | No CORS headers — browser requests blocked |
| **Pastebin** | Requires API key; no CORS on free tier |
| **paste.rs** | Minimal API, but no CORS support |
| **JSONBin.io** | Requires auth header; free tier limits |
| **Firebase / Supabase** | Requires project setup, credentials, ongoing maintenance |
| **Hastebin** | Self-hosted instances unreliable; no guaranteed public CORS endpoint |

**Common problems:** CORS restrictions, authentication requirements, rate limits, service reliability, and added external dependency for a static site.

## Chosen Approach: Compressed URL Hash

The character data is compressed and encoded directly into the URL fragment (`#char=<data>`). This is entirely self-contained — no server, no API keys, no CORS issues.

### How It Works

1. `JSON.stringify` the character data
2. Compress with `CompressionStream('deflate-raw')` (browser built-in, no library needed)
3. Encode as base64url (URL-safe base64: `+/` replaced with `-_`, padding stripped)
4. Build URL: `https://site/#char=<encoded>`

To load: reverse the process — decode base64url, decompress with `DecompressionStream`, parse JSON.

### Technical Notes

- **Compression ratio:** deflate-raw typically achieves ~70-80% compression on JSON, reducing ~10 KB to ~2-3 KB of compressed data (~3-4 KB after base64 encoding).
- **URL length:** Most browsers support URLs of 2,000+ characters; Chrome supports ~2 MB in the hash. A compressed level 2 character produces URLs well within limits.
- **Format choice:** `deflate-raw` was chosen over `gzip` or `deflate` because it omits headers/checksums, producing the smallest output.
- **Browser support:** `CompressionStream`/`DecompressionStream` are supported in Chrome 80+, Firefox 113+, Safari 16.4+, Edge 80+.
- **No external dependencies:** Uses only browser built-in APIs (`CompressionStream`, `TextEncoder`, `btoa`/`atob`, `navigator.clipboard`).

### Trade-offs

- **Pro:** Zero infrastructure, works offline, no rate limits, no auth, link never expires
- **Con:** URL is long (but within limits), character data is visible in the URL (not encrypted, just compressed)
