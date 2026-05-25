# Nuvio implementation plan

This document turns the product requirements in `docs/PRD.md` into **phased engineering work**: ordered deliverables, exit criteria, dependencies, and explicit deferrals. It is the execution companion to the PRD.

---

## Guiding principles

1. **Correctness before chrome**: the AST and patch pipeline are the product; overlay polish follows trustworthy writes.
2. **Explicit contracts**: host apps opt in via stable ids and supported patterns; unsupported patterns fail loudly.
3. **Ship vertical slices**: each phase ends with an end-to-end path (select → patch → file → HMR), not a layer of unused infrastructure.
4. **Test the diff**: golden tests on TSX fixtures are non-negotiable for any phase that mutates source.
5. **Trust-first shipping**: **public alpha** is intentionally smaller than the full MVP so developers gain confidence before structural editing and richer chrome (see **Public alpha** below).

---

## Locked engineering decisions (from product review)

Do not re-litigate during sprint work:

| Topic | Decision |
| ----- | -------- |
| Tailwind | **Controlled utility whitelist** + **`tailwind-merge`** for composition. **Design tokens file sync** deferred until after alpha (see Phase 6 for token direction). |
| `id` → file resolution | **Dev-time source index**: AST scan of configured roots on dev start and on file change; map `data-nuvio-id` / wrapper ids → `{ filePath, node locator }`. Optional wrapper prop **`file="..."`** as escape hatch. |
| Undo | **Before each write:** store **previous full file contents in memory** (session-scoped, LRU/size capped), assign **operation id**; UI: **Undo last change** (short stack optional). **Git is supplementary**, not the primary undo. |
| Trust UX | **Diff preview** before disk write from alpha onward: at minimum human-readable `File: …` + `Change: …` summary. |
| Release order | **Public alpha** first (narrow feature cut); **full MVP** second (moves, toolbar extras, tree, remaining properties). |

---

## Product deliverable shape and developer workflow

So engineering scope stays aligned with **what we ship** and **how developers actually run it**:

### What we ship (engineering phases through full MVP)

* **npm packages** (monorepo `packages/*`), chiefly a **Vite plugin** and libraries that bundle or serve the **in-browser overlay** in dev.
* **Runtime surface:** the developer’s **localhost** app in the **browser** (e.g. Vite default port), with Nuvio edit UI injected only in development.
* **Persistence:** writes go to **files in the repo** via the dev server; **no** required hosted Nuvio webapp and **no** VS Code/Cursor extension in early phases.
* **Public alpha** is the first npm-published milestone (narrow scope, `alpha` dist-tag or `0.x`); **full MVP** follows on the same architecture with more surface area.

### How this connects to Cursor (or any editor)

* Integration is **workspace files on disk** + **localhost in the browser**. Cursor does not need a special Nuvio integration: it already reacts to file changes from the Vite/Nuvio dev pipeline.
* Docs and demo should spell out the **recommended layout**: editor + terminal (`npm run dev`) + browser on localhost with edit mode.

### Real-world usage in customer apps

1. Add dev dependencies and Vite plugin config.
2. Apply the **host contract** (`data-nuvio-id` / wrappers) to the components they want to refine visually.
3. Dev-only: run app, open localhost, use overlay; production builds exclude or no-op Nuvio.
4. Treat Nuvio output like any other commit (PRs, CI, rollbacks).

### Explicitly deferred (unless a later phase says otherwise)

* **Cursor/VS Code extension** that embeds the preview or drives patches from inside the editor (possible future UX improvement, not core MVP).
* **Hosted control plane** / cloud project UI (aligns with PRD V4 direction, not MVP implementation).

---

## Repository and package layout (target)

Aligns with the PRD monorepo sketch. Adjust names if tooling dictates, but keep **separation of concerns**.

```text
packages/
  shared/          # types, wire protocol, constants
  ast-engine/      # parse, locate, mutate, format hook; golden tests live here
  vite-plugin/     # Vite integration, dev server, WS, security boundaries
  overlay/         # selection UI, Editor panel, portals (published or bundled)

apps/
  demo-app/        # reference SaaS landing; contract test surface
```

**Phase 0** establishes this layout, workspace tooling (package manager, TypeScript project references, test runner), and CI running **lint + typecheck + unit/golden tests** on every push.

---

## Phase 0 — Foundation and skeleton

**Goal:** empty vertical path: plugin loads, overlay can connect, no-op or mock patch round-trip documented.

### Deliverables

