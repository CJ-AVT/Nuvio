# Nuvio v0.2.0 — Consolidated Release & Product Plan

**Document status:** Final implementation spec for v0.2.0 (start implementation from this doc).  
**Release target:** `0.2.0-alpha.0` first, then `0.2.0` stable after dogfood passes.  
**Companions:** `docs/PRD.md` (full product), `docs/implPlan.md` (MVP engineering phases).

---

## 0. North star (product strategy)

### Core principle

Nuvio optimizes for one thing first:

> The fastest possible UI iteration loop for React + Tailwind + Vite apps.

Do not expand horizontally too early. First dominate:

```text
React + Tailwind + Vite + AI-assisted coding
```

### Best positioning

Not “AI website builder.” Not “Figma competitor.”

> **Nuvio is the visual editing layer for modern React apps.**

Or:

> **Nuvio closes the gap between AI-generated UI and production-ready UI.**

### The winning workflow

The biggest pain in vibe coding is not generating UI — AI already does that. The pain is **iterating safely and precisely**:

```text
Generate with AI (Cursor / v0 / Bolt / templates)
  → refine visually with Nuvio
  → validate diff → apply minimal patch
  → commit clean code
```

### What Nuvio already solves (v0.1.x)

```text
See UI → visually edit → patch real source → instant refresh (HMR)
```

Next work should **reduce friction, increase trust, speed iteration** — not become a giant design platform.

### Explicitly defer (all versions until stated otherwise)

- Mobile / React Native
- Frameworks beyond React web (Vue, Angular, etc.)
- Full Figma replacement / arbitrary drag canvas
- Heavy AI generation competing with v0/Lovable/Bolt
- Enterprise collaboration (comments, multiplayer, approvals)
- Hosted control plane / cloud accounts
- Next.js (until React+Vite path is excellent)

Nuvio **complements** AI codegen; it does not replace it.

---

## 1. Long-term roadmap (versions)

This table maps product strategy to releases. **v0.2.0 is Phase A only.**

| Phase | Release focus | Goal | Key capabilities |
| ----- | ------------- | ---- | ---------------- |
| **A — Reliability** | **v0.2.0** | “This always works.” | Overlay independence (CSS + Shadow DOM), Tailwind v3/v4 + TailAdmin, source index v2, risk/diagnostics, validate → apply → undo, expert diff preview |
| **B — Tailwind power** | **v0.3.x** | “I rarely need prompts for UI tweaks.” | Rich spacing/layout/typography controls, breakpoint-aware editing, device preview modes, expanded whitelist |
| **C — AI workflow** | **v0.4.x** | “Best companion to Cursor/v0.” | Open in editor, copy component context, scoped prompt-assist (optional), AI-safe patch boundaries |
| **D — Design system** | **v0.5+** | “Visual consistency across the app.” | Theme/token editing, semantic component awareness (shadcn patterns), app-wide style controls |

**Rule:** Do not start Phase B until Phase A exit criteria pass on TailAdmin.

---

## 2. v0.2.0 scope matrix

What ships in **v0.2.0** vs what waits.

| Capability | v0.2.0 | Later | Notes |
| ---------- | :----: | ----- | ----- |
| Overlay self-contained CSS | ✅ | | No host Tailwind content path required |
| Shadow DOM chrome isolation | ✅ | | Chip, editor, diagnostics inside shadow |
| Collision-aware positioning + reset | ✅ | | Versioned `localStorage` keys |
| TailAdmin / Tailwind v4 dogfood | ✅ | | Primary real-app proof |
| Source index v2 + risk scoring | ✅ | | Component name, literal className, map context |
| First-run diagnostics panel | ✅ | | Vite/TW/React versions, id count, patch mode |
| Validate → diff preview → Apply → Undo | ✅ | | Extend diff UX; history log in v0.3 |
| Literal `className` patch only (fail closed) | ✅ | | No silent `cn()` / template patches |
| Basic Tailwind property controls | ✅ | | Existing alpha picks; polish in new CSS system |
| Smarter element detection (foundation) | ✅ | | Index v2 + clear errors; not full semantic UI |
| Responsive / breakpoint-aware editing | | v0.3 | Highest leverage after reliability |
| Device preview (desktop/tablet/mobile) | | v0.3 | Edits `sm:`/`md:`/`lg:` on active breakpoint |
| Tailwind editing superpowers (full layout grid) | | v0.3 | Margin axis, grid cols, tracking, etc. |
| “Open in Cursor” / copy AI context | | v0.4 | Workflow integration |
| Component semantics (Button variant, shadcn) | | v0.4–0.5 | Starts with index metadata in v0.2 |
| Theme / design token file sync | | v0.5+ | PRD Phase 6 direction |
| Team collaboration | | TBD | Not core wedge |

---

## 3. Why v0.2.0 exists

Nuvio already proves its core promise in a clean Vite + React + Tailwind v3 test app:

```text
select element → edit text/style → validate → apply → source file changes → HMR updates UI
```

But dogfooding on TailAdmin revealed a real-world compatibility gap:

```text
Nuvio engine works ✅
Source index works ✅
Element selection works ✅
Editor mounts ✅
But Nuvio UI/chip/editor can be clipped, unstyled, collapsed, or visually broken ❌
```

