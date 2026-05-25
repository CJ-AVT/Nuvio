# Nuvio PRD

This document covers product intent from MVP through commercial readiness. Phased delivery and engineering tasks live in `docs/implPlan.md`.

# Product Name

Nuvio

Tagline:
"Stop wasting AI tokens on small UI edits."

Alternative Tagline:
"Turn your localhost app into a live editable design surface."

---

# Vision

Nuvio is a visual editing layer for AI-generated web apps.

Developers increasingly use tools like Cursor, Replit, Lovable, Bolt, and v0 to generate applications using prompts.

However, most day-to-day UI refinement still requires repetitive prompts such as:

* Move this button slightly right
* Increase spacing between cards
* Make the text darker
* Change font size
* Adjust padding
* Reorder elements
* Center align this section

These are low-intelligence visual operations but still consume:

* AI tokens
* context window
* waiting time
* retries
* money

Nuvio solves this by enabling direct visual editing on localhost while synchronizing edits back to the real React source code.

The goal is not to replace Cursor.

The goal is:

"Use AI for architecture and coding. Use Nuvio for visual refinement."

---

# Problem Statement

Current AI coding workflow is inefficient for minor UI edits.

Example workflow today:

1. User prompts Cursor
2. Cursor rewrites JSX/Tailwind
3. User waits for generation
4. Layout may partially break
5. User retries prompt
6. More tokens are consumed

This is extremely inefficient for deterministic visual changes.

Developers need:

* instant visual manipulation
* no prompting for tiny changes
* safe source-code synchronization
* local-first workflow
* React/Tailwind awareness

---

# MVP Goal

Build a localhost visual editing mode for React + Tailwind applications.

Users can:

* click elements
* edit spacing
* edit text
* edit colors
* edit typography
* adjust border radius
* move elements within simple layouts
* save changes
* automatically update source code

Changes should instantly hot reload in localhost.

MVP is successful when **source patches are trustworthy**, not only when the overlay feels polished. Favor **golden tests on real TSX fixtures**, **minimal diffs**, and **clear failure modes** over extra UI chrome in early weeks.

---

# Core Product Thesis

Nuvio is NOT:

* a no-code builder
* a website generator
* a Figma replacement
* a full visual IDE

Nuvio IS:

"A source-aware visual editing layer for AI-generated apps."

---

# Target Users

## Primary Users

### AI-native developers

People using:

* Cursor
* Replit
* Claude Code
* v0
* Bolt
* Lovable

### Indie hackers

People building fast MVPs.

### New developers

People doing vibe coding and wasting tokens on UI tweaks.

---

# Product shape: what ships, where it runs, how it fits Cursor

This section answers: **Is Nuvio a webapp, an extension, or localhost tooling?** and **how a real team uses it beside Cursor.**

## What the end product is (MVP)

Nuvio ships as **npm packages** that developers add to their **own** React + Vite + Tailwind app (for example a `@nuvio/vite-plugin` package plus supporting libraries). In development:

1. The developer runs their normal dev server (e.g. `npm run dev`).
2. They open their app in a **browser** at **localhost** (e.g. `http://localhost:5173`).
3. The Vite plugin injects a **dev-only overlay** (selection outlines, Editor panel, edit mode) on top of the running page.
4. A small **local dev server channel** (for example WebSocket) coordinates the overlay with **file writes** under the project root.

So the “product surface” the user interacts with in MVP is **their localhost app in the browser with Nuvio edit mode**, not a separate hosted Nuvio website they log into, and not a second codebase.

## What it is not (MVP)

* **Not** a public, multi-tenant **hosted web editor** that edits arbitrary production URLs.
* **Not** a **VS Code or Cursor extension** in MVP. No editor install is required to use Nuvio; any editor works as long as it reads files from disk.
* **Not** a replacement for git, CI, or production deploys.

Optional **IDE extensions or a hosted control plane** may appear in later phases; they are not required for the core value proposition.

## How it links to Cursor (and any other editor)

Nuvio and Cursor both operate on the **same repository on disk**.