* Monorepo with `packages/*` and `apps/demo-app` wired for local dev.
* `packages/shared`: versioned **wire protocol** (TypeScript types + zod or similar validation) for client ↔ dev server messages.
* `packages/vite-plugin`: dev-only middleware or transform hook; injects overlay bootstrap; opens WS server with **origin/host allowlist** for localhost.
* **Design note** (for Phase 1): document where the **dev-time source index** will live (vite-plugin module) and its scan roots config default.
* `packages/overlay`: minimal shell (toggle edit mode, ping/pong with server).
* `packages/ast-engine`: parse project file API stub; returns structured “unsupported” for unimplemented ops.
* **CI**: run tests and typecheck; document Node version.
* **Security stubs**: path normalization utility used everywhere files are written (single implementation).

### Exit criteria

* `pnpm dev` (or npm/yarn equivalent) in `demo-app` starts Vite; browser shows app; Nuvio dev channel connects without console errors.
* No file writes yet, or writes gated behind explicit feature flag.
* CONTRIBUTING or root README lists how to run demo and tests (short is fine).

### Dependencies

* None (greenfield).

### Risks

* Underestimating Vite hook ordering; mitigate with smallest possible plugin first, then expand.

---

## Phase 1 — MVP week 1: integration, selection, source index

**Goal:** user can enter edit mode, hover/select elements that expose ids, and see an Editor panel shell. **Id → file** resolves via the **dev-time index**, not guesswork.

### Deliverables

* **Dev-time source index** in vite-plugin (or dedicated module): scan configured `src` globs; extract `data-nuvio-id` and wrapper `id` props; build `id → { absoluteFilePath, nodeKey }`; watch mode invalidates stale entries; duplicate ids across project → **error at index time** with file:line hints.
* **Host contract enforcement**: selection only activates for indexed ids; runtime DOM sends **id only** to server.
* Overlay: hover outline, click selection, floating or docked **Editor panel skeleton** (sections can be empty).
* Vite plugin: stable dev URL, WS lifecycle, reconnect behavior.
* **Logging**: optional verbose log of incoming ops (no file content in logs by default).

### Exit criteria

* Demo app includes at least five distinct ids across layout regions; each selects correctly after HMR refresh; each resolves to the **correct file** via the index.
* WS rejects malformed payloads with typed error response.

### Dependencies

* Phase 0 complete.

---

## Phase 2 — MVP week 2: AST engine, text, Tailwind (whitelist + merge)

**Goal:** first **real** patches: inline text and **padding/margin** (and stubs for other whitelist groups) using **`tailwind-merge`** and a **versioned utility whitelist** checked into `shared` or `ast-engine`.

### Deliverables

* `ast-engine`: given `{ id }` from client, use index to open file + locate JSX node; update text children; update `className` via **whitelist + `tailwind-merge`** only.
* **Golden tests**: fixtures for (a) simple text node, (b) className merge removing conflicting spacing, (c) id not in index → error, (d) duplicate id in index → error, (e) unknown utility rejected.
* Patch pipeline: `shared` patch DTO → ast-engine → Prettier → write path (still behind confirm in Phase 3 for UX wiring).
* **Failure policy**: any ambiguity → no write + user-visible reason.
* **Diff preview payload**: server returns human-readable summary for overlay before apply (can be mocked in Phase 2, real in Phase 3).

### Exit criteria

* All golden tests green in CI.
* Demo app: edit hero title text and one padding/margin utility; HMR reflects change; git diff is limited to intended lines.

### Dependencies

* Phase 1 complete.

### Status

* **Complete** — AST patch pipeline (text + whitelist + `tailwind-merge`), golden tests, secure writes, protocol v3 (`dryRun`, `patchUndo`).

### Risks

* `cn()`, template literals, and spread props: **defer** to Phase 5 or document as unsupported until then with explicit error if detected.

---

## Phase 3 — Alpha feature-complete: properties, diff preview, undo, logs

**Goal:** complete the **first public alpha** slice from `docs/PRD.md` (typography subset, colors, radius, text, padding/margin; **no** drag moves, **no** duplicate/hide/move toolbar, **no** component tree requirement).

### Deliverables

* Property panel wired for **alpha-only** controls: font size/weight, text color, background color, border radius, padding/margin; all via **whitelist + `tailwind-merge`** (already locked in Phase 2).
* **Diff preview** in overlay: user sees summary **before** apply; **Apply** commits to disk; **Cancel** discards.
* **Undo stack (sharp):** before each successful write, store **previous full file contents** in memory (bounded LRU); assign **operation id**; **Undo last change** restores snapshot and triggers HMR; optional small multi-step stack.
* **Touched file log** after each apply.
* Prettier + diff minimization pass; hot reload hardened.

### Exit criteria

