# DaisyUI + nuvio

**Applies to:** `@nuvio/*` **1.0.0**

## Detection

nuvio detects DaisyUI when `daisyui` appears in `package.json` dependencies.

Developer details → **Libraries: daisyui**.

## What works in 1.0 (Phase 1)

- Library detection and `libraryHint` on indexed hosts
- Standard `data-nuvio-id` + click-to-tag on **native elements** with Daisy classes (`btn`, `card`, etc.)

## What is not fully validated yet

- Class-only Daisy hosts without explicit `data-nuvio-id` (no dedicated Daisy example app in 1.0)
- Component semantics beyond generic text/style tasks

## Workaround

Add explicit ids on the JSX host you want to edit:

```tsx
<button className="btn btn-primary" data-nuvio-id="hero.cta">
  Get started
</button>
```

Or use **Make Editable** on the native button element in the browser.

## Setup

```bash
pnpm dlx @nuvio/cli@1.0.0 init --yes
pnpm dev
```

Ensure Tailwind + DaisyUI are configured per [daisyui.com](https://daisyui.com/).
