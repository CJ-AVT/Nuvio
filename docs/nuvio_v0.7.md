# nuvio v0.7 — Better Tailwind Support (internal milestone)

**Status:** Phase A implemented in repo — **not** a separate npm release  
**Ships in:** `@nuvio/*` **1.0.0** (see [v1.0.md](v1.0.md) release policy)  
**Roadmap:** [v1.0.md](v1.0.md) § v0.7

---

## Goal

Support real Tailwind `className` patterns — not only string literals and simple `cn("a", "b")` lists.

## What shipped (Phase A)

| Mode | Pattern example | Patch behavior |
| ---- | --------------- | -------------- |
| `cn-basic` | `cn("p-4", "rounded")` | Collapse to merged string literal list (existing) |
| `cn-conditional` | `cn("p-4", active && "bg-blue-500")` | Merge into base literal; preserve `&&` branches |
| `classnames-static` | `classnames("p-4", { active })` | Merge into string literal; object map untouched |
| `literal-only` | `className="p-4"` | Unchanged |

**Index v5:** each host gets auto-detected `classNameMode` in the source index; patch RPC routes per entry (no global opt-in required).

## Still deferred (Phase B / v0.8)

- `cva()` / `tailwind-variants`
- Template literals, arbitrary values `text-[#fff]`
- Full Tailwind v4 token parity gate

## Verify

```bash
pnpm build && pnpm test
```

Dogfood: TailAdmin components using `cn("…", condition && "…")` → Quick Style → Preview → Apply.

## Key files

| Package | Files |
| ------- | ----- |
| ast-engine | `classname-mode.ts`, `classname-binding.ts`, `apply-patch.ts` |
| vite-plugin | `source-index-metadata.ts`, `resolve-classname-mode.ts` |
| shared | `protocol.ts` (`classNameMode` on index entries) |
| overlay | `SelectionMetadata.tsx` |
