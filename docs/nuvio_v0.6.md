# nuvio v0.6 — Click To Tag (internal milestone)

**Status:** Implemented in repo — **not** a separate npm release  
**Ships in:** `@nuvio/*` **1.0.0** (see [v1.0.md](v1.0.md) release policy)  
**Roadmap:** [v1.0.md](v1.0.md) § v0.6

---

## Why this release exists

After `nuvio init`, only manually tagged elements (`data-nuvio-id`) were editable. Most AI-generated JSX has no ids — high friction for vibe coders.

v0.6 adds **Click To Tag**: click an untagged element → **Make Editable** → nuvio inserts `data-nuvio-id` in source → element becomes editable.

---

## What changed

| Area | Change |
| ---- | ------ |
| **Vite plugin** | Dev transform stamps `data-nuvio-loc` on untagged JSX; `tagElement` WebSocket RPC |
| **AST engine** | `insertDataNuvioIdAtLocation`, `suggestNuvioId`, id validation |
| **Overlay** | Untagged click detection, Make Editable panel, auto-suggested ids |
| **Protocol** | v8 — `tagElement` / `tagElementAck` |
| **Telemetry** | `tag_element_started`, `tag_element_completed`, `tag_element_failed` |

**Unchanged:** init flow, patch engine ops, Simple Mode editor, CLI commands (no new CLI in 0.6).

---

## User flow

```text
Edit on
  → click untagged element (outlined on hover)
  → Make Editable panel
  → confirm or edit suggested id (e.g. page.title)
  → nuvio writes data-nuvio-id to source
  → dev server reindexes
  → element selected → edit → Preview → Apply
```

---

## Telemetry (overlay)

| Event | When |
| ----- | ---- |
| `tag_element_started` | User clicks Make Editable |
| `tag_element_completed` | Id inserted + reindex ok |
| `tag_element_failed` | Safe `reason` enum only |

Spec: [PostHog_telemetry.md](PostHog_telemetry.md)

---

## Privacy

Same as v0.5.x — no source code, paths, project names, or element text in telemetry payloads.

---

## How to verify

```bash
pnpm build && pnpm dev
# or: pnpm dev:tailadmin
```

1. Turn **Edit** on  
2. Click a heading or button **without** `data-nuvio-id`  
3. **Make Editable** → confirm id  
4. After HMR, edit text or style → **Preview Changes** → **Apply to Code**

**Restart dev server** after upgrading from 0.5.x so the jsx-loc transform applies to all modules.

```bash
pnpm test
```

---

## Known limitations (v0.6)

- Requires dev-time `data-nuvio-loc` transform (automatic when `nuvio()` plugin enabled)
- Component wrappers must render to DOM nodes with loc attributes (native elements work best)
- Map loops / dynamic member components may fail closed with a clear error
- Suggested ids are heuristic (`page.title`, `page.button`) — user can edit before confirm

---

## Milestone checklist

- [x] `pnpm build` passes
- [x] `pnpm test` passes
- [ ] Manual dogfood: demo-app + TailAdmin click-to-tag → apply
- [ ] Included in v1.0.0 CHANGELOG + acceptance gate (no separate npm publish)

---

## Files changed

| Package | Key files |
| ------- | --------- |
| ast-engine | `insert-nuvio-id.ts`, `nuvio-id.ts` |
| shared | `protocol.ts` (v8) |
| vite-plugin | `jsx-loc-transform.ts`, `handle-tag-element.ts`, `index.ts` |
| overlay | `InteractionLayer.tsx`, `MakeEditablePanel.tsx`, `nuvio-loc-dom.ts`, `NuvioDevShell.tsx`, `telemetry.ts` |
