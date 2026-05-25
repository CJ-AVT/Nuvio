# Publishing Nuvio packages (maintainers)

**Full MVP (`0.1.0`)** publishes to npm **`latest`** (no dist-tag). **Public alpha** used **`alpha`** at **`0.1.0-alpha.x`**.

## Prerequisites

1. **npm organization** `@nuvio` on [npmjs.com](https://www.npmjs.com/) with publish rights for your account.
2. One-time login: `npm login` (scope defaults to `@nuvio` when publishing scoped packages).
3. **Two-factor authentication (required to publish):** npm must have 2FA enabled in **“Authorization and writes”** mode (not “Authorization only”). See [Troubleshooting: E403 2FA](#troubleshooting-e403-2fa) below.
4. Clean tree: commit and tag as your release process requires; `pnpm publish` may refuse on uncommitted changes unless you opt out intentionally.

## Build and publish

From the **repository root**:

```bash
pnpm install
pnpm build
pnpm publish:alpha
```

The root **`publish:alpha`** script (see root `package.json`) runs a **recursive publish** on `packages/*` in dependency order. pnpm rewrites **`workspace:`** protocol dependencies in the tarballs to the published semver.

**First-time dist-tag:**

```bash
pnpm publish:alpha
```

npm will prompt for OTP if 2FA is enabled.

**Bump version** before each publish: edit `version` in each of:

- `packages/shared/package.json`
- `packages/ast-engine/package.json`
- `packages/vite-plugin/package.json`
- `packages/overlay/package.json`

Keep all four on the **same** semver line for this monorepo, or use [Changesets](https://github.com/changesets/changesets) later for automation.

## Publish Full MVP (stable / `latest`)

After [DOGFOOD.md](./DOGFOOD.md) and [FULL_MVP_DOD.md](./FULL_MVP_DOD.md) checks pass:

```bash
pnpm install
pnpm dogfood
pnpm publish:stable
```

`publish:stable` runs `pnpm -r publish` **without** `--tag alpha`, so consumers install with:

```bash
pnpm add -D @nuvio/vite-plugin @nuvio/overlay
```

Continue publishing **`alpha`**-only prereleases with `pnpm publish:alpha` if you need a parallel pre-release line (bump to `0.1.1-alpha.0`, etc.).

## Verify after publish

In a **temp directory** (not this monorepo), create a Vite + React + TS app, add Tailwind v3 (`tailwindcss`, `postcss`, `autoprefixer`, `init` config per [Tailwind + Vite](https://tailwindcss.com/docs/guides/vite)), then:

```bash
pnpm add -D @nuvio/vite-plugin@latest @nuvio/overlay@latest
```

Follow the root [README.md](../README.md) (consumer setup + Full MVP) to add `nuvio()` to `vite.config`, extend Tailwind **`content`** with `./node_modules/@nuvio/overlay/dist/**/*.js`, render `<NuvioDevShell />`, and add at least one `data-nuvio-id` host. Run `pnpm dev` and confirm:

- Dev channel **connected**, index **> 0 ids**
- **Validate → Apply** on text or Tailwind
- **Move down** on a sibling inside a `flex` / `grid` parent (optional smoke test)

## Repository URL in package.json

If the Git remote differs from `https://github.com/ehah/Nuvio`, update the `repository` field in each published `package.json` before tagging releases.

## First-time GitHub push

See [GITHUB_AND_RELEASE.md](./GITHUB_AND_RELEASE.md) for `git init`, remote, tag **`v0.1.0`**, and `pnpm publish:stable`.

## Troubleshooting: E403 2FA

If publish fails with:

```text
403 Forbidden - Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages.
```

**Fix (interactive publish):**

1. Open [npmjs.com](https://www.npmjs.com/) → avatar → **Account** → enable **Two-Factor Authentication**.
2. Choose **Authorization and writes** (required for `npm publish`; “Authorization only” is not enough).
3. Confirm you own or can publish to **`@nuvio`**: create the org at [npmjs.com/org/create](https://www.npmjs.com/org/create) if needed, or join an existing org with publish rights.
4. From the repo root, pass a one-time password from your authenticator app:

```bash
pnpm publish:stable --otp=123456
```

Replace `123456` with the current 6-digit code (valid ~30 seconds).

**Alternative (CI / token):** create a **Granular Access Token** on npm with **Publish** permission for the `@nuvio` packages and enable **bypass 2FA for publish**, then `npm login` with that token before `pnpm publish:stable`.
