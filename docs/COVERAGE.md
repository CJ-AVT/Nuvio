# Vite + Tailwind coverage (v1.0.0)

**Current stable line:** `@nuvio/*` **1.0.0** — maximum validated coverage for **React + Vite + Tailwind** local dev editing.

This is what nuvio **supports today**, what is **experimental**, and what is **explicitly out of scope**.

---

## Stack matrix

| Layer | Supported in 1.0.0 | Notes |
| ----- | ------------------ | ----- |
| **Bundler** | Vite **5.4+**, **6.x**, **8.x** | `create vite` react-ts templates |
| **Framework** | React **18.3+**, **19.x** | Dev-only overlay |
| **Tailwind** | **3.x** and **4.x** | Utility whitelist + `tailwind-merge` |
| **Node** | **20+** | CLI + dev tooling |
| **Next.js** | Experimental (`@nuvio/next`) | Not published at 1.0.0 |

---

## Tailwind `className` modes (patch targets)

| Mode | Example | Apply styles? |
| ---- | ------- | ------------- |
| **literal-only** | `className="p-4 rounded"` | Yes |
| **cn-basic** | `className={cn("p-4", "rounded")}` | Yes |
| **cn-conditional** | `className={cn("p-4", active && "bg-sky-500")}` | Yes |
| **classnames-static** | `className={classnames("p-4", { hidden: !show })}` | Yes (static keys) |
| **Unsupported** | template literals, `cva()`, arbitrary `text-[#fff]` | Fail-closed with message |

Per-host mode is detected at index time and shown in **Developer details**.

---

## Component libraries

| Library | Detection | Editing path | Example |
| ------- | --------- | ------------ | ------- |
| **shadcn/ui** | `components/ui/*` | Card/Button/Table routing + `cn()` hosts | [examples/shadcn-dashboard](../examples/shadcn-dashboard/) |
| **TailAdmin** | layout/ecommerce paths | Dogfood-validated dashboard hosts | [apps/tailadmin-dogfood](../apps/tailadmin-dogfood/) |
| **DaisyUI** | `daisyui` in package.json | Native elements + manual ids / Make Editable | [docs/libraries/daisyui.md](libraries/daisyui.md) |
| **Plain Vite** | default | init + click-to-tag | [examples/vite-basic](../examples/vite-basic/) |

Guides: [shadcn](libraries/shadcn.md) · [TailAdmin](libraries/tailadmin.md) · [DaisyUI](libraries/daisyui.md)

---

## Onboarding & tooling (1.0.0)

**Install (always latest):** `pnpm dlx @nuvio/cli init --yes` — no `@version` pin in user docs.

| Command | Purpose |
| ------- | ------- |
| `nuvio init` | Install, wire Vite, mount overlay, starter `page.title` |
| `nuvio doctor` | Pass/fail setup checklist |
| `nuvio scan` | List indexed `data-nuvio-id` hosts |
| `nuvio stats` | Project summary (`--json` for scripts) |

**Click-to-tag:** untagged elements → **Make Editable** → id inserted in source (no `AGENT.md` required for first edit).

---

## Validated example apps

```bash
pnpm --filter @nuvio/example-vite-basic dev        # :5175
pnpm --filter @nuvio/example-shadcn-dashboard dev  # :5176
pnpm dev:tailadmin                                 # :5173
pnpm v10:acceptance                                # doctor + stats gate
```

---

## Out of scope (v1.0)

| Non-goal | Reason |
| -------- | ------ |
| Vue, Svelte, Angular | React + Vite focus |
| Production / hosted editing | Dev-only by design |
| `node_modules` patching | Source in your app only |
| Full DaisyUI semantic hosts | Detection only; example app deferred |

Honest boundaries: [LIMITATIONS.md](LIMITATIONS.md)
