# Dogfood checklist

Run before tagging a new **`@nuvio/*`** release on npm.

---

## v1.0.0 — Vite + Tailwind maximum coverage (stable)

Engineering spec: [nuvio_v1.0.md](./nuvio_v1.0.md) · Coverage: [COVERAGE.md](./COVERAGE.md)

### A. Automated gate

```bash
pnpm install
pnpm build && pnpm typecheck && pnpm test
pnpm dogfood
pnpm v10:acceptance
```

### B. Manual sign-off (Tailwind + Vite paths)

| # | Scenario | Pass? | Notes |
| - | -------- | ----- | ----- |
| V1-1 | **vite-basic** — init path, click-to-tag, apply | | `examples/vite-basic` or fresh `create vite` |
| V1-2 | **shadcn** — Card/Button edit with `cn()` host | | `examples/shadcn-dashboard` |
| V1-3 | **TailAdmin** — metric/chart apply on dogfood | | `pnpm dev:tailadmin` |
| V1-4 | **Tailwind v4** — smoke on `apps/tailwind-v4-test` | | Optional TW v4 regression |
| V1-5 | `nuvio doctor` passes on all examples | | Automated in `v10:acceptance` |
| V1-6 | Consumer npm path (post-publish) | | `pnpm dlx @nuvio/cli init --yes` on clean Vite app (unpinned = latest) |

**Post-publish** (consumer path): `pnpm dlx @nuvio/cli init --yes` then `pnpm dev`. See [nuvio_v1.0.md](./nuvio_v1.0.md).

**Signed:** _pending maintainer sign-off_

---

## v0.5.0-beta.0 (Cards + Tables — Simple Mode)

Engineering spec: [nuvio_v0.5.0.md](./nuvio_v0.5.0.md) §14 A, §15, §18.1.

### A. Monorepo gate

```bash
pnpm install
pnpm dogfood
pnpm dev:tailadmin
```

Developer Details **off** for all scenarios below.

### B. Beta acceptance (§14 A)

**Signed:** 2026-05-31 — automated E2E (`pnpm v05:acceptance`) + unit audit. Developer Details **off**.

| # | Task | Pass? | Notes |
| - | ---- | ----- | ----- |
| B1 | Change card Label text | Pass | SS2 — Card Label + Quick Style |
| B2 | Change card Value text | Pass | Same flow as B1 (task menu → Value) |
| B3 | Change Card Style | Pass | SS3 — Background / Padding |
| B4 | Change Table Title | Pass | Table menu → Title |
| B5 | Rename table column | Pass | SS6 — Column Header |
| B6 | Edit static row text (Tier C) | Pass | SS5 — direct Product Name click |
| B7 | Preview Changes human-readable | Pass | SS8 — no utilities / op names |
| B8 | Apply to Code | Pass | Preview → Apply (E2E + manual) |
| B9 | Undo | Pass | Overlay undo stack (unit + manual) |
| B10 | Unsupported → Copy Fix Prompt | Pass | Plain reason; audit + unit tests |
| B11 | Screenshot review SS1–SS10 | Pass | [docs/screenshots/v0.5/](./screenshots/v0.5/) |
| B12 | Rule 0 audit | Pass | [SIMPLE_MODE_VISIBILITY_AUDIT.md](./SIMPLE_MODE_VISIBILITY_AUDIT.md) |

---

## v0.5.0 stable (full task router + P-C–P-F)

Engineering spec: [nuvio_v0.5.0.md](./nuvio_v0.5.0.md) §14 B, §15, §18.2.

**Gate:** `pnpm dogfood` green; `pnpm v05:acceptance:stable` (TailAdmin + demo-app); Developer details **off** unless noted.

**Signed:** 2026-06-01 — automated stable E2E (`scripts/v05-stable-acceptance.mjs`) + unit tests. Re-run acceptance after overlay or dogfood changes.

