# npm publish guide (maintainers)

Single source of truth for shipping **`@nuvio/*`** from the **private** monorepo to [npmjs.com](https://www.npmjs.com/org/nuvio).

**Consumer install:**

```bash
pnpm add -D @nuvio/vite-plugin @nuvio/overlay
```

---

## Distribution model

```text
PRIVATE GitHub (ehah/Nuvio)              npm registry (@nuvio org)
────────────────────────────             ───────────────────────────
Full monorepo: PRD, implPlan, DOGFOOD,   Only what you run `pnpm publish` uploads
demo-app, packages/*/src                 Tarball per package: dist/ + README only
```

| Question | Answer |
|----------|--------|
| Does npm mirror GitHub? | **No.** Publishing reads your **local** built packages. |
| Must GitHub be public? | **No.** Private repo is fine. |
| What do users see on npm? | Built **`dist/`** + each package **`README.md`** (see `"files"` in `packages/*/package.json`). |
| What stays private? | `docs/PRD.md`, `implPlan`, `DOGFOOD`, `apps/demo-app`, `packages/*/src`, etc. |
| `repository` in package.json | Points at GitHub for metadata; private repo → link 404s for strangers (harmless). |

**Published packages (keep versions in sync):**

| Package | Role | Consumers install directly? |
|---------|------|----------------------------|
| `@nuvio/shared` | Wire protocol, types | No (dependency) |
| `@nuvio/ast-engine` | AST patch engine | No (dependency) |
| `@nuvio/vite-plugin` | Vite dev plugin | **Yes** |
| `@nuvio/overlay` | React dev overlay | **Yes** |

Root scripts (`package.json`):

- **`pnpm publish:stable`** — publish five packages to npm **`latest`** (`shared`, `ast-engine`, `vite-plugin`, `overlay`, `cli`; excludes `@nuvio/next`)
- **`pnpm publish:alpha`** — same, with dist-tag **`alpha`** (prereleases)

---

## One-time setup

### 1. npm organization `@nuvio`

1. [Create organization](https://www.npmjs.com/org/create) → name **`nuvio`** (scope **`@nuvio`**).
2. Confirm you are **owner** (e.g. `ehsan007`) under org → **Members**.
3. Free plan is enough for public scoped packages.

> If you created **`mapleminds`** earlier, ignore it for publishing — package names must match the org scope (`@nuvio/*` → **nuvio** org).

### 2. Two-factor authentication (required to publish)

1. [npmjs.com](https://www.npmjs.com/) → avatar → **Account** → **Two-Factor Authentication**.
2. Mode: **Authorization and writes** (not “Authorization only”).
3. Store recovery codes in a password manager — **never** commit `npm_recovery_codes.txt` (listed in `.gitignore`).

### 3. Log in on your machine

```bash
npm login
npm whoami
```

### 4. Publish access check

You must be able to publish to scope **`@nuvio`**. After first publish, packages appear under org **nuvio** → **Packages**.

---

## What npm uploads (audit before first publish)

Each publishable package has:

```json
"files": ["dist", "README.md"],
"publishConfig": { "access": "public" }
```

Inspect a tarball without uploading:

```bash
cd packages/vite-plugin
npm pack --dry-run
```

Expect only **`README.md`**, **`dist/*`**, and **`package.json`** — not `src/`, not monorepo docs.

`workspace:*` dependencies in `package.json` are rewritten to the published semver in tarballs automatically.

---

## First publish (`0.1.0`)

### Step 1 — Release gate

From repo root:

```bash
cd /path/to/Nuvio
pnpm install
pnpm dogfood
```

`dogfood` = build packages, typecheck, test, build demo app. Full manual checklist: [DOGFOOD.md](./DOGFOOD.md). Definition of done: [FULL_MVP_DOD.md](./FULL_MVP_DOD.md).

### Step 2 — Clean git working tree

`pnpm publish` refuses unclean trees by default (`ERR_PNPM_GIT_UNCLEAN`).

```bash
git status
```

Commit or stash everything you intend to keep. **Do not** commit `npm_recovery_codes.txt`.

Example:

```bash
git add -A
git commit -m "Prepare for npm publish 0.1.0"
git push origin main
```

### Step 3 — Confirm versions

All five must match (e.g. **`1.0.0`**):

- `packages/shared/package.json`
- `packages/ast-engine/package.json`
- `packages/vite-plugin/package.json`
- `packages/overlay/package.json`
- `packages/cli/package.json`

### Step 4 — Tag private repo (recommended)

```bash
git tag v0.1.0
git push origin v0.1.0
```

Skip if tag already exists on the release commit.

### Step 5 — Dry run

```bash
pnpm -r publish --filter "./packages/*" --access public --dry-run
```

Confirm five packages and dependency order: **shared → ast-engine → vite-plugin → overlay → cli**.

### Step 6 — Publish stable

Get a 6-digit OTP from your authenticator, then:

```bash
pnpm publish:stable --otp=123456
```

Replace `123456` with the live code (~30s validity).

If you must publish with uncommitted files (not recommended):

```bash
pnpm publish:stable --otp=123456 --no-git-checks
```

Wait until all four packages report success.

### Step 7 — Verify on npm

**Web:** [npmjs.com/org/nuvio](https://www.npmjs.com/org/nuvio) → **Packages**

**CLI:**

```bash
npm view @nuvio/vite-plugin version
npm view @nuvio/overlay version
```

### Step 8 — Smoke test (clean app)

Outside this monorepo:

```bash
cd /tmp
pnpm create vite nuvio-smoke --template react-ts
cd nuvio-smoke
pnpm add -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
pnpm add -D @nuvio/vite-plugin@0.1.0 @nuvio/overlay@0.1.0
```

Wire per root [README.md](../README.md):

- `nuvio()` in `vite.config.ts`
- Tailwind `content` includes `./node_modules/@nuvio/overlay/dist/**/*.js`
- `<NuvioDevShell />` in the app
- At least one `data-nuvio-id`

```bash
pnpm dev
```

Confirm: dev channel **connected**, **Validate → Apply** works. See [DOGFOOD.md](./DOGFOOD.md) § B.

### Step 9 — Update consumer-facing docs

- Root [README.md](../README.md) — install from npm as primary
- [CHANGELOG.md](../CHANGELOG.md) — release notes for the version

Optional: GitHub Release on **private** repo from tag `v0.1.0` (collaborators only).

---

## Every later release

Use this checklist for **`0.1.1`**, **`0.2.0`**, etc.

### 1. Develop on private `main`

Normal PRs/commits. Pushing to GitHub does **not** update npm.

### 2. Bump semver (all four packages)

Edit **`version`** in every publishable `packages/*/package.json` to the same value.

| Change type | Example bump |
|-------------|----------------|
| Bugfix | `0.1.0` → `0.1.1` |
| Feature | `0.1.1` → `0.2.0` |
| Breaking | `0.2.0` → `1.0.0` |

Update [CHANGELOG.md](../CHANGELOG.md) (move **[Unreleased]** into a dated section).

### 3. Release gate

```bash
pnpm install
pnpm dogfood
```

### 4. Commit, tag, push (private)

```bash
git add -A
git commit -m "Release v0.1.1"
git tag v0.1.1
git push origin main --tags
```

### 5. Publish

**Stable (default for users):**

```bash
pnpm publish:stable --otp=123456
```

**Alpha prerelease** (optional parallel line):

1. Bump to e.g. `0.2.0-alpha.0` in all four `package.json` files.
2. `pnpm publish:alpha --otp=123456`
3. Consumers pin: `pnpm add -D @nuvio/vite-plugin@alpha @nuvio/overlay@alpha`

You cannot republish the same version to npm. If a publish fails partway, bump patch and publish again.

### 6. Verify + dogfood

```bash
npm view @nuvio/vite-plugin version
```

Repeat [DOGFOOD.md](./DOGFOOD.md) § B with `@latest` or the new pin.

---

## Troubleshooting

### `ERR_PNPM_GIT_UNCLEAN`

Commit or stash changes, or add `--no-git-checks` (see Step 6 above).

### `403` — Two-factor authentication required

```text
403 Forbidden - Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages.
```

1. Enable 2FA → **Authorization and writes**.
2. `pnpm publish:stable --otp=XXXXXX`

**CI / automation:** [Granular Access Token](https://www.npmjs.com/settings/~tokens) with **Publish** on `@nuvio/*` and **bypass 2FA for publish**, then `npm login` with that token.

### `403` — no permission for `@nuvio/...`

Your user must be **owner** or **member with publish** on the **nuvio** org. Package scope must match org name.

### `You cannot publish over the previously published versions`

Version already exists on npm. Bump all four `package.json` versions and publish again.

### Wrong `repository` URL in package.json

Update `repository.url` in each `packages/*/package.json` if the Git remote changes (metadata only).

---

## Quick reference

| Task | Command |
|------|---------|
| Release gate | `pnpm dogfood` |
| Dry run | `pnpm -r publish --filter "./packages/*" --access public --dry-run` |
| Stable publish | `pnpm publish:stable --otp=XXXXXX` |
| Alpha publish | `pnpm publish:alpha --otp=XXXXXX` |
| Check version | `npm view @nuvio/vite-plugin version` |

**Related (not publish steps):** [DOGFOOD.md](./DOGFOOD.md), [FULL_MVP_DOD.md](./FULL_MVP_DOD.md), [DEV_ONLY.md](./DEV_ONLY.md), [LIMITATIONS.md](./LIMITATIONS.md), [COMPATIBILITY.md](./COMPATIBILITY.md).