* Nuvio applies changes by **patching source files** (TSX/TS/CSS as scoped in the PRD). Those are ordinary files in the workspace.
* Cursor (or VS Code, Zed, etc.) **sees updates like any other external edit**: file watcher refresh, diff in source control, or a prompt to reload if the buffer changed on disk.

**Typical workflow:** Cursor window with the repo + terminal running `npm run dev` + **browser** on localhost with Nuvio edit mode enabled. The developer uses **Cursor for architecture, logic, and AI prompts**, and the **browser + Nuvio for deterministic visual tweaks** that write straight to the same files Cursor is editing.

There is **no mandatory Cursor-specific plugin** in MVP: integration is **files on disk + localhost preview**, which keeps the stack editor-agnostic and easy to adopt.

## Using Nuvio on real-world applications

1. **Install** Nuvio as dev dependencies and register the Vite plugin (dev-only configuration).
2. **Opt in** regions of the UI with the **host contract** (for example `data-nuvio-id` or `EditableText` / `EditableContainer` wrappers) so mapping from DOM to AST is reliable.
3. **Run** the existing dev command; open **localhost**; toggle **Nuvio edit mode** in the overlay.
4. **Edit** visually; confirm the diff in git; **commit** like any other change. Code review and CI see normal source diffs.
5. **Production builds** do not ship the edit overlay: the plugin is inactive or omitted outside dev, so end users never see Nuvio.

Teams keep using their normal stack (Cursor, GitHub, Vercel, etc.); Nuvio is an extra **local refinement layer** during development.

---

# MVP Scope

## Shipping strategy: narrow public alpha, then full MVP

External review recommends **shipping a smaller first public alpha** to earn trust before broader surface area. **Do not block alpha on** constrained drag movement, duplicate/hide toolbar actions, left-rail component tree, or every cosmetic control in the original wishlist.

* **First public alpha:** trust-focused slice (see below). Goal: developers believe Nuvio **will not damage their code**.
* **Full MVP (follow-up release):** adds remaining PRD items deferred from alpha (layout moves, richer toolbar, optional component tree, any properties trimmed from alpha).

---

## First public alpha — in scope

Stack and contract:

* React + Vite + Tailwind + TypeScript (localhost only)
* **`data-nuvio-id` and/or** contract **wrappers** (`EditableText`, `EditableContainer`, …)

Editing and UI:

* Hover / select
* Inline **text** editing
* **Padding and margin** (via whitelist + `tailwind-merge`)
* **Font size and weight**
* **Text color** and **background color**
* **Border radius**
* **Diff preview** before apply (readable summary)
* **Undo last patch** (in-memory snapshot + operation id; see Implementation decisions)
* **Touched file log** after apply

Quality:

* **Golden tests** on TSX fixtures for all alpha operations
* **Demo SaaS landing** instrumented to the host contract as the reference app

---

## First public alpha — explicitly deferred

* Constrained **drag / reorder** (sibling reorder, flex/grid parent moves)
* Toolbar: **duplicate**, **hide/show**, **move**
* **Left-rail component tree** (optional for full MVP; not required for alpha)
* Properties beyond the alpha list where not needed for the demo (e.g. gap, width/height, full shadow/opacity suite) unless required to ship the demo — **default defer** to full MVP
* Next.js, AI-assisted patches, cloud, Figma import (already global deferrals)

---

## Full MVP — adds after alpha (still “MVP”, second milestone)

* **Layout manipulation** as originally specified: reorder siblings, move within same flex/grid parent (with tests)
* Toolbar actions: duplicate, hide, move (as feasible without breaking the contract)
* Optional **component tree** in the left rail
* Remaining **editable properties** from the sections below that were deferred from alpha (gap, width, height, alignment, border width, opacity, shadow presets, etc.)

---

# Included in MVP (full MVP vision; alpha is a subset)

## Visual Selection

Users can:

* hover elements
* see blue selection outlines
* click elements
* see Editor panel (editable properties)

---

## Editable Properties

The **first public alpha** ships only the subset listed under **First public alpha — in scope** in MVP Scope. The sections below describe the **full MVP** catalog (alpha + post-alpha).

### Typography

* font size
* font weight
* text color
* text alignment

### Layout

* margin
* padding
* width
* height
* gap
* alignment

