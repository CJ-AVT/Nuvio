# Dogfood checklist

Run before tagging a new **`@nuvio/*`** release on npm.

---

## v0.3.0-alpha.0 (Phase B)

Engineering spec: [nuvio_v0.3.0.md](./nuvio_v0.3.0.md) §9–12.

### A. Monorepo gate

From repo root:

```bash
pnpm install
pnpm dogfood
pnpm --filter @nuvio/tailadmin-dogfood build
```

### B. TailAdmin acceptance (manual)

Run `pnpm dev:tailadmin`, open dashboard, then verify:

1. Select `metric.orders.card` and edit:
   - `metric.orders.label` text
   - `metric.orders.value` text
2. Apply card/container style changes (background/border/radius) and validate source patch.
3. Switch device preset to Tablet/Mobile and apply padding changes at active breakpoint (`md:*`/`sm:*` context).
4. Validate → Apply → Undo cycle remains stable.

### C. Record results (v0.3 alpha)

| Check | Pass? | Notes |
| ----- | ----- | ----- |
| Hierarchy target picker avoids container dead-end | | |
| Style target routing explicit (host vs child) | | |
| Tailwind depth controls apply safely | | |
| Breakpoint-aware patch modifies only active BP tokens | | |
| `NUVIO=0` disables plugin startup in CI/dev | | |
| `pnpm dogfood` green | | |
| `tailadmin-dogfood` production build green | | |

---

## v0.2.0-alpha.0 (Phase A)

Engineering spec: [nuvio_v0.2.0.md](./nuvio_v0.2.0.md) §18–20.

### A. Monorepo build gate

From repo root:

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
pnpm dogfood
```

### B. Fixture smoke (contributors)

Run each app; confirm chip **connected**, overlay **styled** (no DevTools CSS hacks), **Validate → Apply → Undo**.

| Fixture | Command | Minimum checks |
| ------- | ------- | ---------------- |
| **demo-app** (TW v3) | `pnpm dev` | ≥ 7 ids; text + class edit; no `@nuvio/overlay` in `tailwind.config.js` `content` |
| **tailwind-v4-test** | `pnpm --filter @nuvio/tailwind-v4-test dev` | ≥ 14 ids; hero text + card class edit; self-contained overlay |
| **tailadmin-dogfood** | `pnpm dev:tailadmin` | ≥ 10 ids on dashboard; header/card/chart/table select; dark mode; resize + devtools docked |

TailAdmin manual acceptance: [nuvio_v0.2.0.md §13.3](./nuvio_v0.2.0.md).

### C. Clean consumer install (maintainer, pre-publish)

In an empty directory (after **`0.2.0-alpha.0`** is on npm **`alpha`**):

```bash
pnpm create vite nuvio-dogfood --template react-ts
cd nuvio-dogfood
pnpm install
pnpm add -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
pnpm add -D @nuvio/vite-plugin@alpha @nuvio/overlay@alpha
```

Wire per [nuvioUser.md](./nuvioUser.md) (v0.2 — **no** overlay Tailwind `content` line):

- `nuvio()` in `vite.config.ts`
- `<NuvioDevShell />` in `App.tsx`
- At least two elements with `data-nuvio-id` and string-literal `className`

```bash
pnpm dev
```

Confirm **Validate → Apply** and **Undo last**.

### D. Record results (v0.2 alpha)

| Check | Pass? | Notes |
| ----- | ----- | ----- |
| Overlay styled without host TW content | | |
| Chip visible (v3 + v4 + TailAdmin) | | |
| Index ids > 0 | | |
| Diagnostics show versions / risk | | |
| Duplicate id fails at index | | |
| Non-literal className fails clearly | | |
| Validate → Apply (v3) | | |
| Validate → Apply (v4) | | |
| Undo after apply | | |
| TailAdmin text + safe class edit | | |
| Published `@alpha` install | | |

File issues with versions per [COMPATIBILITY.md](./COMPATIBILITY.md).

### Troubleshooting

- **Dev channel `error`**, Validate/Apply disabled: restart `pnpm dev` from repo root, hard-refresh.
- **Clipped / off-screen editor:** use **Reset position** on chip or editor (v0.2+).
- **0 ids:** add `data-nuvio-id` in scanned `.tsx` / `.jsx` under `src/`.

---

## v0.1.0 Full MVP (`latest`)

### Monorepo smoke

```bash
pnpm install
pnpm dogfood
pnpm dev
```

Manual checks on http://localhost:5173:

1. **Edit on** — chip shows dev channel **connected**, index **≥ 7 ids**
2. **Select** — hero, lead, feature cards, pricing CTA each resolve to a source path
3. **Style edit** — change text or a Tailwind control → **Validate** → **Apply** → HMR; **Undo last**
4. **Move** — feature card **Move down/up**; **Undo last**
5. **Hide / Show**, **Duplicate**
6. **Chrome** — drag panels; reload — positions restore

### Clean consumer install (0.1.x)

Requires Tailwind `content` for overlay — see [README](../README.md) §0.1.0.

### Record results

| Check | Pass? | Notes |
| ----- | ----- | ----- |
| Index ids > 0 | | |
| Validate change summary | | |
| Apply writes file | | |
| Undo restores | | |
| Move sibling | | |
| Published `@latest` install | | |