* Meets **First public alpha** definition of done in `docs/PRD.md`.
* Demo landing sections editable for **alpha** properties without hand-fixing TSX.
* Undo works for users who never run `git`.

### Dependencies

* Phase 2 complete.

### Status

* **Complete** — Alpha property controls (text, font size/weight, text/bg color, radius, padding/margin) via whitelist + merge; **Validate** (`dryRun`) required before **Apply**; **Cancel** clears validation; **Undo last** gated by server `undoStackDepth`; touched-file list + server `[Nuvio] touched` log; Prettier in ast-engine; demo landing instrumented for alpha flows. **Phase Alpha** covers npm publish, onboarding polish, and compatibility matrix.

---

## Phase Alpha — Public npm alpha

**Goal:** external early adopters can install and trust Nuvio on their own Vite apps.

### Deliverables

* Demo SaaS landing fully aligned with **alpha** scope; README onboarding under five minutes from clone.
* **npm publish** with **`alpha` dist-tag** (or `0.x` semver) and documented peer dependencies.
* **Compatibility matrix** stub; limitations (`cn()`, etc.) explicit.

### Exit criteria

* Dogfood: clean Vite+React+Tailwind template + Nuvio install succeeds using only published docs.
* No P0 issues: silent wrong-file write, missing undo, or missing preview on apply.

### Status

* **Repo complete** — `0.1.0-alpha.0` on all `@nuvio/*` publishable packages, `LICENSE` (MIT), root **`pnpm publish:alpha`**, consumer onboarding in [README.md](../README.md), [PUBLISHING.md](PUBLISHING.md), [COMPATIBILITY.md](COMPATIBILITY.md), [LIMITATIONS.md](LIMITATIONS.md), [CHANGELOG.md](../CHANGELOG.md). **Maintainer step:** run `pnpm publish:alpha` with npm access to the **`@nuvio`** scope, then verify install from a clean Vite app per README (closes dogfood exit criterion).

### Dependencies

* Phase 3 complete.

---

## Phase 4 — Full MVP: layout moves, toolbar, tree, remaining properties

**Goal:** deliver remaining **full MVP** PRD items **after** alpha trust: constrained sibling reorder / same-parent moves, toolbar duplicate/hide/move where feasible, optional left-rail component tree, remaining editable properties (gap, width/height, alignment, border width, opacity, shadows, etc.).

### Deliverables

* Layout moves: reorder siblings and move within same flex/grid parent **only** when AST structure matches supported patterns (golden tests per pattern).
* Toolbar extras; optional component tree (read-only first if lower risk).
* Expand golden fixtures for new operations.
* **npm**: promote toward **stable** semver when DoD met (separate from alpha tag).

### Exit criteria

* Meets **Full MVP** definition of done in `docs/PRD.md`.
* A developer can adopt full MVP features without regressing alpha guarantees (undo, preview, index).

### Dependencies

* Phase Alpha complete (per original sequencing: trust + publish before structural editing).

### Status

* **Slice 1 done** — Extended Tailwind allowlist + Editor panel for **text alignment**, **gap**, **width / max-height**, **opacity**, **shadow**; golden tests in `@nuvio/ast-engine`.
* **Slice 2–4 done** — `moveSibling`, `setHidden`, `duplicateHost` patch ops (protocol v4); Editor panel toolbar (move/hide/show/duplicate); curated text/background color lists; read-only **Indexed elements** tree; overlay chrome drag/collapse.
* **Full MVP DoD (repo)** — `0.1.0` semver, expanded tests/docs, `pnpm dogfood`, `publish:stable`; see [FULL_MVP_DOD.md](./FULL_MVP_DOD.md), [DOGFOOD.md](./DOGFOOD.md). **Maintainer:** npm `publish:stable` + external dogfood per DOGFOOD § B.

### Suggested execution order (once Phase 4 is approved to start)

1. ~~**Deferred properties (low structural risk)**~~ — **Slice 1 landed** (whitelist + panel + tests). Further properties (e.g. more `max-w-*`, flex tuning) can extend the same pattern.
2. **Constrained layout moves** — new patch op(s) for **sibling reorder** / **move within same flex or grid parent** only on supported AST patterns; golden fixtures per pattern; fail closed otherwise.
3. **Toolbar extras** — **duplicate**, **hide/show**, **move** actions wired to the patch pipeline with diff preview (ship incrementally behind tests).
4. **Optional component tree** — read-only left rail from dev-time index first; expand to navigation/selection if stable.

---

## Phase 5 — Post-MVP hardening (beta to GA for stack v1)

**Goal:** widen safe surface on **real** repos without abandoning the contract model.

### Deliverables