### Appearance

* background color
* border radius
* border width
* opacity
* shadow presets

### Content

* edit text inline

---

## Layout Manipulation

**Full MVP** includes limited support:

* reorder sibling elements
* move inside same flex/grid parent

**Not in first public alpha** (see MVP Scope): any drag-based or structural moves — ship only after the alpha proves patch safety.

NOT included (any release):

* arbitrary drag anywhere
* freeform canvas positioning

---

## Synchronization

When the user confirms a change (after **diff preview** in alpha):

1. Nuvio resolves **`id` → file + node** via the **dev-time source index** (see Implementation decisions)
2. Nuvio shows **diff preview** (human-readable); user confirms apply (exact UX: confirm button vs auto-apply with preview panel — either is acceptable if preview is visible before disk write)
3. Nuvio **snapshots prior file contents** for undo, assigns **operation id**, then patches source file
4. Prettier formats file
5. Vite hot reload updates UI
6. Cursor and other editors see changed code on disk

## Safety and reversibility (MVP bar)

* **No silent wrong-node patches**: if mapping or AST resolution fails, surface an explicit error; do not write.
* **Undo**: implement **in-memory “Undo last change”** per Implementation decisions; do **not** rely on git literacy as the only escape hatch.
* **Auditability**: dev server logs which files were patched (optional verbosity flag).

---

# Not Included in MVP

* Vue support
* Angular support
* Figma import
* collaborative editing
* production deployment
* arbitrary website editing
* backend editing
* database editing
* business logic editing
* animation timeline editor
* mobile native apps
* visual state machine builder
* AI generation
* cloud sync
* mandatory accounts or cloud services for local editing
* a standalone hosted Nuvio app that edits arbitrary sites or production URLs without the developer’s repo and dev server
* a VS Code or Cursor extension as a requirement to use Nuvio (optional extensions may be explored later for convenience only)

---

# Technical Constraints

MVP only supports:

* React
* Vite
* Tailwind CSS
* TypeScript
* Localhost only

Optional support later:

* Next.js (note: App Router and React Server Components are a **separate hardness tier** from classic client-rendered React; plan explicit compatibility phases in `docs/implPlan.md`)
* shadcn/ui
* Remix

---

# Implementation decisions (locked for engineering)

These choices answer common review questions and should **not** be re-decided mid-sprint.

## Tailwind editing (MVP)

* Use a **controlled Tailwind utility whitelist** (only approved class tokens can be introduced or toggled for each property).
* Use **`tailwind-merge`** when composing the final `className` so conflicting utilities resolve predictably.
* **Design tokens** (shared semantic colors/spacing files) are **out of scope for the first public alpha**; add in a later phase when the patch pipeline is trusted.

## How `hero.title` resolves to `src/components/Hero.tsx`

**Primary approach (recommended):** a **dev-time source index** maintained by the Vite plugin / dev server:

1. On dev server start and on relevant file changes, **scan the project** (configured `src` roots) with the AST.
2. Record every **`data-nuvio-id`** attribute and every **wrapper prop** such as `EditableText id="..."` / `EditableContainer id="..."`.
3. Persist a map: **`id` → `{ filePath, stable node key or locator }`** used by the patch engine to open the correct file and JSX node.

Runtime DOM only sends **`id`**; resolution uses the index. **Rebuild or invalidate the index** when files change so ids never point at stale locations.

**Optional escape hatch:** wrappers may accept an explicit **`file="src/components/Hero.tsx"`** (or equivalent) when an id must be unique across files or when the scanner cannot infer a unique owner; the index should validate that the id exists in that file.

## Undo / revert (do not rely on git alone)

Many early users are not comfortable using git as their only undo. **Nuvio must implement in-session undo.**

**MVP behavior (sharp spec):**

* **Before every successful write** to a given file, the dev server keeps **the previous full file contents in memory** (per session, LRU-bounded by configurable max bytes / file count to avoid blowing RAM on huge files).
* Each applied change gets an **operation id** (monotonic or UUID) and metadata: target file(s), timestamp, short label for UI (e.g. “className: mt-6 → mt-8”).
* The overlay exposes **“Undo last change”** (and optionally a short stack of undos) that restores the **previous snapshot** for that file and triggers HMR; **no git knowledge required**.
* **Git remains recommended** for long-term history and review, but is **not** the primary undo path.

