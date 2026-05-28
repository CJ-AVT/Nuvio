# Nuvio implementation lock

Completed v0.3.0-alpha work is **locked** so Cursor agents do not change it accidentally while you work on new tasks.

## What is locked

See [`.nuvio/implementation-lock.json`](../.nuvio/implementation-lock.json) for the canonical list. Current scopes:

| Scope ID | Paths |
| -------- | ----- |
| `overlay-v0.3` | `packages/overlay/**` |
| `shared-v0.3` | `packages/shared/**` |
| `vite-plugin-v0.3` | `packages/vite-plugin/**` |
| `ast-engine-v0.3` | `packages/ast-engine/**` |
| `demo-app` | `apps/demo-app/**` |
| `tailwind-v4-test` | `apps/tailwind-v4-test/**` |
| `tailadmin-dogfood` | `apps/tailadmin-dogfood/**` |

Agents may still **read** locked files for context. They must not **edit** them unless you unlock.

## How to unlock (you → agent)

Say one of these **in the same message** as the change request:

- **`unlock implementation lock`** or **`unlock locked code`** — allow edits anywhere in the manifest for that task.
- **`unlock: overlay-v0.3`** — allow edits only for that scope (e.g. `unlock: vite-plugin-v0.3`).

Without an unlock phrase, agents should refuse edits to locked paths and propose changes in chat or in **unlocked** files only.

## Lock new work

After you finish a new feature and want it protected, add a scope to `.nuvio/implementation-lock.json` and mention it in your commit/PR notes.

## Cursor rule

Always-on agent guidance lives in [`.cursor/rules/implementation-lock.mdc`](../.cursor/rules/implementation-lock.mdc).
