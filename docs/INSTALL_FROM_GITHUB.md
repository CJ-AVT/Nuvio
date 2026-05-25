# Install Nuvio from GitHub (no npm required)

Use this while packages are not on [npmjs.com](https://www.npmjs.com/). Pin the release tag **`v0.1.0`** so installs stay reproducible.

**Repository:** [github.com/ehah/Nuvio](https://github.com/ehah/Nuvio)

## Requirements

- **Node.js** 20+
- **pnpm** 9+ (recommended) or npm 10+
- Host app: **Vite 5/6**, **React 18/19**, **Tailwind CSS 3.x**

## 1. Add dependencies (pnpm)

In your Vite + React app `package.json`:

```json
{
  "devDependencies": {
    "@nuvio/vite-plugin": "github:ehah/Nuvio#v0.1.0&path:/packages/vite-plugin",
    "@nuvio/overlay": "github:ehah/Nuvio#v0.1.0&path:/packages/overlay"
  },
  "pnpm": {
    "overrides": {
      "@nuvio/shared": "github:ehah/Nuvio#v0.1.0&path:/packages/shared",
      "@nuvio/ast-engine": "github:ehah/Nuvio#v0.1.0&path:/packages/ast-engine"
    }
  }
}
```

Then:

```bash
pnpm install
```

The `prepare` scripts in each package run **`pnpm build`** after install so `dist/` exists.

> **Why overrides?** Inside the monorepo, packages use `workspace:*`. When consumers install a subfolder from Git, pnpm needs explicit git URLs for `@nuvio/shared` and `@nuvio/ast-engine`.

## 2. Vite plugin

```ts
// vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nuvio } from "@nuvio/vite-plugin";

export default defineConfig({
  plugins: [react(), nuvio()],
  resolve: { dedupe: ["react", "react-dom"] },
});
```

## 3. Tailwind content

```js
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nuvio/overlay/dist/**/*.js",
  ],
};
```

## 4. Dev shell

```tsx
import { NuvioDevShell } from "@nuvio/overlay";

export default function App() {
  return (
    <>
      {/* your app */}
      <NuvioDevShell />
    </>
  );
}
```

## 5. Instrument JSX

Add unique **`data-nuvio-id="region.id"`** on elements you want to edit. Use a **string literal** `className="..."` on the same node.

Run **`pnpm dev`**, open localhost, click **Edit** on the Nuvio chip, select an element, **Validate** → **Apply**.

See [README.md](../README.md), [LIMITATIONS.md](./LIMITATIONS.md), [DEV_ONLY.md](./DEV_ONLY.md).

## Upgrade to a newer Git tag

Change `v0.1.0` to a newer tag in all five git URLs (two `devDependencies` + three `overrides`), then `pnpm install`.

## When npm is available

Prefer npm for simpler installs:

```bash
pnpm add -D @nuvio/vite-plugin @nuvio/overlay
```

No `pnpm.overrides` needed once packages are published to the registry.
