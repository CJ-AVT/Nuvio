# GitHub and npm release (maintainers)

One-time setup to open-source the monorepo and ship **`@nuvio/*`** packages to users.

## 1. Create the GitHub repository

1. On GitHub, create a new repository (e.g. **`MapleMinds/Nuvio`**).
2. Do **not** add a README/license from the template (this repo already has them).
3. Copy the remote URL (HTTPS or SSH).

From your machine, in this directory:

```bash
git init
git add -A
git commit -m "Initial release: Nuvio 0.1.0 dev overlay for React + Vite + Tailwind"
git branch -M main
git remote add origin https://github.com/MapleMinds/Nuvio.git
git push -u origin main
git tag v0.1.0
git push origin v0.1.0
```

Replace the remote URL if your org/user or repo name differs. Update `repository` fields in each `packages/*/package.json` to match.

## 2. Verify before publishing

```bash
pnpm install
pnpm dogfood
```

CI runs the same gates via [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## 3. Publish to npm (`latest`)

Requirements:

- npm account with publish access to the **`@nuvio`** scope (create the org on [npmjs.com](https://www.npmjs.com/) if needed).
- Logged in: `npm login`

```bash
pnpm publish:stable
```

This publishes (in order, with `workspace:` rewritten in tarballs):

| Package | Install |
| ------- | ------- |
| `@nuvio/shared` | (transitive) |
| `@nuvio/ast-engine` | (transitive) |
| `@nuvio/vite-plugin` | `pnpm add -D @nuvio/vite-plugin` |
| `@nuvio/overlay` | `pnpm add -D @nuvio/overlay` |

Consumers follow the root [README.md](../README.md) and [DEV_ONLY.md](./DEV_ONLY.md).

## 4. Post-release checks

- GitHub: README renders, tag **`v0.1.0`** exists.
- npm: `npm view @nuvio/vite-plugin version` → `0.1.0`.
- Smoke: [DOGFOOD.md](./DOGFOOD.md) § B in a clean Vite app with `@latest`.

## 5. Optional: GitHub Release notes

Create a release from tag **`v0.1.0`** summarizing:

- Visual edit overlay (Validate → Apply → Undo)
- Tailwind-backed style controls + structure tools
- Dev-only (`vite dev` + `import.meta.env.DEV`)
