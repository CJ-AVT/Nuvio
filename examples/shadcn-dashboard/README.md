# shadcn-dashboard — Nuvio 1.0 example

Minimal **shadcn-style** dashboard (`components/ui/*`) with nuvio ids on Card, Button, and table hosts.

## Run (monorepo)

```bash
pnpm install
pnpm --filter @nuvio/example-shadcn-dashboard dev
```

Open `http://localhost:5176` → **Edit on** → click **Revenue** card title or **Export** button → preview → apply.

```bash
node packages/cli/dist/cli-entry.js doctor --skip-dev-server --cwd examples/shadcn-dashboard
```

Developer details should show `Libraries: shadcn`.

## Walkthrough (5 minutes)

1. `pnpm dev` — confirm nuvio chip appears.
2. **Edit on** → click `dashboard.revenue.title` (card title).
3. Change text or padding → **Preview Changes** → **Apply to Code**.
4. Click **Export** (`dashboard.export.button`) — Button task menu should appear.
5. Optional: click an untagged `<p>` → **Make Editable** to add a new host.

## Notes

- Uses `cn()` on shadcn primitives — supported in nuvio 1.0 for common patterns.
- Radix portals / Dialog interiors may still need manual ids. See [docs/libraries/shadcn.md](../../docs/libraries/shadcn.md).