* Expand golden fixtures: fragments, conditional render wrappers, more Tailwind patterns.
* Optional `cn()` support behind feature flag with tests per pattern.
* Performance: debounce writes; batch rapid slider changes.
* DX: `NUVIO=0` (or equivalent) to disable plugin in CI; document.
* **Opt-in telemetry** spec (payload schema, opt-in flow); implementation can land here or early Phase 6 if legal review needed.

### Exit criteria

* Issue taxonomy for “unsupported pattern” errors; top five patterns documented with workarounds.
* No open P0 bugs for silent wrong-file or wrong-node writes.

### Dependencies

* Phase 4 complete.

---

## Phase 6 — V2: Next.js and advanced layout

**Goal:** support Next.js in documented modes (start with **Pages router** or **App Router client islands** only; expand explicitly).

### Deliverables

* Next.js adapter package or plugin mode: file resolution, dev server integration, id contract unchanged where possible.
* Visual flex/grid helpers (still source-backed).
* Responsive breakpoint editing (Tailwind breakpoints or token-driven).
* Design token file optional sync (JSON → Tailwind theme extension or agreed format).
* Component tree inspector (read-only first, then selective edit).

### Exit criteria

* Example Next app repo in `apps/` with same demo content passes edit flows for declared mode.
* Compatibility matrix updated with Next version lines.

### Dependencies

* Phase 5 complete.

### Risks

* RSC and server/client boundaries: gate features per route type; never claim full-app support until tested.

---

## Phase 7 — V3: AI-assisted and hybrid workflows

**Goal:** optional AI layer that **proposes** patches; human confirms; still source-first.

### Deliverables

* Prompt-to-patch proposal pipeline with review UI (build on the alpha **diff preview** pattern; multi-file and richer diffs as needed).
* Component generation stubs that output contract-compliant ids.
* Design system sync (export/import tokens and component metadata).

### Exit criteria

* No auto-apply of AI-generated patches without user confirmation by default.

### Dependencies

* Phase 6 complete.

---

## Phase 8 — V4: collaboration, cloud, ecosystem

**Goal:** team and org features; highest operational and security burden—only after local product is trusted.

### Deliverables

* Cloud project sync (encrypted at rest; clear data policy).
* Multiplayer or async review sessions.
* Figma import or link (scope TBD).
* Deployment helpers (e.g. export static, or CI hooks)—strictly opt-in.

### Exit criteria

* SOC2-oriented checklist started (access control, audit logs, data deletion); legal/privacy pages.

### Dependencies

* Phase 7 complete and sustainable support load for core product.

---

## Cross-cutting workstreams (all phases)

| Workstream            | Owner focus | Notes |
| --------------------- | ----------- | ----- |
| Wire protocol + validation | vite-plugin + shared | Every message schema-versioned. |
| Golden tests          | ast-engine  | Grow with every new mutation. |
| Source index          | vite-plugin | Scan, invalidate, duplicate-id detection. |
| Security reviews      | vite-plugin | Path confinement, CSRF/WS origin, rate limits on dev endpoints. |
| Docs                  | all         | Install, matrix, limitations, troubleshooting. |
| Release               | root        | Changesets or equivalent; changelog. |

---

## Milestone summary

| Phase     | Name                         | User-visible outcome |
| --------- | ---------------------------- | -------------------- |
| 0         | Foundation                   | Monorepo, CI, protocol, secure write utilities |
| 1         | Selection + source index     | Edit mode, hover/select, **id → file** via dev-time AST index |
| 2         | First real patches           | **Done** — Text + **whitelist + `tailwind-merge`**; golden tests in CI |
| 3         | Alpha feature-complete       | **Done** — Alpha property set, **Validate required before Apply**, **undo last patch** + stack depth, touched-file log |
| **Alpha** | **Public npm alpha**         | **Done (repo)** — `alpha` tag + `0.1.0-alpha.0`; publish + dogfood per README / PUBLISHING |
| 4         | Full MVP                     | **Complete (repo)** — `0.1.0`, tests/docs/dogfood gate; npm `latest` publish is maintainer step |
| 5         | Hardening                    | Real-world patterns, perf, CI disable, telemetry spec |
| 6         | V2 Next + layout depth       | Next adapter, responsive, tokens, tree |
| 7         | V3 AI hybrid                 | Proposals + confirmation + design system |
| 8         | V4 Cloud + collab            | Teams, sync, Figma/deploy ecosystem |

---

## What to build first (single sentence)

Ship **Phase 0 → Phase 3** as fast as possible without skipping the **source index**, **golden tests**, **diff preview**, or **in-memory undo**; then **Phase Alpha** for a narrow public cut; **Phase 4** adds movement and richer UI only after that trust milestone.
