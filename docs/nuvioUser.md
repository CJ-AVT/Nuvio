# Nuvio — Simple setup guide

**For vibe-coders:** edit your app in the browser while it runs locally. Click text, tweak styles, save back to your code.

**On npm:** [`@nuvio/cli@0.5.3`](https://www.npmjs.com/package/@nuvio/cli) (installs matching `@nuvio/vite-plugin` + `@nuvio/overlay`). Two commands below — no Tailwind `content` hack for the overlay.

---

## Quick Start

In your **Vite + React** project folder (`package.json` + `vite.config.ts`):

```bash
pnpm dlx @nuvio/cli@0.5.3 init --yes
pnpm dev
```

Open the localhost URL → Nuvio chip → **Edit** on → click the page title (`page.title`) → **Preview Changes** → **Apply to Code**.

- `--yes` skips the confirm prompt. Without it, the CLI asks **Proceed? [y/N]** first.
- Run init in your **app folder**, not the Nuvio monorepo.
- Tailwind is recommended for class edits; init warns but still runs if Tailwind is missing.
- More help in your project after init: `nuvio/START_HERE.md`.

**What init does (you don’t do this by hand):** installs `@nuvio/vite-plugin` + `@nuvio/overlay` at **0.5.3**, wires `vite.config`, mounts `NuvioDevShell` in `App.tsx`, adds overlay CSS in `main.tsx`, sets `data-nuvio-id="page.title"` on the first heading, creates `nuvio/`. Safe to run again. Does **not** start `pnpm dev` for you.

---

## New project from zero

When `pnpm create vite` asks **“Install and start now?”** → **No** (otherwise dev runs before init and you see no Nuvio chip).

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm install
pnpm add -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

Add to `src/index.css` if needed:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Then Quick Start (`init --yes` + `pnpm dev`).

---

## After setup — how editing works

1. `pnpm dev` — Nuvio only runs in local dev, not production.
2. Chip → **Edit** on → click something with a `data-nuvio-id`.
3. Change text or styles in the panel (tasks: Heading, Card, Table, Button, Form, Nav, etc.).
4. **Preview Changes** → **Apply to Code** — source files update. **Undo last** if needed.

**Simple Mode:** plain-language screens; **Advanced** and **Developer details** are optional.

### Mark more UI (when you outgrow the starter title)

Put a **unique** id on each element you want to click (string literal, not dynamic):

```tsx
<h1 data-nuvio-id="home.title" className="text-4xl font-bold">Welcome</h1>
```

**Rules:** unique names (`home.title`, `nav.dashboard`), `className` as a normal quoted string if you edit classes.

**Dashboards (cards, tables, buttons, forms):** ask your AI agent to read `nuvio/AGENT.md` in your project — patterns are there so this guide stays short.

---

## Manual setup (no CLI)

```bash
pnpm add -D @nuvio/vite-plugin@0.5.3 @nuvio/overlay@0.5.3
```

**`vite.config.ts`** — add `nuvio()` and exclude overlay from prebundle:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nuvio } from "@nuvio/vite-plugin";

export default defineConfig({
  plugins: [react(), nuvio()],
  optimizeDeps: { exclude: ["@nuvio/overlay"] },
});
```

**`src/main.tsx`:**

```ts
import "@nuvio/overlay/style.css";
```

**`src/App.tsx`:**

```tsx
import { NuvioDevShell } from "@nuvio/overlay";
// …inside return: <NuvioDevShell />
```

Add `data-nuvio-id` on editable elements, then `pnpm dev`.

---

## Something wrong?

| Problem | Fix |
| ------- | --- |
| **No Nuvio chip** | `create vite` started dev before init → **Ctrl+C**, `pnpm dlx @nuvio/cli@0.5.3 init --yes`, `pnpm dev`. Init must run in the app folder. |
| **Edit dead / no styles** | `pnpm dlx @nuvio/cli@0.5.3 init --yes`, then `rm -rf node_modules/.vite`, `pnpm dev`. |
| **0 ids / nothing clickable** | Add `data-nuvio-id` in `src/**/*.tsx`, save, restart dev. |
| **Apply greyed out** | Edit on → click an id’d element; `className` must be a string literal; fix duplicate ids. |
| **Panel clipped** | **Reset position** on chip/editor, hard-refresh, restart dev. |
| **Install failed** | `node -v` ≥ 20; run from folder with `package.json`. |

---

## Quick reference

| I want to… | Do this |
| ---------- | ------- |
| Wire a project | `pnpm dlx @nuvio/cli@0.5.3 init --yes` then `pnpm dev` |
| First edit | Edit on → click title → Preview → Apply |
| More editable UI | `data-nuvio-id="unique.name"` + `nuvio/AGENT.md` for dashboards |
| Undo | **Undo last** on the chip |

---

## Telemetry

Nuvio collects anonymous usage metrics to improve onboarding and reliability. No source code, file contents, file paths, project names, emails, or personal data are sent.

Disable anytime with:

```bash
NUVIO_TELEMETRY=0
```

In the browser overlay: `localStorage.setItem("nuvio.telemetry", "0")` (then refresh). Details: [PostHog_telemetry.md](./PostHog_telemetry.md).

---

## Optional links

- Release summary (maintainers / launch): [nuvio_v0.5.3.md](./nuvio_v0.5.3.md)
- Telemetry spec: [PostHog_telemetry.md](./PostHog_telemetry.md)
- Limits: [LIMITATIONS.md](./LIMITATIONS.md)
- Versions (Vite 5/6/8): [COMPATIBILITY.md](./COMPATIBILITY.md)
- Maintainer demo app / dogfood: [DOGFOOD.md](./DOGFOOD.md)
