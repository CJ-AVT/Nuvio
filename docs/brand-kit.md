# Brand Kit — selection-driven project branding

This document is the **source of truth** for Nuvio Brand Kit: how users define one project brand (`nuvio/brand.json`) and apply it per UI category on the live page.

Related: PCC manifests (`nuvio/pages/*.pcc.yaml`) — see `packages/shared/src/coverage-contract.ts` and dogfood examples under `apps/tailadmin-dogfood/nuvio/pages/`.

---

## Canonical user sequence (target UX)

This is the **intended end-to-end flow**. All Brand Kit work should align to these six steps.

| Step | What happens | User sees |
|------|----------------|-----------|
| **1. Turn on Editor** | User clicks the **nuvio** chip → **Edit** (edit mode on). | Chip shows “Editing”; page becomes selectable. |
| **2. Brand Kit opens** | Editor panel opens with the **Brand Kit** tab active (or user switches to it). | Prompt: *“Select a component on the page to define or review its branding.”* Presets/sample are **empty or muted** until a selection exists. |
| **3. User selects on page** | User clicks an indexed host (card, button, table, form field, etc.). | Brand Kit **infers the category** and **reads live styles** from that host (or the first host of the category) so presets reflect actual color, radius, density, and typography on the page. |
| **4. User defines branding** | User adjusts **category-labeled** controls and **Save Brand** (`nuvio/brand.json`). | e.g. card: **Border color**, **Corners**, **Spacing** — not a generic “Color” that also changes button fill. |
| **5. Validate** | User clicks **Validate all &lt;category&gt; (N)** (category from step 3). | AST dry-run for every matching host of that category **on the current page**; action bar shows summary. |
| **6. Apply to Code** | User clicks **Apply to Code** in the action bar. | Patches are written to source; HMR updates the live page. |

**Flow shorthand:** `Edit on → select component → define brand → Validate → Apply to Code`

### Plain language ↔ tokens (step 4)

Users think in **category slots**; Brand Kit stores **project tokens** (v1.6+):

| User-facing label (varies by category) | Token | Typical use |
|----------------------------------------|-------|-------------|
| Fill / Border color / Text color / Tint / Field border | `accent` | Hue applied to the **active category slot** |
| Surface (card, v1.7+) | `surface` | Card/table background |
| Corners | `radius` | Buttons, cards, inputs, tables |
| Spacing | `density` | Button, card, input padding |
| Heading style | `typography` | Heading size + weight |

**v1.5:** single label “Color” maps to `accent` everywhere — migrate UI labels in v1.6 without breaking `brand.json`.

**Fixed (not accent):** body text gray, form labels gray, button label white on solid fill, badge pill shape.

### Composite components (step 3)

A **composite** is a container whose subtree includes multiple brand roles — e.g. `orders.card` with `orders.title` (heading), body text, and `orders.filter` (button).

When the user selects the **card wrapper**:

| Brand Kit area | Behavior |
|----------------|----------|
| **Presets** | Driven by the **primary category** of the selection (`card` → color, radius, density). |
| **Sample** | Card sample (shell styles). |

When the user selects a **leaf** (e.g. `orders.filter`), presets use that host’s category only (`button`).

**Scope:** **Validate / Apply** run the **category bulk recipe** for all hosts of that category on the page (not only the selection subtree). The live page is the review surface before validate.

### Selection → category inference

| Selection signal | Inferred category |
|------------------|-------------------|
| `hierarchyRole`, `tagName`, host id suffix (`.card`, `.table`, …) | Maps via `entryMatchesBrandBulkAction` / index metadata |
| Ambiguous host | Closest brandable ancestor or explicit PCC category for that id |
| Non-brandable (e.g. `nav.*`) | Brand Kit shows: *“This element isn’t brandable — use Edit tab.”* |

Category chips in the panel (Phase 2) remain as a **secondary control** when the user wants to brand a category without clicking a specific host.

---

## Core idea (technical)

Brand Kit brands the **whole project** using **one saved brand** (`nuvio/brand.json`), applied **per UI category** (button, card, heading, text, table, form, badge).

**Primary axis:** page **selection** → inferred **category** → contextual presets + validate.

**Secondary axis:** category chips (manual override when nothing is selected or user switches category).

**Not in scope for v1.x:** per-instance brands (`orders.card` vs `metric.customers.card` with different colors), or a separate preview-only screen.