## Diff preview (trust before write)

Before applying a patch (at least for the **first public alpha** and until confidence is high), show a **simple human-readable preview**, for example:

`File: src/components/Hero.tsx`  
`Change: className "mt-6" → "mt-8"`

Even a single-line or small multi-line summary **before apply** materially increases trust. Advanced side-by-side diffs can come later; the alpha bar is **something readable**, not silent writes.

---

# Distribution and developer experience

Ship what global developers expect from dev tooling:

* **npm packages** with semver; documented peer dependencies (React, Vite, Tailwind, TypeScript ranges).
* **Minimal `vite.config` integration** (few lines, copy-pasteable).
* **Compatibility matrix** in docs: supported major versions and known gaps.
* **Starter or demo**: the SaaS landing demo app is the **reference implementation and contract test surface**, not only marketing.
* **CI posture**: document ports, env flags, and whether headless/CI runs require Nuvio disabled (e.g. `NUVIO=0`).

---

# Architecture

# High-Level Architecture

```text
React App
   ↓
Nuvio Overlay
   ↓
Selection Engine
   ↓
Property Editor
   ↓
Patch Engine
   ↓
AST Source Modifier
   ↓
Prettier
   ↓
Vite HMR
   ↓
Updated Localhost UI
```

---

# Core System Components

## 1. Overlay System

Responsible for:

* hover outlines
* selection boxes
* resize handles
* edit mode UI

Tech:

* React portal
* Floating UI
* Framer Motion

---

## 2. DOM mapping and host app contract

Maps rendered DOM to source components. In MVP this is **explicit and stable**, not inferred from arbitrary trees.

Every editable element should expose a stable id (attribute or wrapper prop), for example:

```tsx
<div data-nuvio-id="hero.title">
```

This ID maps to:

* source file
* JSX node
* component hierarchy

**Contract (document and enforce in product):**

* **Stable ids**: ids are unique within the app surface under edit; collisions are rejected with a clear error.
* **Wrapper boundaries**: optional `EditableText` / `EditableContainer` components define supported edit surfaces.
* **Resolution**: **`id` → `{ file, node }`** via the **dev-time source index** (AST scan on dev start and on file change); optional explicit `file="..."` on wrappers when needed (see Implementation decisions).
* **Failure behavior**: missing id, unknown id, or ambiguous AST match → block write and show actionable message.
* **Round-trip expectation**: after manual edits in the IDE, Nuvio should still resolve the same node when the structure remains contract-compliant; **rebuild or patch the index** when sources change.

---

## 3. AST engine

Responsible for:

* locating JSX nodes
* editing Tailwind classes
* editing text
* preserving formatting and comments where practical
* producing **minimal, reviewable diffs** (avoid churn across unrelated lines)

**Quality bar:** maintain **golden tests** (fixtures: TSX file in → expected TSX out) for typography, spacing, **whitelist + `tailwind-merge`** behavior, text nodes, and common patterns (e.g. `className` string vs `cn()` — support level TBD per phase).

Recommended libraries:

* ts-morph
* recast
* Babel parser
* TypeScript Compiler API

---

## 4. Patch Engine

Generates structured updates.

Example:

```json
{
  "id": "hero.button",
  "operation": "updateClass",
  "property": "padding",
  "value": "px-6 py-3"
}
```

---

## 5. Dev server integration

Use Vite plugin.

Responsibilities:

* websocket communication
* file watching
* HMR triggering
* edit mode state

**Security (commercial baseline even for localhost):**

* **Narrow API** between overlay and server; validate message shape and operation types.
* **Path confinement**: all writes resolved under project root; reject `..` and out-of-root paths.
* **Origin / host checks** for WebSocket and HTTP helper endpoints in dev.
* **Transparent behavior**: no network calls except localhost unless explicitly configured (future cloud features stay opt-in).

---

# Observability

* **Telemetry**: fully **opt-in** only; default off. If enabled, document payload categories (no source code content by default).
* **Local diagnostics**: structured logs for patch success/failure reasons to support debugging without remote reporting.