This is exactly the kind of issue that blocks adoption. Expert developers will not trust a tool that edits source code if its own overlay looks fragile.

Therefore, v0.2.0 is **Phase A — Reliability** from the product roadmap: a **compatibility and trust release**, not feature bloat. Tailwind superpowers and responsive editing are **v0.3** (see §1).

---

## 4. Release positioning

### One-line release goal

> Nuvio v0.2.0 makes the overlay independent, elegant, and reliable across Tailwind v3, Tailwind v4, and complex React dashboards.

### Product positioning

Nuvio remains:

> A source-aware visual editing layer for React apps running locally.

It is not:

- a Figma replacement
- a no-code builder
- a generic website editor
- an AI code generator
- a production runtime package

v0.2.0 should make Nuvio feel more like:

```text
Cursor-quality developer tool
+ Chrome DevTools reliability
+ Figma-like visual polish
+ source-code safety
```

---

## 5. Main problems discovered during dogfood

### 5.1 Tailwind v4 incompatibility

The current guide assumes Tailwind v3 and requires users to add the overlay package path to `tailwind.config.js`:

```js
"./node_modules/@nuvio/overlay/dist/**/*.js"
```

This fails or becomes awkward in Tailwind v4 apps because many Tailwind v4 projects may not have a traditional `tailwind.config.js` file.

TailAdmin uses Tailwind v4 and exposed this immediately.

### 5.2 Overlay UI depends too much on host CSS

The Nuvio editor currently relies on utility classes being generated by the host app. In real dashboards, the host app may have:

- Tailwind v4
- global resets
- custom theme tokens
- unusual z-index scales
- dark mode selectors
- layout containers with overflow rules
- devtools viewport resizing
- third-party CSS

Nuvio’s chip and editor must remain visually correct regardless.

### 5.3 Chip and editor placement can be clipped

In TailAdmin, the chip rendered but was partially offscreen until manually forced visible via devtools.

This shows the editor needs:

- viewport-aware placement
- default safe position
- collision avoidance
- persisted but recoverable position
- reset position command

### 5.4 Manual setup is too brittle

The current setup requires:

- Vite plugin install
- overlay package install
- Vite config edit
- Tailwind config edit
- manual `<NuvioDevShell />`
- manual `data-nuvio-id`

For v0.2.0, keep the explicit contract but reduce fragile styling/config requirements.

---

## 6. v0.2.0 non-negotiable goals

### Goal 1 — Overlay independence

Nuvio UI must not depend on the host app’s Tailwind config.

Nuvio should work whether the host app uses:

- Tailwind v3
- Tailwind v4
- no Tailwind
- CSS modules
- custom CSS
- shadcn/ui
- TailAdmin
- Bootstrap-like resets

### Goal 2 — Elegant editor UI

The chip and editor must feel professional enough that an expert frontend developer would not be embarrassed using it.

Minimum quality bar:

- clean spacing
- strong contrast
- readable typography
- stable layout
- no clipped panels
- no compressed controls
- no raw browser-default form styling
- polished light/dark theme
- keyboard-friendly
- draggable/collapsible
- resettable position

### Goal 3 — Less risky source edits

Nuvio must continue to prefer safe, minimal, reviewable diffs over broad rewriting.

Every source mutation should follow:

```text
identify exact node → preview diff → apply minimal patch → HMR → undo available
```

### Goal 4 — Better real-world React/Tailwind awareness

Nuvio should understand enough about React and Tailwind patterns to avoid unsafe edits and communicate limitations clearly.

### Goal 5 — Local dogfood without npm publish

We must be able to test Tailwind v4 and TailAdmin against local workspace packages before publishing to npm.

### Goal 6 — Smarter element detection (foundation)

Wrong file, wrong component, or silent failure on nested/repeated UI destroys trust faster than missing style controls.

v0.2.0 delivers the **foundation**, not the full vision:

- Source index v2 metadata (§10)
- Risk labels and unsupported reasons in the editor
- Duplicate id detection at index time
- Repeated `.map()` context warnings
- Custom component + `className` forward warnings

Deferred to v0.3+: fragment/ref edge cases, stable generated ids in lists, richer tree UX.

### Goal 7 — Trust loop (validate, diff, undo)

Already partially shipped in v0.1.x; v0.2.0 makes it **visible and reliable** on real apps:

- Human-readable diff preview before Apply (§11.2)
- Undo after apply (session stack)
- Fail closed on risky patches

Deferred to v0.3+: edit history panel, git uncommitted warnings.

### Mapping product priorities → v0.2.0

| Product priority (strategy) | v0.2.0 delivery |
| --------------------------- | --------------- |
| 1. Smarter element detection | Index v2 + diagnostics + risk UI |
| 2. Tailwind editing superpowers | Keep existing controls; restyle in isolated CSS; expand in v0.3 |
| 3. Responsive editing | **Not in v0.2.0** — top item for v0.3 |
| 4. AI workflow integration | **Not in v0.2.0** — v0.4 |
| 5. Undo / diff / patch review | Strengthen diff UX + undo on real apps |
| 6. Component awareness | Metadata + warnings only |
| 7. Theme / design tokens | **Not in v0.2.0** — v0.5+ |