**In scope from v1.6:** per-category **property labels** and **semantic tokens** (still one project brand file; see [Category slot model](#category-slot-model-tokens--slots)).

---

## Product decisions (Nuvio defaults)

These resolve the open design questions. **Implement against this table** unless a future RFC explicitly changes it.

| Question | Decision for Nuvio | Rationale |
|----------|-------------------|-----------|
| **One accent or per-category colors?** | **One project accent** (`accent` hue) shared across categories. Categories **consume** it in different slots (border vs fill vs text). **Optional per-category slot overrides** in v2 — not seven independent palettes in v1.6. | Brand Kit = **project-wide consistency**. Per-instance color differences belong in the **Edit** tab. |
| **Text & form labels brandable?** | **No accent on body text or form labels.** Body text uses a **fixed readable muted** recipe (`text-sm font-normal text-gray-600`). Form labels use a **fixed label** recipe (`text-sm font-medium text-gray-700`). | Readability and hierarchy; accent on paragraphs/labels harms UX and fights Tailwind page templates. |
| **Hover / focus in Brand Kit?** | **v1.6–v1.7: rest state only.** **v1.8:** optional **hover** presets for **button** (and optionally **card** elevation/border). **Focus rings:** defer — a11y-critical, better handled in Edit or a dedicated a11y pass. | Variant prefixes (`hover:`, `focus:`) multiply inference, allowlist, and UI complexity. Ship solid branding first. |
| **Responsive (`sm:` / `xl:`)?** | **Brand Kit writes base (default) utilities only.** Inference may read at **active device breakpoint** in the overlay for display accuracy; **apply** merges **non-responsive** recipe fragments. Per-breakpoint brand = **Edit tab**, not `brand.json`. | Dogfood already uses `xl:` overrides; multi-breakpoint brand files don't scale for Simple Mode. |
| **Arbitrary Tailwind pickers?** | **Never in Brand Kit.** Curated enums per category slot only (`BRAND_COLORS`, surface options, etc.). | Keeps validate/allowlist/CLI predictable; Edit tab owns one-off utilities. |
| **“Color” in UI?** | **Retire generic “Color” label by v1.6.** Use **category slot labels** (Border color, Fill, Text color, …). Internal preset key may stay `color` until v1.7 schema migration. | Users expect the control to match what changes on the selected category (see screenshot: rose card border ≠ “theme color” mental model). |

---

## Category slot model (tokens + slots)

Brand Kit is **not** a full theme editor. It is **category recipe branding**: each UI category has a small set of **slots** filled from **project tokens**.

### Layer 1 — Project tokens (`nuvio/brand.json` v1.6+)

```ts
// Target shape (v1.6). v1.5 flat file remains supported via normalize/migrate.
type BrandTokens = {
  accent: BrandColor;           // primary hue: blue | purple | green | slate | rose
  surface: "white" | "muted";   // card/table shell background
  radius: BrandRadius;
  density: BrandDensity;
  typography: BrandTypography;  // headings (size + weight bundle)
};
```

| Token | User label | Typical Tailwind role |
|-------|------------|------------------------|
| `accent` | Brand accent | Hue family for borders, fills, heading text, badge tint |
| `surface` | Surface | Card/table background (`bg-white` / `bg-slate-50`) |
| `radius` | Corner style | `rounded-*` on branded hosts |
| `density` | Spacing | Padding scales per category recipe |
| `typography` | Heading style | Heading size + weight |

**v1.5 compatibility:** `{ color, radius, density, typography }` maps to `{ accent: color, surface: "white", … }` in `normalizeBrandConfig`.

### Layer 2 — Category slot maps (how tokens become classes)

Each category recipe reads **slots**, not a single ambiguous “color”:

| Category | Slots (user-facing) | Token / fixed source | v1.5 today |
|----------|---------------------|----------------------|------------|
| **button** | Fill · Label color · Corners · Spacing | `accent` → `bg-{accent}-600` · fixed `text-white` · `radius` · `density` | same (label hidden) |
| **card** | Surface · Border color · Corners · Spacing | `surface` · `accent` → `border-{accent}-300` · `radius` · `density` | `bg-white` fixed |
| **heading** | Text color · Heading style | `accent` → `text-{accent}-600` · `typography` | same |
| **text** | Body style (read-only) | **Fixed recipe** — not accent | fixed gray |
| **table** | Border color · Corners | `accent` · `radius` | same |
| **form** | Label style (read-only) · Field border · Corners · Spacing | fixed label · `accent` · `radius` · `density` | same |
| **badge** | Tint · Text · Shape | `accent` → `{accent}-100` / `{accent}-700` · fixed pill | same |

### Layer 3 — Per-category overrides (v2, optional)

```json
{
  "tokens": { "accent": "rose", "surface": "white", "radius": "soft", "density": "balanced", "typography": "bold" },
  "overrides": {
    "heading": { "textColor": "purple" }
  }
}
```

Overrides apply **only** when explicitly set; default is token consumption. **Not required for v1.6.**

---

## Category property matrix (full target)

Properties listed are **Brand Kit controls** (curated enums), not every Tailwind utility. **Rest state** unless noted.

### Button

| Slot | v1.6 | v1.7 | v1.8 | Notes |
|------|:----:|:----:|:----:|-------|
| Fill | ✓ | ✓ | ✓ | `accent` → `bg-{accent}-600` |
| Label color | — | ✓ | ✓ | solid: white; outline variant: `text-{accent}-600` |
| Variant (solid / outline) | — | ✓ | ✓ | Outline uses border + transparent fill |
| Corners | ✓ | ✓ | ✓ | `radius` |
| Spacing | ✓ | ✓ | ✓ | `density` → `px`/`py` |
| Hover fill | — | — | ✓ | `hover:bg-{accent}-700` |
| Focus ring | — | — | — | Defer / Edit tab |

### Card

| Slot | v1.6 | v1.7 | v1.8 | Notes |
|------|:----:|:----:|:----:|-------|
| Surface | — | ✓ | ✓ | `white` \| `muted` |
| Border color | ✓ | ✓ | ✓ | `accent` (UI label **Border color**, not “Color”) |
| Corners | ✓ | ✓ | ✓ | `radius` |
| Spacing | ✓ | ✓ | ✓ | `density` → `p-*` |
| Shadow | — | — | ✓ | none \| sm \| md |
| Hover | — | — | ✓ | optional border/shadow lift |

### Heading

| Slot | v1.6 | v1.7 | v1.8 | Notes |
|------|:----:|:----:|:----:|-------|
| Text color | ✓ | ✓ | ✓ | `accent` (UI: **Text color**) |
| Size + weight | ✓ | ✓ | ✓ | `typography` bundle |

### Text (body)

| Slot | v1.6 | v1.7 | v1.8 | Notes |
|------|:----:|:----:|:----:|-------|
| Color / size / weight | **Fixed** | **Fixed** | **Fixed** | `text-sm font-normal text-gray-600` |
| Typography chip in UI | ✓ | read-only note | read-only | Aligns with heading token; does not change body recipe |

### Table

| Slot | v1.6 | v1.7 | v1.8 | Notes |
|------|:----:|:----:|:----:|-------|
| Border color | ✓ | ✓ | ✓ | `accent` |
| Corners | ✓ | ✓ | ✓ | `radius` |
| Header surface | — | — | ✓ | optional |

### Form

| Slot | v1.6 | v1.7 | v1.8 | Notes |
|------|:----:|:----:|:----:|-------|
| Label style | **Fixed** | **Fixed** | **Fixed** | `text-sm font-medium text-gray-700` |
| Field border | ✓ | ✓ | ✓ | `accent` (UI: **Field border**) |
| Field surface | — | ✓ | ✓ | white \| muted |
| Corners | ✓ | ✓ | ✓ | `radius` |
| Spacing | ✓ | ✓ | ✓ | `density` on inputs |
| Focus ring | — | — | — | Defer |

### Badge

| Slot | v1.6 | v1.7 | v1.8 | Notes |
|------|:----:|:----:|:----:|-------|
| Tint background | ✓ | ✓ | ✓ | `{accent}-100` |
| Text color | ✓ | ✓ | ✓ | `{accent}-700` |
| Shape | **Fixed pill** | **Fixed pill** | optional enum | Status colors (success/warning) out of scope |

---

## UI labels per category (v1.6)

Replace generic preset titles in `brand-kit-panel.tsx`:

| Category | Control | User-facing label | Binds to |
|----------|---------|-------------------|----------|
| button | hue swatches | **Fill** | `accent` |
| button | radius chips | **Corners** | `radius` |
| button | density chips | **Spacing** | `density` |
| card | hue swatches | **Border color** | `accent` |
| card | radius / density | **Corners** / **Spacing** | `radius` / `density` |
| heading | hue swatches | **Text color** | `accent` |
| heading | typography chips | **Heading style** | `typography` |
| table | hue swatches | **Border color** | `accent` |
| form | hue swatches | **Field border** | `accent` |
| badge | hue swatches | **Tint** | `accent` |
| text | — | Read-only body note | — |

Inference (`inferBrandPresetsFromTokens`) must map **slot-appropriate** tokens (e.g. card reads `border-{accent}-300`, button reads `bg-{accent}-600`).

---

## Terminology (product-wide)

Use these words consistently in UI, docs, and errors:

| Term | Meaning |
|------|---------|
| **Sample** | Category mock when **no page selection** — teaches the active category recipe. |
| **Preview** | Same mock when **selection exists and presets changed** — shows draft recipe for all hosts of that category on the page. |
| **On-page hint** | When selection exists and presets match the page baseline — *“Current branding is shown on your selection on the page.”* |
| **Validate** | AST `dryRun` patch check (patchability, allowlist, diff summary). **Does not change source or paint the live page** (today). |
| **Apply to Code** | Write merged `className` to source files (same as Edit tab). |

**Flow everywhere:** `Validate → Apply to Code`

Rename away from “Preview” for AST steps:

| Today (misleading) | Target |
|--------------------|--------|
| Live preview (panel) | **Sample** (or “Card sample”) |
| Preview all buttons (N) | **Validate all buttons (N)** |
| Previewing 2 of 5… | **Validating 2 of 5…** |
| Preview Changes (Edit tab) | **Validate Changes** |
| bulk preview uses draft… | **bulk validate uses draft…** |

Internal code (`dryRun`) may keep legacy names where protocol-bound; brand bulk telemetry and summary helpers renamed in **v1.6b**.

Optional later: **Preview on page** = staged DOM classes after validate (distinct from panel **Preview** mock). **Shipped in v1.6a** — action bar button after bulk validate.

---

## Data model

### Project brand (`nuvio/brand.json`)

**v1.5 (shipped):**

```json
{
  "color": "rose",
  "radius": "rounded",
  "density": "balanced",
  "typography": "bold"
}
```

**v1.6 target (backward compatible):**

```json
{
  "version": 2,
  "tokens": {
    "accent": "rose",
    "surface": "white",
    "radius": "rounded",
    "density": "balanced",
    "typography": "bold"
  }
}
```

- **Migration:** `normalizeBrandConfig` accepts v1 flat keys (`color` → `tokens.accent`, default `surface: "white"`). Save may write v2 shape when user saves from Brand Kit.
- **One file per project** — all categories consume the same tokens via slot maps.
- Served by the Vite plugin (`handle-brand-config.ts`); overlay loads/saves via `brand-kit-api.ts`.
- Validated with `brandConfigSchema` / `brandTokensSchema` in `@nuvio/shared`.

### Categories & recipes

Seven **brandable** categories (`BRAND_APPLY_ACTIONS` in `packages/shared/src/brand-kit.ts`):

| Category | Slots consumed | Recipe fragment (rest state) |
|----------|----------------|------------------------------|
| **button** | accent, radius, density | `bg-{accent}-600 text-white rounded-* px-* py-*` |
| **card** | surface, accent, radius, density | `bg-{surface} border border-{accent}-300 rounded-* p-*` |
| **heading** | accent, typography | `{typography classes} text-{accent}-600` |
| **text** | fixed | `text-sm font-normal text-gray-600` |
| **table** | accent, radius | `max-w-full border border-{accent}-300 rounded-*` |
| **form** | accent, radius, density (+ fixed label) | label: `text-sm font-medium text-gray-700`; input: `border border-{accent}-300 rounded-* px-* py-*` |
| **badge** | accent | `… bg-{accent}-100 text-{accent}-700 rounded-full` |

Recipes are built by `buildBrandClassFragment(action, tokens, hint?)` and patched with `mergeTailwindClassName` via `buildBrandPatchOps`.

**Form host hint:** `brandFragmentHostHint(entry)` + `isFormLabelHost` — labels vs inputs get different fragments.

**Apply scope:** Recipes merge **base utilities** for rest state; **v1.8+** adds curated `hover:` utilities for button fill and card border (no `xl:`, `dark:`, `focus:` in Brand Kit).

### PCC (per route)

Each page manifest (`nuvio/pages/<slug>.pcc.yaml`) lists **canonical hosts** per category. When a PCC category is present, bulk validate/apply prefers those host ids over heuristics (`pccHostsForBrandAction`).

**Nav** is editable in PCC but **not brandable** (no bulk recipe).

### Dogfood routes (reference)

| Page | Route | Brand categories exercised |
|------|-------|----------------------------|
| dashboard | `/` | card, button, heading, text, table |
| form-elements | `/form-elements` | card, heading, form |
| basic-tables | `/basic-tables` | card, heading, table |
| badges | `/badge` | card, heading, badge |

---

## Presets shown per category (category-first UI)

Drive panel chips from `BRAND_CATEGORY_SLOTS` (v1.6) — each slot has a **label**, **token key**, and **inference detector**:

| Category | Slots shown in Brand Kit |
|----------|--------------------------|
| button | Fill · Corners · Spacing |
| card | Border color · Corners · Spacing (+ Surface in v1.7) |
| heading | Text color · Heading style |
| text | Read-only body note (+ typography reference in v1.5) |
| table | Border color · Corners |
| form | Field border · Corners · Spacing |
| badge | Tint |

**Implementation today:** `BRAND_PRESET_DIMENSIONS_BY_ACTION` maps legacy dimensions (`color` → accent slot). **v1.6:** add `getBrandSlotLabelsForAction(action)` for user-facing titles without renaming internal keys yet.

**Inference:** slot-aware detectors in `brand-inspector.ts` / `inferBrandPresetsFromTokens` — card reads border hue, button reads bg hue, heading reads text hue (see [UI labels per category](#ui-labels-per-category-v16)).

---

## User workflows

### In the overlay (target UX)

```
Brand Kit tab
  → Category selector (tabs or segmented control) with per-page counts
  → Contextual preset chips (only dimensions for selected category)
  → Category sample (panel)
  → Save Brand (writes brand.json)
  → Validate all <category> (N)   [AST dryRun for visible PCC/heuristic targets]
  → Action bar: summary + Validate Changes (if needed) + Apply to Code
```

**Page discovery (copy):** e.g. “On this page: 7 cards · 2 buttons · 1 table”. Categories with count `0` are disabled or shown as “not on this page”.

**Cross-page:** User navigates to `/form-elements` to validate forms; `/basic-tables` for tables; etc. CLI can apply all pages in one shot.

### CLI (shipped)

```bash
nuvio brand scan --page <slug> --cwd <app>   # audit vs saved brand
nuvio brand apply --all --cwd <app>          # apply recipes to PCC hosts
pnpm brand:dogfood                           # scan all dogfood PCC pages
pnpm brand:apply:dogfood                     # apply all dogfood PCC pages
```

Brand scan uses `evaluateBrandPageScan` + `inspectBrandMatchForAction` (category-scoped audit).

---

## What is already implemented

Use this table when implementing — **do not re-build** these pieces.

| Area | Status | Location |
|------|--------|----------|
| Brand config schema & defaults | ✅ | `packages/shared/src/brand-kit.ts` |
| Category recipes (7 actions) | ✅ | `buildBrandClassFragment`, `buildBrandPatchOps` |
| Allowlist validation for recipes | ✅ | `packages/overlay/src/brand-kit-validate.ts` |
| Brand HTTP read/write | ✅ | `packages/vite-plugin/src/handle-brand-config.ts` |
| Brand Kit panel (category chips + contextual presets) | ✅ | `brand-kit-panel.tsx` |
| Per-category sample | ✅ | `brand-category-sample.tsx` |
| Selection → category + live inference | ✅ | `brand-selection.ts`, `inferBrandPresetsFromTokens`, `brand-kit-panel.tsx` |
| Sample / Preview / on-page hint | ✅ | `brand-category-sample.tsx`, conditional panel |
| Category-specific text hosts | ✅ | `brand-bulk.ts` — span labels, `.value`, `.nameText` |
| Category slot labels (Fill / Border color / …) | ✅ | **v1.6** |
| Token schema v2 (`tokens.accent`, `surface`) | ✅ | **v1.7** |
| Slot-aware inference (border vs fill vs text) | ✅ | **v1.6** |
| DOM staging after validate | ✅ | **v1.6a** |
| Button variant + surface token | ✅ | **v1.7** |
| Hover presets | ✅ | **v1.8** |
| Page discovery + first-run checklist | ✅ | **v1.9** |
| Brand Kit tab default on edit on | ✅ | **v1.9** |
| Per-category overrides in brand.json | ❌ | **v2** |
| Bulk validate/apply session | ✅ | `brand-bulk-session.ts`, `NuvioDevShell.tsx` |
| Inspector API (category-scoped) | ✅ | `inspectBrandMatchForAction` — used by **CLI brand scan** only (no Editor UI) |
| Brand scan / apply CLI | ✅ | `packages/cli/src/brand-scan.ts`, `brand-apply.ts` |
| PCC brandable categories | ✅ | `PCC_BRANDABLE_CATEGORIES` in `coverage-contract.ts` |
| Dogfood PCC pages (4) | ✅ | `apps/tailadmin-dogfood/nuvio/pages/*.pcc.yaml` |
| Telemetry hooks | ✅ | `brand-kit-telemetry.ts` |
| Editor Brand / Edit tabs | ✅ | `editor-panel-tabs.tsx` |

---

## What is not implemented (gap vs target)

| Item | Priority | Status |
|------|----------|--------|
| Brand Kit tab default on edit on | P2 | ✅ v1.9 |
| Page discovery copy (“7 cards · 2 buttons”) | P2 | ✅ v1.9 |
| Brand Kit first-run checklist | P2 | ✅ v1.9 |
| **v1.6 category slot labels** | P0 | ✅ |
| **v1.6 slot-aware inference** | P0 | ✅ |
| **v1.6 schema v2 + migration** | P1 | ❌ |
| Plain-language internal rename (`color` → `accent`) | P2 | ❌ |
| DOM staging after validate | P2 | ✅ v1.6a |
| Phase 4 explicit gate doc in CI | P2 | ❌ |

Everything in [canonical user sequence](#canonical-user-sequence-target-ux) through Apply to Code is **shipped** except items above.

---

## Implementation plan (roadmap)

### Shipped — v1.5.x ✅

| Phase | Summary |
|-------|---------|
| **1** | Terminology: Validate / Sample / Apply to Code |
| **2** | Category chips, contextual presets, category samples |
| **3** | Selection-driven flow, live inference, Sample/Preview split |
| **3d** | Inspector removed from Editor; CLI scan only |

---

### v1.6 — Category slots (UI + inference) **← next**

**Goal:** Users see **what changes on the selected category**; one `accent` token, category-specific labels and inference.

**Shared (`packages/shared/src/brand-kit.ts`, `brand-inspector.ts`):**

1. `BRAND_CATEGORY_SLOT_LABELS: Record<BrandApplyAction, Record<slot, string>>` — user-facing labels per [UI labels table](#ui-labels-per-category-v16).
2. `inferBrandPresetsFromTokens` — **slot-aware** inference:
   - `card` / `table` / `form` → detect `border-{accent}-*` first
   - `button` / `badge` → detect `bg-{accent}-*` first
   - `heading` → detect `text-{accent}-*` first
3. `buildBrandPreviewSummary` — use slot labels (“Card · Rose border · Soft · Balanced”).
4. Tests: inference per slot; labels never expose raw Tailwind in Simple Mode.

**Overlay (`brand-kit-panel.tsx`):**

1. Replace generic “Color” with `getBrandSlotLabel(action, "accent")` (Fill / Border color / …).
2. Radius → “Corners”, density → “Spacing” globally in Brand Kit.
3. Text category: remove misleading typography chips **or** show read-only “Body: fixed gray · Headings use Heading style above”.

**Docs / dogfood:**

- Update `apps/tailadmin-dogfood/README.md` Brand Kit section.
- No PCC manifest changes required.

**Acceptance:**

- Select **Orders Card** → control says **Border color**; rose selection updates border inference only.
- Select **Filter button** → control says **Fill**; same rose accent, different slot copy.
- Select **orders.title** → **Text color** + **Heading style**.
- `pnpm test --filter @nuvio/shared` + `@nuvio/overlay`; `pnpm coverage:dogfood`.

**PR slice order (v1.6):**

1. **shared:** `BRAND_ACCENT_SLOT_BY_ACTION` + slot-aware `inferBrandPresetsFromTokens(action, tokens)` + tests.
2. **overlay:** slot labels in `brand-kit-panel.tsx` + `ColorPresetGroup` title prop.
3. **shared:** `buildBrandPreviewSummary` slot wording.
4. **overlay:** text category read-only copy (remove editable typography chips for text).
5. **docs/tests:** visibility audit for new labels; dogfood README.

---

### v1.6a — DOM staging (optional, same release or follow-up)

**Goal:** After validate, temporarily paint recipe on live hosts so users see bulk effect before Apply.

**PR slice order (v1.6a):**

1. **overlay:** `brand-dom-staging.ts` — merge validated `mergeTailwindClassName` ops onto host `class` via `tailwind-merge`; tests.
2. **overlay:** `NuvioDevShell` — stage on **Preview on page**; revert on cancel, new validate, apply start, tab change (Brand → Edit), edit mode off.
3. **overlay:** **Preview on page** in `SimpleModeActionBar` (and developer-details brand actions); distinct from panel **Preview** mock.
4. **overlay:** telemetry `brand_page_previewed`; copy in `brand-kit-panel` bulk lead.
5. **docs/tests:** visibility audit; update gap tables.

**Acceptance:**

- Validate all cards (N) → **Preview on page** paints border/radius/spacing on every validated host in the DOM.
- **Cancel** or switch to **Edit** tab restores original classes.
- **Apply to Code** clears staging before writes; HMR picks up source changes.

---

### v1.6b — Internal rename cleanup **← shipped**

- Telemetry: `brand_bulk_validated` (replaces `brand_bulk_previewed`).
- `buildBrandValidateSummary` canonical; `buildBrandBulkPreviewSummary` deprecated one release.
- Bulk progress phase: `validating` (was `previewing`); `groupedBulkValidateSummary` canonical.

---

### v1.7 — Token schema + extra slots **← shipped**

**Goal:** `brand.json` v2 + surface + button variant.

**PR slice order (v1.7):**

1. **shared:** `BrandConfig` + `normalizeBrandConfig` (v1 flat + v2 `tokens`) + `serializeBrandConfig`.
2. **shared:** Card `surface` recipe; button `solid` / `outline`; form field `surface`.
3. **shared:** Inference for `surface` + `buttonVariant`; preset dimensions + labels.
4. **overlay:** Surface + Style chips in `brand-kit-panel`; sample updates.
5. **vite-plugin / cli:** Save v2 on disk; init writes v2; legacy v1 still loads.
6. **tests/docs:** allowlist matrix, dogfood gates.

**Acceptance:**

- Old `brand.json` without `version` still loads.
- Save writes `version: 2` with `tokens` object.
- `pnpm brand:dogfood` passes on dogfood after apply.

---

### v1.8 — Interaction states **← shipped**

**Goal:** Hover (and optional card shadow) within allowlist.

1. Extend `brand-kit-validate.ts` for `hover:bg-*`, `hover:border-*` (curated accent steps only).
2. Button recipe adds `hover:bg-{accent}-700` from **Hover** enum (none | darken).
3. Card optional **Shadow** enum; optional hover border darken.
4. Inference: do **not** infer hover for panel sync (rest state only); hover comes from tokens on validate.

**Out of scope v1.8:** `focus:`, `dark:`, `active:`.

---

### v1.9 — Polish **← shipped**

- Page discovery line in Brand Kit header (`On this page: 7 cards · 2 buttons · 1 table`).
- Default Brand Kit tab when edit mode opens (`PropertyPanelShell` resets tab on edit on).
- First-run checklist (categories on page) — dismissible card with Brand Kit flow steps.

---

### v2 — Overrides & AI

| Item | Description |
|------|-------------|
| **Per-category overrides** | `overrides.heading.textColor` etc. — rare escape hatch |
| **AI Brand Generator** | Infer `tokens` from screenshot; still validate/apply recipes |
| **Status badge colors** | success/warning/error semantic badges — separate from accent tint recipe |

---

### Phase 4 — Tests & dogfood gates (ongoing)

Run on every Brand Kit PR:

```bash
pnpm coverage:dogfood
pnpm brand:dogfood
pnpm test --filter @nuvio/shared
pnpm test --filter @nuvio/overlay
```

Add when v1.6 lands:

- Slot label audit in `simple-mode-visibility-audit.test.ts`
- Slot inference fixtures per category in `brand-inspector.test.ts`
- Optional: dogfood e2e snapshot for card border vs button fill with same accent

---

## File map (implementation touch list)

| Package | Files |
|---------|--------|
| **shared** | `brand-kit.ts` (tokens, slots, recipes), `brand-inspector.ts` (inference), `brand-bulk.ts`, `brand-selection.ts`, `index.ts`, tests |
| **overlay** | `brand-kit-panel.tsx`, `brand-category-sample.tsx`, `styles/overlay.css`, `PropertyPanelShell.tsx`, `brand-kit-validate.ts`, `NuvioDevShell.tsx`, tests |
| **vite-plugin** | `handle-brand-config.ts` (v2 schema) |
| **cli** | `brand-scan.ts`, `brand-apply.ts` |
| **dogfood** | `README.md` (wording only); PCC manifests unchanged unless new hosts |
| **docs** | this file; cross-link from `apps/tailadmin-dogfood/README.md` |

**Unlock for agents:** editing overlay/shared requires `unlock implementation lock` or `unlock: overlay-v0.3` / `unlock: shared-v0.3` per implementation lock.

---

## Category sample spec (panel)

Panel mock visibility follows **selection + change** state:

| State | Panel shows |
|-------|-------------|
| No page selection (category chip only) | **Sample** — example styling for the active category |
| Selection + presets match page | **On-page hint** only (no mock) |
| Selection + presets changed from page | **Preview** — category recipe mock + *“All &lt;category&gt; on this page (N) with these settings.”* |

The mock is **recipe-faithful** and **category-exclusive** (one sample visible at a time). It is **not** a clone of the selected element — the live page is the current-state preview.

| Category | Mock content | Hint |
|----------|----------------|------|
| button | Single primary button | — |
| card | Bordered card with title line | — |
| heading | One heading line | typography from draft |
| text | Muted body line | fixed gray styles |
| table | 2×2 grid with border | color + radius |
| form | Label + text input | label uses label fragment |
| badge | One status chip | color tint |

Do **not** duplicate the old combined button+card block once category samples ship.

---

## Bulk validate mechanics (unchanged behavior)

1. User clicks **Validate all &lt;category&gt; (N)**.
2. `listVisibleBrandBulkTargets` → `buildBrandBulkTargetOps` per host.
3. `NuvioDevShell` queues AST `dryRun: true` per host (`brand-bulk-session`).
4. Action bar shows `buildBrandValidateSummary` human summary after bulk validate.
5. **Apply to Code** runs non-dryRun patches sequentially; updates `brandBulkAppliedByAction` lock for that category+draft.

**Lock:** Re-validating same category with unchanged draft after apply stays disabled (`isBrandBulkCategoryLocked`) until presets change or brand is saved anew.

---

## CLI vs overlay

| Concern | Overlay | CLI |
|---------|---------|-----|
| Tune presets | ✅ Brand Kit | edit `nuvio/brand.json` |
| Per-page validate | ✅ per category | `brand scan --page` |
| Apply | ✅ per category, visible hosts | `brand apply --page` / `--all` |
| CI gate | — | `pnpm brand:dogfood` |

Overlay validate is **page + visible DOM + single category**; CLI apply/scan is **PCC manifest hosts** (may include hosts not mounted if route not loaded).

---

## Open decisions (resolved)

| Question | Decision |
|----------|----------|
| One brand or per-category palettes? | **One accent** + slot maps; optional **overrides** in v2 only |
| Separate preview app? | **No** — live page + panel Preview mock when draft changes |
| Seven validate buttons vs one? | **One** per active category |
| Form labels / body text brandable? | **Fixed** gray recipes — not accent |
| Hover / focus / dark / responsive? | **Hover v1.8**; focus/dark defer; responsive via **Edit tab** |
| Generic “Color” label? | **Replace** with category slot labels in **v1.6** |
| Per-instance brands? | **Edit tab** — not Brand Kit |

---

## Revision history

| Version | Summary |
|---------|---------|
| **v1.5** | table/form/badge recipes, 7 bulk actions, dogfood PCC pages |
| **v1.5b** | Terminology + category chips, contextual presets, samples |
| **v1.5c** | Selection-driven flow (canonical 6-step sequence) |
| **v1.5d** | Removed Brand Inspector from Editor |
| **v1.5e** | Sample/Preview split + live inference from selection |
| **v1.6 (shipped)** | Category slot labels + slot-aware inference |
| **v1.6a (shipped)** | DOM staging after validate |
| **v1.6b (shipped)** | Telemetry + validate summary rename cleanup |
| **v1.7 (shipped)** | `brand.json` v2 tokens + surface + button variant |
| **v1.8 (shipped)** | Hover + card shadow presets |
| **v1.9 (shipped)** | Page discovery, default Brand tab, first-run checklist |
| **v2 (planned)** | Per-category overrides, AI brand generator |