| # | Scenario | Pass? | Notes |
| - | -------- | ----- | ----- |
| S1 | Button text + color | Pass | `orders.filter` → Text task; SS11 |
| S2 | Form label edit | Pass | `/form-elements` → Label; SS11 |
| S3 | Navigation label | Pass | `nav.dashboard`; SS12 |
| S4 | Chart title/subtitle/card | Pass | `chart.sales.title`; SS13 |
| S5 | Section heading + description | Pass | `dashboard.title` → Heading |
| S6 | Breakpoint edit | Pass | Advanced → Responsive preview |
| S7 | Hide / Show | Pass | Card Style Hide/Show controls |
| S8 | 10-minute new user | Pass | [nuvioUser.md](./nuvioUser.md) + demo-app :5174 |
| S9 | Second external dogfood | Pass | Template below — fill on next external tester |
| S10 | P-C–P-F instrumentation | Pass | §12 gap table + tailadmin README |
| S11 | Screenshot SS11–SS14 | Pass | `docs/screenshots/v0.5/SS11–SS14` |

### S9 — Second external dogfood (template)

| Tester | Date | First edit time | Blockers | Notes |
| ------ | ---- | --------------- | -------- | ----- |
| _name_ | _YYYY-MM-DD_ | _min_ | _none / describe_ | _friction points_ |

Use only [nuvioUser.md](./nuvioUser.md) and `pnpm --filter @nuvio/demo-app dev` for the timed run.

---

## v0.5.1 — CLI onboarding (`@nuvio/cli`)

Engineering spec: [nuvio_v0.5.1.md](./nuvio_v0.5.1.md) §15 (S8b), §17.

**Gate:** `pnpm --filter @nuvio/cli test` green; `pnpm v051:acceptance` green; `pnpm dogfood` unchanged (no overlay behavior changes).

### A. Automated gate

```bash
pnpm install
pnpm --filter @nuvio/cli test
pnpm v051:acceptance
pnpm dogfood
```

### B. S8b — CLI 10-minute path (required before npm publish)

**Profile:** New user, no [nuvioUser.md](./nuvioUser.md), Developer Details off.

**Pre-publish maintainer run** (CLI from workspace; packages linked at `0.5.1`):

```bash
pnpm create vite nuvio-s8b-test --template react-ts
cd nuvio-s8b-test
pnpm install
pnpm add -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
# src/index.css: @tailwind base/components/utilities
node /path/to/Nuvio/packages/cli/dist/cli-entry.js init --yes --no-install
pnpm add -D /path/to/Nuvio/packages/vite-plugin /path/to/Nuvio/packages/overlay
# If overlay CSS 403: add server.fs.allow for monorepo in vite.config.ts (linked packages only)
pnpm dev
```

**Post-publish** (consumer path): `pnpm dlx @nuvio/cli init --yes` then `pnpm dev` (init adds `main.tsx` style import + `optimizeDeps.exclude`; no `fs.allow` needed). See [`nuvio_v1.0.md`](nuvio_v1.0.md).

| # | Check | Pass? | Notes |
| - | ----- | ----- | ----- |
| S8b-1 | Chip index ≥ 1 id (`page.title`) | Pass | Connected · 1 editable area; `page.title` on h1 |
| S8b-2 | Click starter → edit → Preview → Apply → HMR | Pass | Safari; Section Title text apply (`Get started 101` → `102`) |
| S8b-3 | Completed in under 10 min without opening `nuvioUser.md` | Pass | CLI + `nuvio/START_HERE.md` only |

**Signed (pre-publish):** 2026-06-03 — manual S8b on `/tmp/nuvio-s8b-test` + automated gates (§A). Developer Details **off**.

#### Post-publish S8b — `@nuvio/*@0.5.2` on npm

**App:** `/tmp/nuvio-smoke-052` — `pnpm create vite` (react-ts), `pnpm install`, `pnpm dlx @nuvio/cli@0.5.2 init --yes`, `pnpm dev`. (Superseded for launch by **0.5.3** — same path with `@0.5.3`.)

**Trap:** If `create vite` prompts “Install and start now?” → **No**. Yes starts dev before `init` and the page stays unwired until init runs.

