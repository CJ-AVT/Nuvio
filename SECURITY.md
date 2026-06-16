# Security

nuvio is a **local development tool**. It is not designed for production runtime and does not make outbound analytics or telemetry calls.

## Dev server threat model

When the `@nuvio/vite-plugin` is enabled during `vite dev`:

| Surface | Risk |
|---------|------|
| `WS /__nuvio/ws` | Can read the source index and **write project source files** (patch, tag, undo) |
| `PUT/POST /__nuvio/brand` | Can **write** `nuvio/brand.json` |
| `GET /__nuvio/pcc` | Reads PCC manifests for the current route |
| `GET /__nuvio/dev-token` | Returns the per-server auth token (localhost `Origin` only) |

### Mitigations

1. **Per-server dev token** — generated at dev-server start; required on WebSocket upgrade (query param) and brand writes (`Authorization: Bearer`).
2. **Origin policy** — WebSocket upgrades require a `localhost` / `127.0.0.1` `Origin` header.
3. **Path guards** — file writes use `assertPathWithinRoot` to block path traversal.
4. **Serve-only plugin** — the Vite plugin uses `apply: "serve"`; patch APIs do not run on `vite build`.

### Recommendations

- Keep the dev server on **localhost** (`server.host: 'localhost'`). The plugin warns if bound to `0.0.0.0`.
- Do not tunnel or expose the dev server to untrusted networks without additional controls.
- Treat anyone who can reach the dev server as able to modify files inside the project root (subject to path guards).

## Reporting issues

Open a GitHub issue on [ehah/Nuvio](https://github.com/ehah/Nuvio) with reproduction steps. For sensitive reports, contact the repository maintainer privately.

## Privacy

nuvio does **not** collect usage telemetry. No third-party analytics SDKs are bundled in `@nuvio/cli` or `@nuvio/overlay`.
