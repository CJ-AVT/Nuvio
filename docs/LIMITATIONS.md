# Known limitations

These boundaries exist so Nuvio can stay **source-correct** and **testable**. Unsupported patterns should **fail with a clear error**, not write silently.

Applies to **`0.1.0`** (Full MVP / `latest`) and **`0.1.0-alpha.x`** unless noted.

## `className` on the patched host

- **`className` must be a string literal** on the JSX element that carries `data-nuvio-id` (e.g. `className="p-4 text-sm"`).
- **Not supported yet:** `className={cn(...)}`, template literals, spreads, or variables. Support may land behind a flag in a later phase (`implPlan.md` Phase 5).

## Tailwind utilities

- Only utilities allowed by **`@nuvio/ast-engine`**’s whitelist are accepted. Unknown tokens are rejected at preview/apply time with a readable message.
- **`tailwind-merge`** resolves conflicts when merging; semantics follow that library.

## Host contract

- Editable regions must expose stable **`data-nuvio-id="..."`** attributes (or supported wrapper patterns documented in the PRD). Ids must be **unique** across the scanned project; duplicates surface at **index** time.

## Layout and structure (Full MVP)

- **Supported:** sibling **move up/down** when the host’s parent has **flex or grid** utilities in a **string-literal** `className`; **hide/show** via `hidden`; **duplicate** clones the host with a new `data-nuvio-id` (`*.copy`, `*.copy2`, …).
- **Not supported:** freeform drag-anywhere placement, moving elements to a different parent, or reorder when the parent is not flex/grid (fail-closed with a clear message).
- **Component tree:** flat **indexed elements** list only — no hierarchical AST tree rail.
- **Toolbar:** structure actions live in the **Editor** panel, not a floating toolbar on the canvas.

## Undo and preview

- **Validate** (`dryRun`) does not change disk; **Apply** writes.
- **Colors:** the Editor uses the **Tailwind v3 default palette** (utility classes such as `text-sky-500`). Arbitrary hex/RGB (`text-[#…]`, `bg-[#…]`) is not supported yet — use the nearest swatch or edit source by hand. **Undo last** is **session-scoped** on the dev server (in-memory snapshots), not a substitute for version control.