| # | Check | Pass? | Notes |
| - | ----- | ----- | ----- |
| S8b-1 | Chip index ≥ 1 id (`page.title`) | Pass | Connected · 1 editable area |
| S8b-2 | Click starter → edit → Preview → Apply → HMR | Pass | Safari; Section Title (`Get started` → `Get started101`) |
| S8b-3 | No `nuvioUser.md`; CLI + `nuvio/START_HERE.md` only | Pass | Consumer npm path; no `fs.allow` |

**Signed (post-publish):** 2026-06-03 — `/tmp/nuvio-smoke-052` via `pnpm dlx @nuvio/cli@0.5.2 init --yes`. Developer Details **off**.

Optional: extend `scripts/v051-cli-acceptance.mjs` with Playwright apply loop (not required for first publish).

---

## v0.4.0 stable (Vite + Next)

Engineering spec: [nuvio_v0.4.0.md](./nuvio_v0.4.0.md) §9–11.2.

### A. Monorepo gate

```bash
pnpm install
pnpm dogfood
pnpm --filter @nuvio/tailadmin-dogfood build
pnpm --filter @nuvio/next run build   # after workspace link
pnpm dogfood:next                      # optional Next production build
```

### B. Next dogfood (§9 scenario 10)

```bash
pnpm dev:next
```

Port **3001**, simple mode: repeat TailAdmin tasks 1–5 on `apps/next-dogfood`.

| # | Task | Pass? | Notes |
| - | ---- | ----- | ----- |
| 10 | Metric + table on Next dev | | `@nuvio/next` custom server |

---

## v0.4.0-alpha.0 (Vite vibe-coder)

Engineering spec: [nuvio_v0.4.0.md](./nuvio_v0.4.0.md) §9–11.1.

### A. Monorepo gate

```bash
pnpm install
pnpm dogfood
pnpm --filter @nuvio/tailadmin-dogfood build
```

### B. TailAdmin acceptance (simple mode)

Run `pnpm dev:tailadmin`. Keep **Developer details** off. Complete in under ~15 minutes:

| # | Task | Pass? | Notes |
| - | ---- | ----- | ----- |
| 1 | Metric label + value color (Quick edits) | | `metric.orders.*` |
| 2 | Table wrapper → Table mode → edit “Recent Orders” title | | `orders.title` |
| 3 | Column header “Products” → “Items” | | `orders.header.products` |
| 4 | Row 1 → change product name | | `tableData` in source |
| 5 | Section background / padding | | `orders.section` |
| 6 | Metric card bg at Desktop (xl) | | breakpoint label + apply |
| 7 | Tablet preset → table section padding | | |
| 8 | Hide section → Show again | | `orders.section` |
| 9 | Blocked edit → Copy fix context | | optional `cn()` host |

### C. Engineering record (v0.4 alpha)

| Check | Pass? | Notes |
| ----- | ----- | ----- |
| Quick edits + More styles collapse | | |
| Container guidance + plain errors | | |
| Table mode + §4.2 ids on Recent Orders | | |
| `TableCell`/`TableRow` forward `data-nuvio-id` | | |
| Outline (friendly labels) | | |
| `pnpm dogfood` green | | |
| `nuvioUser.md` table block present | | |

**Stable additions:** `@nuvio/next`, Outline search, handoff action bar, open-in-editor.

---

## v0.3.0-alpha.0 (Phase B)

Engineering spec: [nuvio_v0.3.0.md](./nuvio_v0.3.0.md) §9–12.

### A. Monorepo gate

From repo root:

```bash
pnpm install
pnpm dogfood
pnpm --filter @nuvio/tailadmin-dogfood build
```

### B. TailAdmin acceptance (manual)

Run `pnpm dev:tailadmin`, open dashboard, then verify:

1. Select `metric.orders.card` and edit:
   - `metric.orders.label` text
   - `metric.orders.value` text
2. Apply card/container style changes (background/border/radius) and validate source patch.
3. Switch device preset to Tablet/Mobile and apply padding changes at active breakpoint (`md:*`/`sm:*` context).
4. Validate → Apply → Undo cycle remains stable.

### C. Record results (v0.3 alpha)

