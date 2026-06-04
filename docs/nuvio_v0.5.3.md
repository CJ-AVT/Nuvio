# Nuvio v0.5.3 — Launch-ready CLI line (npm)

**Document status:** **Shipped** — all five public `@nuvio/*` packages at **0.5.3** on npm (`latest`); git tag **`v0.5.3`**  
**Audience:** Maintainers preparing **public launch**; implementers need only this doc + companions below  
**Not a feature release:** no editor, patch engine, or protocol changes — completes the **0.5.1 onboarding arc**

---

## Table of contents

1. [What is v0.5.3?](#0-what-is-v053)
2. [Release lineage (0.5.0 → 0.5.3)](#1-release-lineage)
3. [Public promise](#2-public-promise)
4. [What shipped in each patch](#3-what-shipped-in-each-patch)
5. [npm packages & install](#4-npm-packages--install)
6. [Validation & dogfood](#5-validation--dogfood)
7. [Launch checklist](#6-launch-checklist)
8. [What we are not launching yet](#7-what-we-are-not-launching-yet)
9. [Companions](#8-companions)

---

# 0. What is v0.5.3?

**v0.5.3** is the **recommended npm line** for Nuvio’s vibe-coder onboarding story:

- **`@nuvio/cli`** — `nuvio init` wires a fresh Vite + React app in two terminal commands.
- **Overlay dev fix (0.5.2)** — `init` patches `main.tsx` + `vite.config` so **Edit** works on npm installs (no manual CSS / `optimizeDeps` steps).
- **Vite 8 peer (0.5.3)** — `@nuvio/vite-plugin` accepts **Vite 8** (current `create vite` templates) without pnpm peer warnings.

Everything else users care about in the editor — Simple Mode, task router (Card, Table, Button, Form, Nav, Chart, Section), Preview → Apply — comes from **v0.5.0 stable** and is unchanged in 0.5.2/0.5.3.

**One-line pitch:** *Install Nuvio on a Vite React app with two commands; edit the page title in the browser and apply it back to code.*

---

# 1. Release lineage

| Version | Theme | npm |
| ------- | ----- | --- |
| **0.5.0** | Vibe-coder task router + Simple Mode (editor) | Stable |
| **0.5.1** | `@nuvio/cli` + `nuvio init` (onboarding) | Shipped |
| **0.5.2** | CLI patches overlay CSS + `optimizeDeps` (Edit button fix) | Shipped |
| **0.5.3** | Vite **^8** peer + aligned publish; docs simplified | **Current `latest`** |

Engineering detail for 0.5.1 CLI: [`nuvio_v0.5.1.md`](nuvio_v0.5.1.md) (§7.1 overlay dev wiring describes the 0.5.2 fix).  
Editor / UX baseline: [`nuvio_v0.5.0.md`](nuvio_v0.5.0.md).

---

# 2. Public promise

```text
pnpm dlx @nuvio/cli@0.5.3 init --yes
pnpm dev
→ Nuvio chip → Edit on → click page.title → Preview Changes → Apply to Code
```

**User-facing guide:** [`nuvioUser.md`](nuvioUser.md) (~140 lines, CLI-first).  
**In-project after init:** `nuvio/START_HERE.md`, `nuvio/AGENT.md` (dashboard patterns).

**Critical UX trap (documented):** `pnpm create vite` → “Install and start now?” must be **No**, or dev runs before `init` and the page has no Nuvio chip until init is run.

---

# 3. What shipped in each patch

## 0.5.2 (fix — required for real npm consumers)

| Change | Why |
| ------ | --- |
| `import "@nuvio/overlay/style.css"` in `src/main.tsx` | Vite prebundle path; without it, overlay CSS 404s |
| `optimizeDeps.exclude: ["@nuvio/overlay"]` in `vite.config` | Keeps overlay out of broken prebundle |
| CLI `init` applies both idempotently | Zero manual [`nuvioUser.md`](nuvioUser.md) steps for npm path |

**0.5.1** on npm shipped without these; discovered in post-publish S8b. **Use 0.5.3** (or 0.5.2+) for new projects.

## 0.5.3 (patch — launch polish)

| Change | Why |
| ------ | --- |
| `@nuvio/vite-plugin` peer: `^5.4.0 \|\| ^6.0.0 \|\| ^8.0.0` | `create vite` ships Vite 8; removes install warning |
| All five packages bumped to **0.5.3** | Aligned `init` install pins |
| [`nuvioUser.md`](nuvioUser.md) simplified | Matches “two commands, not 400 lines” goal |
| `publish:stable` excludes `@nuvio/next` | Consumer publish is five packages only |

**CLI behavior delta (0.5.2 → 0.5.3):** skip `main.tsx` style import when `@nuvio/overlay` is `link:` / `file:` / `workspace:` (monorepo maintainer path only).

---

# 4. npm packages & install

**Published at `latest` (exclude `@nuvio/next`):**

| Package | Role |
| ------- | ---- |
| `@nuvio/shared` | Wire protocol / types |
| `@nuvio/ast-engine` | Patch engine |
| `@nuvio/vite-plugin` | Vite dev server + index |
| `@nuvio/overlay` | Dev UI (`NuvioDevShell`) |
| `@nuvio/cli` | `nuvio init` |

**Verify:**

```bash
npm view @nuvio/cli version          # 0.5.3
npm view @nuvio/vite-plugin version  # 0.5.3
```

**Maintainer republish:** `pnpm publish:stable --otp=XXXXXX` from repo root (see [`npmPublish.md`](npmPublish.md)).

**Consumer smoke (outside monorepo):**

```bash
cd /tmp
pnpm create vite nuvio-launch-test --template react-ts
# Install and start now? → No
cd nuvio-launch-test && pnpm install
pnpm dlx @nuvio/cli@0.5.3 init --yes
pnpm dev
```

---

# 5. Validation & dogfood

| Gate | Status |
| ---- | ------ |
| `pnpm dogfood` | Green (pre-0.5.3 publish) |
| `pnpm test:cli` + `pnpm v051:acceptance` | Green |
| S8b pre-publish (`/tmp/nuvio-s8b-test`, linked packages) | Signed 2026-06-03 — [`DOGFOOD.md`](DOGFOOD.md) |
| S8b post-publish (`/tmp/nuvio-smoke-052`, `dlx @0.5.2`) | Signed 2026-06-03 |
| In-repo check (`my-check`, `dlx @0.5.3`) | Pass — chip, Edit, Section Title (maintainer; prefer `/tmp` for pure consumer) |

**Recommend before broad launch:** one more **/tmp-only** run with 0.5.3 + friend test using only `nuvioUser.md` + `nuvio/START_HERE.md`.

---

# 6. Launch checklist

Use this when moving from “shipped on npm” to “launching Nuvio” publicly.

## 6.1 Repo & docs (pre-announce)

- [ ] [`README.md`](../README.md) — lead with `pnpm dlx @nuvio/cli@0.5.3 init --yes`; update stale `0.3.0-alpha` / manual-only install blocks
- [x] [`nuvioUser.md`](nuvioUser.md) — CLI-first, 0.5.3
- [x] [`CHANGELOG.md`](../CHANGELOG.md) — 0.5.2 + 0.5.3 entries
- [x] [`COMPATIBILITY.md`](COMPATIBILITY.md) — Vite 8 noted
- [ ] [`FULL_MVP_DOD.md`](FULL_MVP_DOD.md) — mark `publish:stable` done for 0.5.3
- [ ] [`nuvio_v0.5.1.md`](nuvio_v0.5.1.md) header — point “current npm” to **0.5.3** (spec remains historical reference)
- [ ] Remove or gitignore local smoke apps (`my-check/`, `/tmp` tests) from repo

## 6.2 npm & GitHub

- [x] `pnpm publish:stable` — five packages @ **0.5.3**
- [x] Git tag **`v0.5.3`** pushed
- [ ] GitHub Release notes for `v0.5.3` (copy from CHANGELOG; link `nuvioUser.md`)
- [ ] npm org page / package READMEs show Quick Start (optional polish)

## 6.3 Proof assets (launch week)

- [ ] 30–60s screen recording: `create vite` (No auto-start) → `init --yes` → Edit → Apply on `page.title`
- [ ] 2–3 screenshots (chip, editor, applied title) — can reuse dogfood captures
- [ ] One honest limitation line: “more UI needs `data-nuvio-id` — see `nuvio/AGENT.md`”

## 6.4 Distribution (from [`nuvio_v0.5.1.md`](nuvio_v0.5.1.md) §21, updated)

| Channel | Message |
| ------- | ------- |
| GitHub Release | `v0.5.3` — two commands, Vite 8, Edit works out of the box |
| Reddit (r/reactjs, r/vite) | Short demo + link to `nuvioUser.md` |
| Show HN | Demo-first; no “zero-setup full dashboard” claim |
| X / LinkedIn | Same clip; `@nuvio/cli@0.5.3` |

**Do not claim:** full TailAdmin instrumentation, Next.js init, or click-to-tag — all deferred (§7).

## 6.5 Post-launch

- [ ] Track install issues (peer deps, `create vite` trap, Safari)
- [ ] Triage → patch **0.5.4** if needed (cannot republish same version)
- [ ] Plan **v0.6** (Next init, `nuvio doctor`, click-to-tag per deferrals table)

---

# 7. What we are not launching yet

Unchanged from 0.5.1 deferrals:

| Item | Target |
| ---- | ------ |
| Next.js `nuvio init` | v0.6+ |
| `nuvio doctor` | v0.6+ |
| Click-to-tag in overlay | v0.6+ |
| Auto-instrument full dashboards | Agent + `nuvio/AGENT.md`, not CLI |
| `@nuvio/next` on npm `latest` | Experimental; monorepo only |
| Production / hosted Nuvio | Dev-only; see [`DEV_ONLY.md`](DEV_ONLY.md) |

---

# 8. Companions

| Doc | Role |
| --- | ---- |
| [`nuvioUser.md`](nuvioUser.md) | **Public** — copy-paste Quick Start |
| [`nuvio_v0.5.1.md`](nuvio_v0.5.1.md) | **Engineering** — CLI spec + §7.1 wiring |
| [`nuvio_v0.5.0.md`](nuvio_v0.5.0.md) | **Engineering** — editor / task router |
| [`DOGFOOD.md`](DOGFOOD.md) | S8b sign-off |
| [`npmPublish.md`](npmPublish.md) | Maintainer publish |
| [`LIMITATIONS.md`](LIMITATIONS.md) | Honest limits for launch copy |

---

**Summary:** **v0.5.3** is the version to **market and install**. It completes onboarding started in 0.5.1, fixes real-user **Edit** wiring from 0.5.2, and matches today’s **Vite 8** templates. Next step is **launch execution** (§6), not more patch features unless smoke tests find gaps.
