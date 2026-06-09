# vite-basic — Nuvio 1.0 example

Minimal **Vite + React + Tailwind** app wired for nuvio. Five-minute path from clone to first apply.

## From this monorepo (maintainers)

```bash
# repo root
pnpm install
pnpm --filter @nuvio/example-vite-basic dev
```

Open `http://localhost:5175` → nuvio chip → **Edit on** → click the title → **Preview Changes** → **Apply to Code**.

Verify wiring:

```bash
node packages/cli/dist/cli-entry.js doctor --skip-dev-server --cwd examples/vite-basic
node packages/cli/dist/cli-entry.js scan --cwd examples/vite-basic
```

## From zero (npm users)

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm install
pnpm add -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
# add @tailwind directives to src/index.css
pnpm dlx @nuvio/cli init --yes
pnpm dev
```

Turn **Edit on** → click the starter heading (`page.title`) or any untagged element → **Make Editable** → edit → apply.

## What this example shows

- `nuvio init` wiring (Vite plugin, overlay shell, starter id)
- Click-to-tag on untagged elements (no `AGENT.md` required for the first edit)
- `nuvio doctor` / `scan` / `stats` on a small project