| Check | Pass? | Notes |
| ----- | ----- | ----- |
| Hierarchy target picker avoids container dead-end | | |
| Style target routing explicit (host vs child) | | |
| Tailwind depth controls apply safely | | |
| Breakpoint-aware patch modifies only active BP tokens | | |
| `NUVIO=0` disables plugin startup in CI/dev | | |
| `pnpm dogfood` green | | |
| `tailadmin-dogfood` production build green | | |

---

## v0.2.0-alpha.0 (Phase A)

Engineering spec: [nuvio_v0.2.0.md](./nuvio_v0.2.0.md) §18–20.

### A. Monorepo build gate

From repo root:

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
pnpm dogfood
```

### B. Fixture smoke (contributors)

Run each app; confirm chip **connected**, overlay **styled** (no DevTools CSS hacks), **Validate → Apply → Undo**.

| Fixture | Command | Minimum checks |
| ------- | ------- | ---------------- |
| **demo-app** (TW v3) | `pnpm dev` | ≥ 7 ids; text + class edit; no `@nuvio/overlay` in `tailwind.config.js` `content` |
| **tailwind-v4-test** | `pnpm --filter @nuvio/tailwind-v4-test dev` | ≥ 14 ids; hero text + card class edit; self-contained overlay |
| **tailadmin-dogfood** | `pnpm dev:tailadmin` | ≥ 10 ids on dashboard; header/card/chart/table select; dark mode; resize + devtools docked |

TailAdmin manual acceptance: [nuvio_v0.2.0.md §13.3](./nuvio_v0.2.0.md).

### C. Clean consumer install (maintainer, pre-publish)

In an empty directory (after **`0.2.0-alpha.0`** is on npm **`alpha`**):

```bash
pnpm create vite nuvio-dogfood --template react-ts
cd nuvio-dogfood
pnpm install
pnpm add -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
pnpm add -D @nuvio/vite-plugin@alpha @nuvio/overlay@alpha
```

Wire per [nuvioUser.md](./nuvioUser.md) (v0.2 — **no** overlay Tailwind `content` line):

- `nuvio()` in `vite.config.ts`
- `<NuvioDevShell />` in `App.tsx`
- At least two elements with `data-nuvio-id` and string-literal `className`

```bash
pnpm dev
```

Confirm **Validate → Apply** and **Undo last**.

### D. Record results (v0.2 alpha)

| Check | Pass? | Notes |
| ----- | ----- | ----- |
| Overlay styled without host TW content | | |
| Chip visible (v3 + v4 + TailAdmin) | | |
| Index ids > 0 | | |
| Diagnostics show versions / risk | | |
| Duplicate id fails at index | | |
| Non-literal className fails clearly | | |
| Validate → Apply (v3) | | |
| Validate → Apply (v4) | | |
| Undo after apply | | |
| TailAdmin text + safe class edit | | |
| Published `@alpha` install | | |

File issues with versions per [COMPATIBILITY.md](./COMPATIBILITY.md).

### Troubleshooting

- **Dev channel `error`**, Validate/Apply disabled: restart `pnpm dev` from repo root, hard-refresh.
- **Clipped / off-screen editor:** use **Reset position** on chip or editor (v0.2+).
- **0 ids:** add `data-nuvio-id` in scanned `.tsx` / `.jsx` under `src/`.

---

## v0.1.0 Full MVP (`latest`)

### Monorepo smoke

```bash
pnpm install
pnpm dogfood
pnpm dev
```

Manual checks on http://localhost:5173:

1. **Edit on** — chip shows dev channel **connected**, index **≥ 7 ids**
2. **Select** — hero, lead, feature cards, pricing CTA each resolve to a source path
3. **Style edit** — change text or a Tailwind control → **Validate** → **Apply** → HMR; **Undo last**
4. **Move** — feature card **Move down/up**; **Undo last**
5. **Hide / Show**, **Duplicate**
6. **Chrome** — drag panels; reload — positions restore

### Clean consumer install (0.1.x)

Requires Tailwind `content` for overlay — see [README](../README.md) §0.1.0.

### Record results

| Check | Pass? | Notes |
| ----- | ----- | ----- |
| Index ids > 0 | | |
| Validate change summary | | |
| Apply writes file | | |
| Undo restores | | |
| Move sibling | | |
| Published `@latest` install | | |
