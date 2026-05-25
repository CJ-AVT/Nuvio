# Compatibility matrix

Validated stack for **`@nuvio/*` `0.1.0`** (Full MVP, npm **`latest`**) and **`0.1.0-alpha.x`** (`alpha` tag). Expand rows as Nuvio is tested on more environments.

| Area | Supported | Notes |
| ---- | --------- | ----- |
| **Bundler** | Vite **5.4+** and **6.x** | `@nuvio/vite-plugin` peer. |
| **Framework** | React **18.3+** or **19.x** | `@nuvio/overlay` peer. |
| **Language** | TypeScript / TSX, JSX | Source index scans `.tsx` / `.jsx`. |
| **Styling** | Tailwind CSS **3.4.x** | Overlay UI needs Tailwind `content` to include `@nuvio/overlay` (see README). Patches use a **fixed utility allowlist** + `tailwind-merge`. |
| **Node** | **20+** | Matches repo `engines`. |
| **Wire protocol** | **v4** (`0.1.0`) | Structural ops: `moveSibling`, `setHidden`, `duplicateHost`. |
| **Package manager** | pnpm, npm, yarn | Monorepo uses pnpm; consumers may use any. |
| **Browser** | Chromium, Firefox, Safari (current) | Dev WebSocket + overlay tested locally. |

## Full MVP features (0.1.0)

- Alpha property set plus alignment, gap, width/height, opacity, shadow.
- Sibling reorder, hide/show, duplicate (see [LIMITATIONS.md](./LIMITATIONS.md)).
- Validate → Apply, Undo last, dev-time index, draggable overlay chrome.

## Not supported

- **Next.js** / RSC (planned V2; see `implPlan.md` Phase 6).
- **`className` as** `cn()`, template literal, or non–string-literal expression — patches require a **string literal** `className` on the host node.
- **Vue / Angular** (out of scope for MVP).
- **Production** bundles: dev-only integration; do not ship the overlay in production without a documented no-op path.

When reporting issues, include Vite, React, Tailwind, Node, and `@nuvio/*` versions plus a minimal repro if possible.
