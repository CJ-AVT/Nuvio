# nuvio v1.0.0 — Stable open-source release

**Status:** Ready in repo — publish with `pnpm publish:stable`  
**npm:** `@nuvio/*` **1.0.0** (all five public packages)  
**Roadmap:** [v1.0.md](v1.0.md)

---

## Goal

Production-ready release for React + Vite + Tailwind vibe coders: init → click-to-tag → apply, with library support and CLI diagnostics.

## What shipped

| Area | Deliverable |
| ---- | ----------- |
| **Onboarding** | `nuvio init` + Make Editable click-to-tag |
| **Patch engine** | literal + `cn()` + conditional `cn` + static `classnames()` |
| **Libraries** | shadcn / TailAdmin / DaisyUI detection + guides |
| **CLI** | `doctor`, `scan`, `stats` |
| **Examples** | `examples/vite-basic`, `shadcn-dashboard`, `tailadmin-demo` |
| **Docs** | `nuvioUser.md`, `MIGRATION_0.5_to_1.0.md`, library guides |
| **Gate** | `pnpm v10:acceptance` |

## Verify (maintainers)

```bash
pnpm install
pnpm build && pnpm typecheck && pnpm test
pnpm dogfood
pnpm v10:acceptance
```

Manual: `pnpm dev:tailadmin` → edit → apply. Fresh machine: `pnpm dlx @nuvio/cli@1.0.0 init --yes` on clean Vite app.

## Publish (human steps)

```bash
pnpm publish:stable --otp=…
git tag v1.0.0
# GitHub release + demo GIF
```

## Key paths

| Area | Paths |
| ---- | ----- |
| Examples | `examples/` |
| CLI | `packages/cli/src/doctor.ts`, `scan-cmd.ts`, `stats.ts` |
| Click-to-tag | `packages/vite-plugin/src/jsx-loc-transform.ts`, `handle-tag-element.ts` |
| Libraries | `packages/shared/src/library-registry.ts`, `docs/libraries/` |
| Migration | `docs/MIGRATION_0.5_to_1.0.md` |

## Not in 1.0.0

- `@nuvio/next` (experimental, separate version line)
- Full DaisyUI example app
- npm publish of intermediate v0.6–v0.9 milestones (internal only)