---

# Recommended Tech Stack

## Frontend

* React
* TypeScript
* Tailwind CSS
* Framer Motion
* Floating UI
* Zustand

## Backend/Local Server

* Node.js
* Express or Fastify
* WebSocket

## AST Processing

* ts-morph
* recast
* prettier

## Dev Integration

* Vite plugin

---

# Project Structure

```text
packages/
  overlay/
  vite-plugin/
  ast-engine/
  shared/

apps/
  demo-app/
```

---

# MVP User Flow

# Flow 1: Editing UI

1. User runs:

```bash
npm run dev
```

2. User opens:

```text
localhost:5173
```

3. User enables edit mode.

4. User clicks button.

5. Editor panel opens.

6. User changes padding.

7. Source code updates instantly.

8. UI hot reloads.

---

# Flow 2: Editing Text

1. User clicks heading.
2. Inline text editing activates.
3. User types new text.
4. JSX updates.
5. React reloads automatically.

---

# MVP UI Design

Inspired by:

* Figma
* Replit Canvas
* Framer
* Chrome DevTools

---

# Layout

## Left Side

**First public alpha:** omit the component tree rail or show a minimal placeholder; focus on center + right panel.

**Full MVP:** optional component tree (as originally envisioned).

---

## Center

Live localhost preview

---

## Right Panel

Property editor

Sections:

* Typography
* Layout
* Appearance
* Spacing

---

# Edit Mode UX

## Hover State

Blue outline.

## Selected State

Blue border + handles.

## Toolbar

**First public alpha:** minimal toolbar — e.g. **edit text** only (plus global **Undo last change** elsewhere in chrome).

**Full MVP:** floating toolbar may add **duplicate**, **hide**, **move** once structural edits are supported and tested.

---

# Test Web Page for MVP

Build ONE highly controlled demo app.

Do NOT test on arbitrary websites initially.

---

# Recommended Demo App

## SaaS Landing Page

Contains:

### Hero Section

* heading
* subheading
* CTA buttons
* image

### Features Grid

* cards
* icons
* spacing
* typography

### Pricing Section

* plans
* buttons
* highlights

### Testimonials

* avatar
* text
* cards

### Footer

* links
* social icons

---

# Why this demo is ideal

It tests:

* typography edits
* spacing edits
* flex/grid layout (visual coverage; **alpha** does not require drag moves)
* card movement (**full MVP**; optional in demo layout until then)
* color editing
* alignment
* text editing

Without requiring:

* complex application state
* authentication
* APIs
* routing

---

# Example Editable Components

## Editable Text

```tsx
<EditableText id="hero.title">
  Build faster with AI
</EditableText>
```

---

## Editable Card

```tsx
<EditableContainer id="feature.card.analytics">
  <Card>
    ...
  </Card>
</EditableContainer>
```

---

# Success Metrics

## Primary Metrics

### Time saved

Goal:

Reduce minor UI editing time by 70%.

---

### Prompt reduction

Goal:

Reduce UI-related AI prompts by 60%.

---

### Token reduction

Goal:

Reduce token usage for frontend refinement.

---

## Secondary Metrics

* session duration
* edits per session
* save frequency
* localhost reload speed

---

# Risks

## Risk 1: DOM to Source Mapping

Problem:

Complex React structures make source mapping difficult.

Mitigation:

**Dev-time source index** (AST scan) plus explicit ids / wrappers; require contract compliance; optional explicit `file` on wrappers when the scanner cannot disambiguate.

---

## Risk 2: Tailwind Class Explosion

Problem:

Many conflicting utility classes.

Mitigation:

**Controlled utility whitelist** plus **`tailwind-merge`** at compose time; reject unknown tokens with a clear message.

---

## Risk 3: Arbitrary Layout Editing

Problem:

Freeform movement breaks responsive layouts.

Mitigation:

Only support constrained layout movement in v1.

---

# Future Roadmap

# V2

* Next.js support
* visual flex/grid controls
* responsive breakpoint editing
* design token system
* component tree inspector
* optional editor-side helpers (for example a Cursor/VS Code companion to toggle edit mode or open the matching localhost URL) while keeping the core model **disk + localhost browser** unless the product explicitly evolves

