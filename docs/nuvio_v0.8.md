# nuvio v0.8 — Component Library Support (internal milestone)

**Status:** Phase 1 implemented in repo — **not** a separate npm release  
**Ships in:** `@nuvio/*` **1.0.0**  
**Roadmap:** [v1.0.md](v1.0.md) § v0.8

---

## Goal

Support real-world React + Tailwind projects that use **shadcn/ui**, **TailAdmin**, and **DaisyUI** — not only hand-tagged demo JSX.

## What shipped (Phase 1)

| Area | Change |
| ---- | ------ |
| **Library registry** | `@nuvio/shared` — detection helpers, shadcn compound tags, id segments |
| **Project scan** | Vite plugin detects libraries at index time → `runtimeDiagnostics.detectedLibraries` |
| **Per-host hints** | Index entries include `libraryHint` (`shadcn` / `tailadmin` / `daisyui`) |
| **Click-to-tag** | Library-aware id suggestions (`Button` → `page.button`, `CardTitle` → `page.title`) |
| **Overlay routing** | shadcn `Card` / `Button` / `Table` / `Input` → Simple Mode task menus |
| **Guidance** | Clearer messages for opaque shadcn wrappers |

## Detection signals

| Library | Signals |
| ------- | ------- |
| **shadcn** | `components/ui/*.tsx` or `src/components/ui/*.tsx` |
| **TailAdmin** | `src/layout/AppSidebar`, `src/components/ecommerce/`, package name |
| **DaisyUI** | `daisyui` in `package.json` dependencies |

Shown in overlay **Developer details** → stack row: `Libraries: tailadmin, …`

## Still deferred

- Full `examples/shadcn-dashboard` fixture app
- DaisyUI starter demo app
- `nuvio scan` untagged candidate hints (v0.9 shipped offline host list only)
- Radix portal / Dialog interior hosts
- Generalized `forwardRef` / `Slot` attribute forwarding in third-party components

## Verify

```bash
pnpm build && pnpm test
pnpm dev:tailadmin
```

Developer details → confirm `Libraries: tailadmin`. Click-to-tag on native elements; edit instrumented TailAdmin dashboard hosts.

## Key files

| Package | Files |
| ------- | ----- |
| shared | `library-registry.ts`, `suggest-nuvio-id.ts`, `protocol.ts` |
| vite-plugin | `detect-libraries.ts`, `source-index-metadata.ts` |
| overlay | `component-mode.tsx`, `task-router-modes.ts`, `NuvioDevShell.tsx` |