---

## 7. Architecture changes

### 7.1 Ship compiled overlay CSS

### Current problem

The overlay relies on the consumer Tailwind build to generate Nuvio styles.

### Required change

`@nuvio/overlay` must ship compiled CSS.

Target structure:

```text
packages/overlay/
  src/
    NuvioDevShell.tsx
    styles/
      overlay.css
  dist/
    index.js
    style.css
```

`NuvioDevShell` should import its own CSS:

```ts
import "./style.css";
```

or dynamically inject it when mounted.

### Acceptance criteria

A consumer app should no longer need this Tailwind config line:

```js
"./node_modules/@nuvio/overlay/dist/**/*.js"
```

The guide can mention it only as legacy fallback for old builds, not required setup.

---

### 7.2 Use Shadow DOM for Nuvio chrome

### Why

Shadow DOM prevents host CSS from breaking Nuvio’s UI.

### What should live inside Shadow DOM

- Nuvio chip
- editor panel
- buttons
- inputs
- selects
- diff preview
- touched file log
- undo controls
- diagnostics panel

### What should stay outside Shadow DOM

Selection logic still needs access to the host page DOM:

- query `[data-nuvio-id]`
- compute element rectangles
- listen to clicks/hover on host elements
- position outlines using viewport coordinates

Recommended split:

```text
Host DOM
  actual React app
  elements with data-nuvio-id

Nuvio overlay root
  Shadow DOM
    chip
    editor
    diagnostics
    styles

Global/highlight layer
  selection outlines positioned by getBoundingClientRect()
```

The highlight layer can either be:

1. inside Shadow DOM using fixed-position elements, or
2. outside Shadow DOM with aggressively scoped CSS.

Prefer Shadow DOM for everything possible.

---

### 7.3 Provide design-system-level CSS variables for overlay

Nuvio should use its own variables, not the host app’s Tailwind theme.

Example:

```css
:host {
  --nuvio-bg: #0f172a;
  --nuvio-panel: #111827;
  --nuvio-panel-soft: #1f2937;
  --nuvio-text: #f8fafc;
  --nuvio-muted: #94a3b8;
  --nuvio-border: rgba(148, 163, 184, 0.24);
  --nuvio-accent: #38bdf8;
  --nuvio-accent-strong: #0ea5e9;
  --nuvio-danger: #ef4444;
  --nuvio-radius-sm: 8px;
  --nuvio-radius-md: 12px;
  --nuvio-radius-lg: 18px;
  --nuvio-shadow-lg: 0 24px 80px rgba(15, 23, 42, 0.28);
  --nuvio-font: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```

Do not rely on classes like `bg-slate-900`, `rounded-2xl`, or `text-sm` being generated by the host app.

---

### 7.4 Add a resilient overlay positioning system

### Requirements

The chip and editor must never become unusable.

Implement:

- default chip position: bottom-right or top-right with viewport padding
- editor default position: right side panel, 360–420px wide
- collision detection using viewport size
- automatic reposition if offscreen
- draggable chip and editor
- persisted position in `localStorage`
- reset position button
- if saved position is offscreen, ignore it

### Suggested localStorage keys

```text
nuvio:chip-position:v2
nuvio:editor-position:v2
nuvio:editor-collapsed:v2
```

Version keys so old bad positions do not break new versions.

### Acceptance criteria

- Open in Safari, Chrome, Firefox.
- Open with devtools docked bottom, right, and undocked.
- Resize browser narrow/wide.
- Nuvio remains visible.

---

### 7.5 Add first-run diagnostics

Nuvio should tell the user what is working instead of silently failing.

Chip or diagnostics panel should show:

```text
Vite channel: connected
Indexed ids: 12
Selected: hero.title
File: src/App.tsx:43
Mode: editing
Tailwind className: supported string literal
```

When something is wrong:

```text
0 ids indexed — add data-nuvio-id to editable elements.
Unsupported className expression — only string literal className is patchable in this version.
Duplicate id hero.title in src/Hero.tsx and src/Home.tsx.
```

This would have saved most of the debugging time from the TailAdmin test.

---

## 8. Vite independence plan

Nuvio currently depends on Vite versions 5.4+ and 6.x. v0.2.0 should broaden tolerance while still being honest.

### 8.1 Short-term support target

Support:

```text
Vite 5.4+
Vite 6.x
Vite 7.x if API-compatible
Vite 8.x if API-compatible or through adapter fallback
```

### 8.2 Avoid tight coupling to Vite internals

Do not import unstable Vite internals unless absolutely necessary.

Prefer stable plugin hooks:

- `configResolved`
- `configureServer`
- `transform`
- `handleHotUpdate`
- `apply: "serve"`

### 8.3 Peer dependency strategy

For v0.2.0 alpha:

```json
"peerDependencies": {
  "vite": ">=5.4 <9",
  "react": ">=18.3",
  "react-dom": ">=18.3"
}
```

But only publish this broader range after test matrix passes.

If not fully tested, use:

```json
"peerDependencies": {
  "vite": "^5.4.0 || ^6.0.0 || ^7.0.0 || ^8.0.0"
}
```

