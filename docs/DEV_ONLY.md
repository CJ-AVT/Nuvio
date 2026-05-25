# Nuvio is dev-only (not shipped with your app)

Nuvio is a **local development tool**. It must not run in production builds or add runtime weight to deployed sites.

## What stays out of production automatically

| Piece | Behavior |
| ----- | -------- |
| **`@nuvio/vite-plugin`** | Registered with Vite `apply: "serve"` — WebSocket, index, and patch server run **only during `vite dev`**, not `vite build`. |
| **`<NuvioDevShell />`** | The overlay export returns **`null` when `import.meta.env.DEV` is false**, so production bundles do not mount the Editor or chip. |

## What you should do in your repo

1. **Install as devDependencies** (never `dependencies`):

   ```bash
   pnpm add -D @nuvio/vite-plugin @nuvio/overlay
   ```

2. **Keep `<NuvioDevShell />` in app source** (e.g. `App.tsx`) — that is fine. Production builds tree-shake the dev shell when `import.meta.env.DEV` is false. You do **not** need a separate gitignored file.

3. **Do not commit secrets** — Nuvio has no API keys; only normal source edits under your project.

4. **`data-nuvio-id` attributes** — these **are** part of your app source if you add them for editing. They are inert at runtime (no Nuvio code in prod). Remove them later if you want zero trace in markup, or keep them for future dev sessions.

5. **Tailwind `content` entry** for `@nuvio/overlay` — safe to keep; it only affects CSS class generation, not JS in production.

## Git / deploy checklist

- CI **`vite build`** / deploy pipeline: Nuvio plugin does not attach to production builds.
- npm/pnpm **production install** (`--prod` / `NODE_ENV=production`): devDependencies (including Nuvio) are not installed on the server.
- Optional: run `pnpm build` locally and confirm bundle inspect shows no overlay UI (or only dead code eliminated).

## If you want zero Nuvio in `App.tsx`

Use a conditional import (only if you prefer not to see the component in source):

```tsx
import { lazy, Suspense, type ReactElement } from "react";

const NuvioDevShell = import.meta.env.DEV
  ? lazy(() =>
      import("@nuvio/overlay").then((m) => ({ default: () => <m.NuvioDevShell /> })),
    )
  : () => null;

export default function App(): ReactElement {
  return (
    <>
      {/* your app */}
      {import.meta.env.DEV ? (
        <Suspense fallback={null}>
          <NuvioDevShell />
        </Suspense>
      ) : null}
    </>
  );
}
```

The default `<NuvioDevShell />` export already no-ops in production; this pattern is optional.
