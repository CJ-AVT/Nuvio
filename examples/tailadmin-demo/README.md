# tailadmin-demo — Nuvio 1.0 example

Full **TailAdmin** dashboard dogfood lives in the monorepo at [`apps/tailadmin-dogfood`](../../apps/tailadmin-dogfood). This folder documents the 5-minute maintainer path — no duplicate TailAdmin tree.

## Run (monorepo)

```bash
pnpm install
pnpm dev:tailadmin
```

Open `http://localhost:5173` → **Edit on** → edit ecommerce metrics, charts, or tables.

## Verify

```bash
node packages/cli/dist/cli-entry.js doctor --skip-dev-server --cwd apps/tailadmin-dogfood
node packages/cli/dist/cli-entry.js scan --cwd apps/tailadmin-dogfood
node packages/cli/dist/cli-entry.js stats --cwd apps/tailadmin-dogfood
```

Developer details should show `Libraries: tailadmin`.

## Walkthrough (5 minutes)

1. `pnpm dev:tailadmin` — wait for predev package builds.
2. Open dashboard home → **Edit on**.
3. Click an instrumented metric card or chart title (see `data-nuvio-id` hosts from `nuvio scan`).
4. **Preview Changes** → **Apply to Code** — confirm disk write in `src/components/ecommerce/`.
5. Use **Make Editable** on an untagged native element to add a new host.

## External TailAdmin users

1. Use your existing TailAdmin Vite app.
2. `pnpm dlx @nuvio/cli@1.0.0 init --yes`
3. Add ids to ecommerce/dashboard hosts (or use Make Editable).

See [docs/libraries/tailadmin.md](../../docs/libraries/tailadmin.md).
