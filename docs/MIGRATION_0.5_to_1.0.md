# Migration: 0.5.x → 1.0.0

**Target:** `@nuvio/cli`, `@nuvio/vite-plugin`, `@nuvio/overlay`, `@nuvio/ast-engine`, `@nuvio/shared` at **1.0.0**.

## npm users

```bash
pnpm dlx @nuvio/cli init --yes
```

Or bump devDependencies manually (npm `latest`):

```bash
pnpm add -D @nuvio/vite-plugin @nuvio/overlay
```

Re-run init — it is idempotent and adds any missing wiring (overlay CSS, `optimizeDeps.exclude`, starter id).

## What changed since 0.5.x

| Area | 0.5.x | 1.0.0 |
| ---- | ----- | ----- |
| Onboarding | Manual `data-nuvio-id` for most UI | **Click-to-tag** (Make Editable) + starter `page.title` |
| Tailwind | String literal `className` only | `cn()`, conditional `cn`, static `classnames()` maps |
| Libraries | Generic only | shadcn / TailAdmin / DaisyUI detection + routing |
| CLI | `init` only | `doctor`, `scan`, `stats` |
| Protocol | v7 | **v8** (`tagElement` RPC) |

## Breaking / behavior notes

- **Restart dev server** after upgrading — required for `data-nuvio-loc` click-to-tag transform.
- **Duplicate ids** are blocked at index time (unchanged policy, clearer CLI surfacing via `nuvio scan`).
- Projects using **workspace** / monorepo links: `nuvio doctor` treats overlay CSS and `optimizeDeps.exclude` as optional when `@nuvio/overlay` is `workspace:*`.

## Verify after upgrade

```bash
nuvio doctor
nuvio scan
pnpm dev
```

Edit on → click starter or untagged element → Preview → Apply.

## Still experimental

`@nuvio/next` remains **0.4.0-alpha** — not part of the 1.0.0 npm publish set.