and document exact validated versions.

### 8.4 Internal adapter layer

Create a small adapter boundary:

```text
packages/vite-plugin/src/viteAdapter.ts
```

Expose internal helpers:

```ts
interface NuvioViteAdapter {
  root: string;
  command: "serve" | "build";
  isDevServer: boolean;
  wsSend(event: string, payload: unknown): void;
  addMiddleware(path: string, handler: Handler): void;
  invalidateModule(filePath: string): void;
}
```

This keeps most of Nuvio independent from Vite API changes.

---

## 9. Tailwind independence plan

### 9.1 Separate two concerns

Nuvio has two Tailwind-related areas:

1. **Nuvio overlay UI styling**
2. **Editing the user’s Tailwind classes**

These must be separate.

### Overlay UI

Must be independent from Tailwind.

Use compiled scoped CSS inside Shadow DOM.

### User code editing

Still Tailwind-aware.

Use:

- controlled utility whitelist
- `tailwind-merge`
- explicit className support detection
- Tailwind version detection for diagnostics only

---

### 9.2 Tailwind version detection

Detect package version if available:

```ts
readPackageVersion("tailwindcss")
```

Expose in diagnostics:

```text
Tailwind: 4.0.8 detected
Overlay CSS: self-contained
Patch mode: utility whitelist
```

Do not require `tailwind.config.js` for overlay.

---

### 9.3 Tailwind v4 editing considerations

Tailwind v4 may use:

- CSS-first config
- no `tailwind.config.js`
- custom theme variables
- new utility behavior

Nuvio should still support editing common utility classes because class names remain in JSX.

Initial v0.2.0 supported edit set:

```text
Spacing: p-*, px-*, py-*, pt-*, pr-*, pb-*, pl-*, m-*, mx-*, my-*, gap-*
Typography: text-*, font-*, leading-*, tracking-*, text-left/center/right
Colors: text-*, bg-*, border-*
Shape: rounded-*
Effects: shadow-*, opacity-*
Size: w-*, max-w-*, h-*, min-h-*
Layout: flex, grid, items-*, justify-*, self-*
Responsive prefixes: sm:, md:, lg:, xl:, 2xl: for supported utilities
Dark mode prefix: dark: for supported utilities
```

### Important safety rule

Only patch className when it is a string literal on the host node:

```tsx
<div data-nuvio-id="hero.card" className="p-6 rounded-xl bg-white" />
```

Fail closed for:

```tsx
className={cn("p-6", active && "bg-blue-500")}
className={`p-6 ${active ? "bg-blue-500" : "bg-white"}`}
className={styles.card}
className={someVariable}
```

Show expert-friendly message:

```text
Unsupported className expression. Nuvio can safely edit only literal className strings in v0.2.0. Move editable utilities to a literal className on the data-nuvio-id node or wrap it in EditableContainer.
```

---

## 10. Intelligent React/component identification

