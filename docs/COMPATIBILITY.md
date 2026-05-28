# Compatibility matrix

Validated stacks for published **`@nuvio/*`** packages. Expand rows as Nuvio is tested on more environments.

## v0.3.0-alpha (Phase B — stack mastery)

Target release: **`0.3.0-alpha.0`** (see [CHANGELOG](../CHANGELOG.md), [nuvio_v0.3.0.md](./nuvio_v0.3.0.md)).

| Area | Supported | Notes |
| ---- | --------- | ----- |
| **Bundler** | Vite **5.4+** and **6.x** | `@nuvio/vite-plugin` peer. |
| **Framework** | React **18.3+** or **19.x** | `@nuvio/overlay` peer. |
| **Language** | TypeScript / TSX, JSX | Source index scans `.tsx` / `.jsx`. |
| **Styling (host)** | Tailwind CSS **3.4.x** or **4.x** | Overlay remains host-tailwind independent. |
| **Overlay UI** | Self-contained CSS + Shadow DOM | No host TW content entry needed for overlay UI. |
| **Wire protocol** | **v5** | Includes index v3 targeting + patch `activeBreakpoint`. |
| **Node** | **20+** | Matches repo engines. |
| **Package manager** | pnpm, npm, yarn | Monorepo uses pnpm. |

### v0.3 capabilities

- Hierarchy-first host selection with explicit `textTargets` and `styleTargets`.
- Tailwind depth controls across spacing/layout/typography/visual utility families.
- Breakpoint-aware patch writes (`base|sm|md|lg|xl`) for responsive class edits.
- Runtime gate: `NUVIO=0` or `nuvio({ enabled: false })`.
- Dogfood gate: `pnpm dogfood` + TailAdmin build pass before tagging.

---

## v0.2.0-alpha (Phase A — reliability)

Target release: **`0.2.0-alpha.0`** on npm **`alpha`** tag (see [CHANGELOG](../CHANGELOG.md)).

| Area | Supported | Notes |
| ---- | --------- | ----- |
| **Bundler** | Vite **5.4+** and **6.x** | `@nuvio/vite-plugin` peer. Vite 7/8: stretch goal; not validated for alpha. |
| **Framework** | React **18.3+** or **19.x** | `@nuvio/overlay` peer. |
| **Language** | TypeScript / TSX, JSX | Source index scans `.tsx` / `.jsx`. |
| **Styling (host)** | Tailwind CSS **3.4.x** or **4.x** | Host app Tailwind is independent of overlay chrome. |
| **Overlay UI** | **Self-contained CSS** + **Shadow DOM** | No host `tailwind.config` `content` entry for `@nuvio/overlay` required. |
| **Node** | **20+** | Matches repo `engines`. |
| **Wire protocol** | **v5** (`0.2.0-alpha`) | Index v2 metadata on `indexReady`; `RuntimeDiagnostics` on connect/index. |
| **Package manager** | pnpm, npm, yarn | Monorepo uses pnpm; consumers may use any. |
| **Browser** | Chromium, Firefox, Safari (current) | Dev WebSocket + overlay; TailAdmin dogfood smoke. |

### v0.2 fixtures (monorepo)

| App | Vite | React | Tailwind | Role |
| --- | ---: | ---: | ---: | --- |
| `apps/demo-app` | 6.x | 19 | 3.4.x | Clean v3 baseline |
| `apps/tailwind-v4-test` | 6.x | 19 | 4.x | CSS-first v4, no overlay in TW content |
| `apps/tailadmin-dogfood` | 6.x | 19 | 4.x | Real dashboard (TailAdmin clone) |

### v0.2 capabilities

- Overlay chip/editor/diagnostics isolated from host CSS (bundled `style.css`, Shadow DOM).
- Collision-aware positioning; versioned `localStorage` keys (`nuvio:*:v2`); reset position.
- Source index **v2**: file, line, tag/component name, literal `className`, map context, risk level.
- Diagnostics: Vite channel, stack versions where detectable, duplicate id errors, selection summary.
- Validate → diff preview → Apply → Undo (unchanged safety model).
- Runtime gate: `NUVIO=0` or `nuvio({ enabled: false })` disables Nuvio WS/index startup.

### Not supported (unchanged)

- **Next.js** / RSC.
- **`className` as** `cn()`, template literal, or non–string-literal expression.
- **Vue / Angular**.
- **Production** bundles without a documented no-op path ([DEV_ONLY.md](./DEV_ONLY.md)).

---

## v0.1.0 (Full MVP — `latest` on npm)

| Area | Supported | Notes |
| ---- | --------- | ----- |
| **Bundler** | Vite **5.4+** and **6.x** | `@nuvio/vite-plugin` peer. |
| **Framework** | React **18.3+** or **19.x** | `@nuvio/overlay` peer. |
| **Language** | TypeScript / TSX, JSX | Source index scans `.tsx` / `.jsx`. |
| **Styling** | Tailwind CSS **3.4.x** | Overlay UI needs Tailwind `content` to include `@nuvio/overlay` (see README §0.1). |
| **Node** | **20+** | Matches repo `engines`. |
| **Wire protocol** | **v4** (`0.1.0`) | Structural ops: `moveSibling`, `setHidden`, `duplicateHost`. |
| **Package manager** | pnpm, npm, yarn | Monorepo uses pnpm; consumers may use any. |
| **Browser** | Chromium, Firefox, Safari (current) | Dev WebSocket + overlay tested locally. |

### Full MVP features (0.1.0)

- Alpha property set plus alignment, gap, width/height, opacity, shadow.
- Sibling reorder, hide/show, duplicate (see [LIMITATIONS.md](./LIMITATIONS.md)).
- Validate → Apply, Undo last, dev-time index, draggable overlay chrome.

When reporting issues, include Vite, React, Tailwind, Node, and `@nuvio/*` versions plus a minimal repro if possible.
