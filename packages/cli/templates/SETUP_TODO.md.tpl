<!-- rte-cli-template: 1 -->
# rte setup — manual steps

@rte/cli could not safely patch: {{FAILED_STEPS}}

## Vite (if needed)

Add to `vite.config.ts`:

```ts
import { rte } from "@rte/vite-plugin";
// inside defineConfig:
plugins: [react(), rte()],
resolve: { dedupe: ["react", "react-dom"] },
```

## App shell (if needed)

```tsx
import { RteDevShell } from "@rte/overlay";
// inside root component return:
<RteDevShell />
```

## Starter id (if needed)

Add to one visible heading: `data-rte-id="page.title"`