v0.2.0 should improve how Nuvio understands the user’s React UI without making unsafe guesses. This is the **foundation for smarter element detection** (product priority #1); full semantic component editing comes in v0.4+.

### 10.1 Source index v2

Current index maps:

```text
id → file + node locator
```

Upgrade to:

```ts
interface IndexedElementV2 {
  id: string;
  filePath: string;
  line: number;
  column: number;
  tagName: string;
  componentName?: string;
  parentComponentName?: string;
  jsxPath: string[];
  hasLiteralClassName: boolean;
  classNameValue?: string;
  textEditable: boolean;
  structuralEditable: boolean;
  repeatedContext?: {
    insideMap: boolean;
    mapSource?: string;
  };
  riskLevel: "safe" | "caution" | "unsupported";
  unsupportedReasons: string[];
}
```

### Why

This lets the editor show expert-level context:

```text
Selected: FeatureCard title
File: src/components/FeatureGrid.tsx:42
Component: FeatureCard
Class patch: safe
Text patch: safe
Structure move: caution — inside array map
```

---

### 10.2 Component awareness

When scanning source, detect:

- function component name
- exported component name
- JSX tag name
- whether the selected node is a native element or custom component

Examples:

```tsx
function FeatureCard() {
  return <div data-nuvio-id="feature.card" />;
}
```

Index:

```text
componentName: FeatureCard
tagName: div
```

For custom components:

```tsx
<Button data-nuvio-id="hero.cta" className="px-4 py-2" />
```

Index:

```text
tagName: Button
componentName: Hero
riskLevel: caution
```

### Editing rule for custom components

If custom component has literal `className`, allow className patch only if:

- `className` is a literal string
- component likely forwards className or known component pattern

Otherwise warn:

```text
This is a custom React component. Nuvio can update the className prop, but the component must forward className to DOM for visual changes to appear.
```

---

### 10.3 Repeated list detection

Detect when selected element is inside:

```tsx
items.map((item) => <Card data-nuvio-id="feature.card" />)
```

Risk:

- duplicate ids likely
- structural edits risky
- text edits may affect all repeated instances

Rule:

- duplicate static ids inside map should error
- recommend stable generated ids only if source mapping can still resolve safely
- for v0.2.0, prefer explicit unique ids on static demo sections

Message:

```text
This element is inside a repeated render. Text/class changes may affect every rendered item. Structural edits are disabled for this node.
```

---

### 10.4 React wrapper contract

Add or formalize wrappers:

```tsx
<EditableText id="hero.title">
  Build faster with AI
</EditableText>

<EditableContainer id="feature.card.analytics" className="rounded-xl p-6">
  ...
</EditableContainer>
```

Wrappers should compile to normal DOM with `data-nuvio-id` in dev.

Possible package:

```text
@nuvio/react
```

Exports:

```ts
EditableText
EditableContainer
EditableGroup
```

For v0.2.0 this can be optional, but source index should recognize wrapper props if present.

---

## 11. Safer patch pipeline v2

### Required patch flow

```text
User edit
  ↓
Normalize operation
  ↓
Look up source index
  ↓
Check risk rules
  ↓
Dry run patch
  ↓
Generate diff preview
  ↓
User clicks Apply
  ↓
Snapshot previous file contents
  ↓
Write minimal patch
  ↓
Prettier format only touched file/range when possible
  ↓
HMR
  ↓
Touched file log
  ↓
Undo available
```

### Never do

- patch unknown ids
- patch duplicate ids
- patch non-literal className silently
- rewrite whole files unnecessarily
- patch outside project root
- apply when dry run failed
- hide errors in console only

---

### 11.1 Risk scoring

Every selected element should get a risk label.

### Safe

- native JSX element
- unique `data-nuvio-id`
- literal `className`
- static text child
- not inside map/loop

### Caution

- custom component with literal `className`
- inside conditional render
- nested complex children
- responsive/dark classes present

### Unsupported

- duplicate id
- unknown id
- computed className
- template literal className
- className from CSS module
- text generated from variable
- structural edit inside map

The UI should show this clearly.

---

### 11.2 Expert-friendly diff preview

Diff preview should be useful enough for serious developers.

Minimum:

```text
File: src/components/Hero.tsx
Node: hero.title
Change: text "Build apps faster" → "Build faster with AI"
```

For class changes:

```text
File: src/components/Card.tsx
Node: feature.card.analytics
Change: className
- p-4 rounded-lg bg-white
+ p-6 rounded-2xl bg-white
```

Later optional:

- inline mini diff
- file open link
- copy diff
- show exact line range

---

## 11.3 Post–v0.2.0: Tailwind power & responsive (v0.3 preview)

**Do not implement in v0.2.0.** Capture here so implementation order stays clear.

### v0.3 — Tailwind editing superpowers

High-value controls to add after overlay reliability:

| Area | Controls |
| ---- | -------- |
| Spacing | margin (all axes), padding, gap |
| Layout | flex direction, justify, align, width, max-width, grid columns |
| Typography | font size, weight, line height, letter spacing |
| Visual | radius, shadow, border, opacity |

Implementation notes:

- Extend `tailwind-whitelist` and `read-alpha-picks` / patch ops together.
- All edits still go through **literal `className` on the `data-nuvio-id` node** unless wrapper contract applies.

### v0.3 — Responsive editing (highest leverage after core)

Modern dashboards live in breakpoint-prefixed utilities (`sm:`, `md:`, `lg:`).

Planned UX:

1. **Device preview modes** — desktop / tablet / mobile (viewport width simulation in dev).
2. **Active breakpoint** — visual controls edit tokens for the selected breakpoint only.
3. Example: at `md`, changing padding updates `md:p-4`, not unprefixed `p-4` unless user chooses “base”.

This directly targets AI-generated UI pain (“make it more compact on mobile”) without another chat prompt.

### v0.4 — AI workflow integration (preview)

- **Open in editor** — `cursor://` or `vscode://file` link with path:line from index.
- **Copy component context** — structured snippet for Cursor/v0 prompts (component, id, classes, file).
- **Scoped prompt-assist** (optional) — “make this more modern” limited to selected node + patch pipeline; never whole-file rewrite.

### v0.5+ — Design system layer (preview)

- Theme / token editing (primary color, spacing scale) with explicit file targets.
- Semantic awareness for shadcn/ui and common patterns.

---

## 12. Editor UI requirements

The v0.2.0 editor must be redesigned as a polished development tool (using self-contained CSS, not host Tailwind).

### 12.1 Layout

Recommended editor width:

```text
360px minimum
420px ideal
520px max expanded
```

Sections:

1. Header
2. Selection info
3. Diagnostics/risk
4. Content
5. Layout
6. Typography
7. Appearance
8. Structure
9. Diff preview
10. Apply/Undo footer

---

### 12.2 Chip design

Chip should show:

```text
Nuvio · Connected · 12 ids
Edit on/off
Collapse
```

States:

- Connected: green indicator
- Connecting: yellow indicator
- Error: red indicator
- 0 ids: warning indicator

Do not require opening devtools to understand state.

---

### 12.3 Editor header

Show:

```text
Editor
hero.title
src/components/Hero.tsx:24
Safe to edit
```

Buttons:

- collapse
- reset position
- close panel

---

### 12.4 Controls

Use custom styled controls, not browser defaults.

Components:

- segmented control
- select
- input
- color swatch button
- spacing scale picker
- class token chips
- apply button
- validate button
- undo button

All controls should be accessible:

- keyboard focus visible
- labels
- `aria-*` where needed
- no tiny hit targets

---

### 12.5 Dark/light support

Nuvio should have its own theme independent of host dark mode.

Options:

```text
Auto
Light
Dark
```

Default: Auto, based on `prefers-color-scheme`.

Do not inherit host app `.dark` class.

---

### 12.6 Editor UX model

Recommended v0.2.0 flow:

```text
Click element
Change controls
Validate automatically or manually
Show diff preview
Apply
Undo available
```

Button states:

- Validate disabled when no change
- Apply disabled until validation succeeds
- Undo enabled when stack depth > 0
- Show touched file after apply

---

## 13. TailAdmin dogfood plan

Add TailAdmin as first real app compatibility target.

### 13.1 Local workspace setup

Inside Nuvio monorepo:

```text
apps/
  demo-app/
  tailwind-v4-test/
  tailadmin-dogfood/
```

### Option A — actual TailAdmin clone

```bash
cd apps
 git clone https://github.com/TailAdmin/free-react-tailwind-admin-dashboard.git tailadmin-dogfood
```

Then modify its `package.json` to use local packages:

```json
"devDependencies": {
  "@nuvio/vite-plugin": "workspace:*"
},
"dependencies": {
  "@nuvio/overlay": "workspace:*"
}
```

If workspace cannot directly include cloned repo, use `pnpm link` or `file:` dependencies.

### Option B — TailAdmin-like fixture

Build a simplified dashboard with:

- sidebar
- header
- cards
- charts placeholders
- table
- dark mode
- responsive layout
- Tailwind v4

Actual TailAdmin is better because it already revealed bugs.

---

### 13.2 TailAdmin instrumentation

Add ids to representative areas:

```tsx
<header data-nuvio-id="app.header" />
<aside data-nuvio-id="app.sidebar" />
<h1 data-nuvio-id="dashboard.title" />
<div data-nuvio-id="metric.customers.card" />
<div data-nuvio-id="metric.orders.card" />
<section data-nuvio-id="chart.sales" />
<table data-nuvio-id="orders.table" />
```

Test both native elements and custom components.

---

### 13.3 TailAdmin acceptance tests

Manual checks:

```text
Chip visible without devtools hacks
Editor visible without CSS hacks
Editor not clipped
Panel draggable
Panel reset works
Index >= 10 ids
Click header selects correct file
Click card selects correct file
Text edit validates/applies
Class edit validates/applies
Undo works
Dark mode does not break editor
Browser resize keeps chip visible
Devtools docked bottom keeps editor usable
```

---

## 14. Tailwind v4 test app plan

Create a smaller controlled test app before TailAdmin.

```text
apps/tailwind-v4-test
```

Stack:

```text
Vite 6 or 7/8 test matrix
React 19
Tailwind v4
TypeScript
```

Sections:

- hero card
- feature grid
- pricing cards
- dashboard card
- buttons
- responsive layout
- dark mode wrapper

Purpose:

- isolate Tailwind v4 issues
- test overlay independence
- test class patching
- run faster than TailAdmin

---

## 15. Test matrix

### Required before 0.2.0-alpha.0

| App | Vite | React | Tailwind | Expected |
|---|---:|---:|---:|---|
| clean v3 app | 6.x | 18/19 | 3.4.x | pass |
| clean v4 app | 6.x | 19 | 4.x | pass |
| TailAdmin | 6.x | 19 | 4.x | pass UI/chip/editor |

### Optional stretch

| App | Vite | React | Tailwind | Expected |
|---|---:|---:|---:|---|
| clean v4 app | 7.x | 19 | 4.x | pass |
| clean v4 app | 8.x | 19 | 4.x | pass or documented |

---

## 16. Updated setup guide after v0.2.0

The user guide should become simpler.

### New required setup

```bash
pnpm add -D @nuvio/vite-plugin @nuvio/overlay
```

`vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nuvio } from "@nuvio/vite-plugin";

export default defineConfig({
  plugins: [react(), nuvio()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
```

`App.tsx`:

```tsx
import { NuvioDevShell } from "@nuvio/overlay";

export default function App() {
  return (
    <>
      {/* app */}
      <NuvioDevShell />
    </>
  );
}
```

Editable element:

```tsx
<h1 data-nuvio-id="home.title" className="text-4xl font-bold">
  Welcome
</h1>
```

### Removed from required setup

No required Tailwind content line.

---

## 17. Package changes

### 17.1 `@nuvio/overlay`

Required:

- self-contained CSS bundle
- Shadow DOM mounting
- polished chip/editor
- collision-aware positioning
- diagnostics UI
- dark/light independent theme
- no dependency on host Tailwind

Optional:

- expose `NuvioDevShell` only
- hide internal components from public API

---

### 17.2 `@nuvio/vite-plugin`

Required:

- Vite adapter boundary
- broader peer compatibility after testing
- source index v2
- Tailwind/React package detection for diagnostics
- clear server logs
- duplicate id reporting
- safer error messages

---

### 17.3 `@nuvio/shared`

Add protocol fields:

```ts
interface RuntimeDiagnostics {
  protocolVersion: number;
  viteVersion?: string;
  reactVersion?: string;
  tailwindVersion?: string;
  overlayCssMode: "self-contained";
  indexedIds: number;
  duplicateIds: DuplicateIdWarning[];
}
```

Add indexed element metadata:

```ts
interface IndexedElementMetadata {
  id: string;
  filePath: string;
  line: number;
  column: number;
  tagName: string;
  componentName?: string;
  hasLiteralClassName: boolean;
  textEditable: boolean;
  riskLevel: "safe" | "caution" | "unsupported";
  unsupportedReasons: string[];
}
```

---

## 18. Implementation sequence

**Canonical order for Cursor and humans.** Maps to product **Phase A (v0.2.0)** only.

| Step | Engineering phase | Product outcome |
| ---- | ----------------- | --------------- |
| 1 | Overlay CSS | Host-agnostic Nuvio chrome |
| 2 | Shadow DOM + positioning | No clipping on TailAdmin |
| 3 | `tailwind-v4-test` app | TW v4 without full dashboard noise |
| 4 | Source index v2 + diagnostics | Smarter detection foundation |
| 5 | TailAdmin dogfood | Real-world proof |
| 6 | Docs + release | `0.2.0-alpha.0` → stable |

**Do not start TailAdmin until steps 1–4 pass on `demo-app` and `tailwind-v4-test`.**

### Step 1 — Overlay independence

1. Add compiled CSS build for `@nuvio/overlay` (`dist/style.css`).
2. Remove dependency on host Tailwind classes for Nuvio UI.
3. Convert editor controls to `nuvio-*` class names + CSS variables (§7.3).
4. Import/inject CSS from `NuvioDevShell`.
5. Remove overlay path from `apps/demo-app/tailwind.config.js` content.
6. Confirm clean v3 app still works: select → validate → apply → undo.

**Exit:** Clean v3 app works **without** overlay content line in Tailwind config.

---

### Step 2 — Shadow DOM and positioning

1. Create `NuvioShadowRoot` mount utility.
2. Render chip/editor/diagnostics into Shadow DOM.
3. Inject compiled CSS into shadow root.
4. Collision-aware defaults; versioned `localStorage` keys (`nuvio:*:v2`).
5. Reset position control; ignore offscreen saved positions.
6. Test with devtools docked (bottom, right, undocked).

**Exit:** Chip/editor visible and styled in `demo-app` **and** pass smoke on TailAdmin clone (UI only; full dogfood is step 5).

---

### Step 3 — Tailwind v4 test app

1. Add `apps/tailwind-v4-test` (Vite 6+, React 19, Tailwind 4, no `tailwind.config.js` if CSS-first).
2. Wire `workspace:*` `@nuvio/vite-plugin` and `@nuvio/overlay`.
3. Add representative `data-nuvio-id` fixtures (hero, grid, card, dark wrapper).
4. Test text/class validate → apply → undo.
5. Fix any v4-specific whitelist or patch issues.

**Exit:** Tailwind v4 clean app passes full edit loop.

---

### Step 4 — Source index v2 and diagnostics

1. Extend `@nuvio/shared` protocol + vite-plugin index builder.
2. Emit `IndexedElementMetadata` (§10.1).
3. Detect component names, literal vs computed `className`, map context.
4. Risk scoring + `unsupportedReasons`.
5. Diagnostics panel: Vite channel, versions, id count, selected node summary.
6. Wire editor header/selection info to metadata.

**Exit:** Editor shows file, line, component, className patchability, risk level; duplicates fail at index.

---

### Step 5 — TailAdmin dogfood

1. Add `apps/tailadmin-dogfood` (clone [TailAdmin free React dashboard](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard) or documented external fixture).
2. `workspace:*` local packages.
3. Instrument ids (§13.2): header, sidebar, title, metric cards, chart, table.
4. Run §13.3 acceptance tests + §15 test matrix row.
5. Fix UI collisions and any source-mapping issues.

**Exit:** TailAdmin works **without** manual browser console CSS hacks.

---

### Step 6 — Docs and release

1. Update `docs/nuvioUser.md` setup guide (§16).
2. Update `docs/COMPATIBILITY.md` and `docs/DOGFOOD.md`.
3. Changelog for `0.2.0-alpha.0`.
4. Publish alpha; dogfood from clean `pnpm add` install.
5. Promote to `0.2.0` stable when §20 DoD passes.

### Step 6 status (2026-05-28)

- Docs updates are completed: `docs/nuvioUser.md`, `docs/COMPATIBILITY.md`, `docs/DOGFOOD.md`.
- Changelog entry for `0.2.0-alpha.0` is written.
- `pnpm dogfood` passes (build + typecheck + tests + demo build).
- Package versions are bumped to `0.2.0-alpha.0` (`@nuvio/shared`, `@nuvio/ast-engine`, `@nuvio/overlay`, `@nuvio/vite-plugin`).
- `publish --dry-run` succeeds for all packages.
- Real npm publish currently fails with registry scope permissions (`@nuvio/*` 404 on PUT). This does not block repository completion of Phase A.
- Remaining `0.2.0 stable` items are manual QA evidence in §20.

**After v0.2.0 stable:** begin v0.3 per §11.3 (responsive + Tailwind superpowers).

---

## 19. Definition of done for 0.2.0-alpha.0

- [ ] Overlay UI does not depend on host Tailwind config.
- [ ] Nuvio chip visible by default in clean v3 app.
- [ ] Nuvio chip visible by default in clean v4 app.
- [ ] Nuvio chip visible by default in TailAdmin.
- [ ] Editor panel is styled and usable in TailAdmin.
- [ ] No browser console CSS hacks needed.
- [ ] Shadow DOM or equivalent isolation implemented.
- [ ] Reset overlay position works.
- [ ] Diagnostics show Vite/React/Tailwind versions where detectable.
- [ ] Source index v2 includes file, line, component, risk metadata.
- [ ] Computed className fails clearly without writing.
- [ ] Duplicate ids fail clearly without writing.
- [ ] Validate → Apply works in Tailwind v3.
- [ ] Validate → Apply works in Tailwind v4.
- [ ] Undo works after apply.
- [ ] TailAdmin text edit works.
- [ ] TailAdmin safe class edit works.
- [ ] Documentation updated.

---

## 20. Definition of done for 0.2.0 stable

Everything in alpha plus:

- [ ] TailAdmin dogfood completed twice from clean checkout.
- [ ] At least one complex dashboard section edited successfully.
- [ ] At least one form/control component edited successfully.
- [ ] Dark mode tested.
- [ ] Safari, Chrome, Firefox smoke tested.
- [ ] Vite 5/6 tested; Vite 7/8 either supported or clearly documented.
- [ ] No P0 issues:
  - wrong file write
  - wrong node write
  - editor invisible
  - broken undo
  - unstyled overlay
- [ ] Compatibility matrix updated.
- [ ] Changelog written.
- [ ] npm publish stable completed.

---

## 21. What not to do in v0.2.0

Do not add major new product scope before Phase A exit criteria pass.

### Engineering deferrals

- Next.js support
- Responsive / breakpoint-aware editing (v0.3)
- Device preview modes (v0.3)
- AI prompt editing / chat UI (v0.4)
- “Open in Cursor” / copy AI context (v0.4)
- Figma import / arbitrary drag canvas
- Cloud accounts / hosted control plane
- Design-token file sync (v0.5+)
- Support for every `cn()` / template `className` pattern
- Competing with v0 / Lovable / Bolt on generation

### Platform deferrals

- Mobile, React Native, Vue, Angular, Flutter
- Team collaboration (comments, multiplayer, approvals)

v0.2.0 must make the **existing** visual edit loop solid on real dashboards.

---

## 22. Strategic outcome

After v0.2.0, Nuvio should be credible in the exact environment where it matters:

```text
AI-generated or template-based React dashboards
Tailwind v4
Vite dev server
real components
real layout complexity
```

### Demo story (TailAdmin — Phase A done)

1. Clone TailAdmin.
2. Add Nuvio (`@nuvio/vite-plugin`, `@nuvio/overlay`, `<NuvioDevShell />`, `data-nuvio-id`).
3. Start dev server — **no Tailwind content hack for overlay**.
4. Nuvio chip appears, connected, with id count.
5. Click a dashboard card.
6. Editor shows file, line, component, risk, and patchability.
7. Change text or safe literal classes.
8. Validate → see diff summary.
9. Apply → source updates → HMR.
10. Undo works.

### Demo story (post v0.3 — Phase B)

Same flow, plus: switch to mobile preview, adjust `md:p-4` visually, rarely open Cursor for spacing tweaks.

### Moat

```text
visual editing that expert developers trust because it understands source code,
refuses risky changes, and fits the AI-generate → refine → commit workflow
```

---

## 23. Final implementation instruction for Cursor

**Start from §18.** When implementing v0.2.0:

```text
1. Do not start with TailAdmin.
2. Overlay CSS self-contained → demo-app without overlay in tailwind content.
3. Shadow DOM + positioning v2.
4. apps/tailwind-v4-test → full edit loop on TW v4.
5. Source index v2 + diagnostics UI.
6. apps/tailadmin-dogfood → §13.3 acceptance tests.
7. Docs + 0.2.0-alpha.0 → stable per §19–20.
8. Then plan v0.3 (§11.3) — responsive editing first among new features.
```

**Behavior rules:**

- Prefer explicit diagnostics and fail-closed over silent partial functionality.
- Never patch duplicate ids, non-literal `className`, or unknown ids.
- Correctness before new controls: a working diff on one utility beats ten broken pickers.

**Repo touchpoints (current baseline):**

| Package | v0.2.0 focus |
| ------- | ------------ |
| `packages/overlay` | `style.css`, Shadow DOM, `nuvio-*` UI, diagnostics panel |
| `packages/vite-plugin` | `viteAdapter.ts`, index v2, version detection |
| `packages/shared` | `IndexedElementMetadata`, `RuntimeDiagnostics`, protocol bump |
| `packages/ast-engine` | Risk checks at patch time; whitelist unchanged unless TW v4 gaps |
| `apps/demo-app` | Remove overlay from Tailwind content after step 1 |
| `apps/tailwind-v4-test` | New |
| `apps/tailadmin-dogfood` | New (clone + ids) |
