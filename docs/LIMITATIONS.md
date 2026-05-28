# Known limitations

These boundaries exist so Nuvio can stay **source-correct** and **testable**. Unsupported patterns should **fail with a clear error**, not write silently.

Applies to **`0.2.0-alpha`**, **`0.1.0`** (Full MVP / `latest`), and **`0.1.0-alpha.x`** unless noted.

## `className` on the patched host

- **`className` must be a string literal** on the JSX element that carries `data-nuvio-id` (e.g. `className="p-4 text-sm"`).
- **Not supported yet:** `className={cn(...)}`, template literals, spreads, or variables. Support may land behind a flag in a later phase (`implPlan.md` Phase 5).

## Tailwind utilities

- Only utilities allowed by **`@nuvio/ast-engine`**’s whitelist are accepted. Unknown tokens are rejected at preview/apply time with a readable message.
- **`tailwind-merge`** resolves conflicts when merging; semantics follow that library.

## Host contract

- Editable regions must expose stable **`data-nuvio-id="..."`** attributes (or supported wrapper patterns documented in the PRD). Ids must be **unique** across the scanned project; duplicates surface at **index** time.

## Layout and structure (`0.3.0` policy)

- **Supported:** sibling **move up/down** when the host’s parent has **flex or grid** utilities in a **string-literal** `className`; **hide/show** via `hidden`.
- **Deferred from public UI (v0.4+):** duplicate/create/insert JSX nodes.
- **Not supported:** freeform drag-anywhere placement, moving elements to a different parent, or reorder when the parent is not flex/grid (fail-closed with a clear message).
- **Component tree:** flat **indexed elements** list only — no hierarchical AST tree rail.
- **Toolbar:** structure actions live in the **Editor** panel, not a floating toolbar on the canvas.

## Hierarchy-first targeting (`0.3.0`)

- Select a top-level host (`data-nuvio-id`) first.
- Then choose explicit **Text target** and **Style target** inside that host.
- Nuvio does not silently redirect style patches between host/child.
- Duplicate ids are **blocked** and must be renamed before Apply.

## Top unsupported patterns (with workarounds)

1. **Dynamic `className` expressions** (`cn(...)`, template strings, vars)  
   - Why blocked: safe merge cannot be guaranteed in `literal-only` mode.  
   - Workaround: move editable utilities to a string-literal `className` on the instrumented host, or use a dedicated child host with literal classes.

2. **Duplicate `data-nuvio-id` values**  
   - Why blocked: source index removes duplicates to avoid wrong-file/node writes.  
   - Workaround: rename each repeated id (`.copy`, `.copy2`, etc.), restart dev server, then reselect.

3. **Ambiguous parent-only text targets (no child ids)**  
   - Why blocked: text locators can be unstable when markup changes.  
   - Workaround: add explicit child ids for label/value/button text (`metric.orders.label`, `metric.orders.value`).

4. **Structural move outside safe layout context**  
   - Why blocked: move is only reliable among JSX siblings under flex/grid parent.  
   - Workaround: keep move within the same flex/grid container, or edit source manually for cross-parent layout changes.

5. **Map-heavy repeated UIs without explicit per-item host ids**  
   - Why blocked: one patch may unintentionally affect many rendered items.  
   - Workaround: patch the stable list host only, or add explicit per-item ids from real data keys before editing children.

## Undo and preview

- **Validate** (`dryRun`) does not change disk; **Apply** writes.
- **Colors:** the Editor uses the **Tailwind v3 default palette** (utility classes such as `text-sky-500`). Arbitrary hex/RGB (`text-[#…]`, `bg-[#…]`) is not supported yet — use the nearest swatch or edit source by hand. **Undo last** is **session-scoped** on the dev server (in-memory snapshots), not a substitute for version control.