---

# V3

* AI-assisted visual editing
* prompt + visual hybrid editing
* component generation
* reusable design system syncing

---

# V4

* multiplayer collaboration
* cloud sync
* Figma integration
* production deployment tools

---

# Positioning

## One-line Description

"Nuvio turns your localhost app into a live editable design surface synchronized with real source code."

---

# Competitive Positioning

| Product       | Weakness                    |
| ------------- | --------------------------- |
| Figma         | disconnected from real code |
| Cursor        | no visual editing           |
| Replit Canvas | shallow source awareness    |
| Webflow       | not developer-native        |
| Framer        | not codebase-native         |

Nuvio combines:

* localhost editing
* real source synchronization
* developer workflow
* AI-native iteration

---

# MVP development plan (rebalanced)

Prioritize **patch pipeline + tests** alongside the overlay so the product stays trustworthy as real code diverges from the demo. **Target a narrow public alpha before the full MVP** (see MVP Scope and `docs/implPlan.md`).

## Week 1

* Vite plugin skeleton (dev-only injection, config surface)
* WebSocket (or equivalent) channel with validated message protocol
* **Dev-time source index**: scan configured roots; map `data-nuvio-id` / wrapper ids → `{ file, node }`; invalidate on file change
* Overlay: hover, click selection, minimal property shell (can stub some controls)
* **Security baseline**: path confinement, origin checks for dev endpoints

## Week 2

* AST engine: resolve nodes using the index; **golden test harness** + first fixtures
* Text editing end-to-end (overlay → **diff preview** → patch → file → HMR)
* **Tailwind:** locked strategy — **utility whitelist + `tailwind-merge`**
* **Failure modes**: explicit errors when resolution fails; no silent writes

## Week 3

* Alpha property set: padding/margin, font size/weight, text/background color, border radius (all via whitelist + merge)
* Prettier integration and diff minimization pass
* **In-memory undo**: snapshot before write, operation id, **Undo last change**; touched file log
* Hot reload sync hardened

## Week 4 (public alpha hardening)

* Demo SaaS landing app fully instrumented for **alpha** scope
* Onboarding: install snippet, troubleshooting, compatibility matrix stub
* **npm publish** as **alpha** dist-tag (semver); dogfood on clean Vite template
* Polish overlay UX (motion and chrome **after** correctness)

## Weeks 5+ (full MVP, second milestone)

* Constrained movement inside flex/grid + toolbar duplicate/hide/move as designed
* Optional component tree; remaining deferred properties
* Promote from alpha to stable when DoD for full MVP is met

---

# MVP definition of done

## First public alpha

Alpha is acceptable for external early adopters when:

1. **Alpha scope** in MVP Scope is fully implemented (including **diff preview**, **undo last patch**, **touched file log**).
2. **Demo app**: all **alpha** flows on the SaaS landing demo work without manual file repair.
3. **Tests**: golden tests cover every alpha patch operation; CI runs them on every change to `ast-engine` (or equivalent package).
4. **Safety**: failed mapping never writes; **undo** works without requiring git.
5. **Docs + packaging**: install steps, compatibility matrix stub, known limitations; **npm** published with **alpha** dist-tag (or `0.x` with clear labeling).

## Full MVP (follow-up)

Full MVP adds deferred items (layout moves, expanded toolbar, optional tree, remaining properties) and meets the same quality bar with **expanded** golden tests and docs. Stable semver when ready.

---

# Final Product Philosophy

AI should handle:

* architecture
* logic
* generation
* reasoning

Nuvio should handle:

* refinement
* layout
* spacing
* visual polish
* deterministic UI operations

The future workflow is:

"Prompt the app into existence. Refine it visually."

---

# Document index

* **Product and scope**: this PRD (including **Implementation decisions** and **Public alpha** vs full MVP).
* **Phased implementation, milestones, and dependencies**: `docs/implPlan.md`.
* **Full MVP release checklist and dogfood**: `docs/FULL_MVP_DOD.md`, `docs/DOGFOOD.md`.
