# Known limitations

These boundaries exist so Nuvio can stay **source-correct** and **testable**. Unsupported patterns should **fail with a clear error**, not write silently.

Applies through **`1.0.0`** unless noted.

## Component libraries (`0.8.0`)

- **Detected:** shadcn (`components/ui/`), TailAdmin (layout/ecommerce paths), DaisyUI (`daisyui` dependency).
- Dev overlay shows `Libraries: …` under **Developer details** when detection succeeds.
- **shadcn:** compound tags (`Card`, `Button`, `Table`, …) get library-aware ids and Simple Mode routing; Radix portals and opaque wrappers may still need manual tags.
- **TailAdmin:** dogfood instrumentation patterns are supported; other TailAdmin layouts need click-to-tag or manual ids.
- **DaisyUI:** detection only in Phase 1 — class-based `btn` / `card` hosts not fully validated without a DaisyUI example app.

## Click-to-tag (`0.6.0`)

- Untagged elements get dev-only **`data-nuvio-loc`** attributes via the Vite plugin transform. **Restart the dev server** after upgrading so all modules are stamped.
- Tagging resolves source from `file:line:column` — the clicked DOM node must map to a **native JSX opening element** in source.
- **Not supported yet:** opaque component wrappers that do not forward loc attributes to a DOM host; `.map()` loops without a stable per-item loc; fragments without a single host element.
- **Workaround:** add `data-nuvio-id` manually on the JSX host, or refactor to a native element wrapper.

## `className` on the patched host

- **Supported (v0.7):** string literals; `cn("a", "b")` / `clsx(...)` string lists; `cn("base", cond && "token")`; `classnames("base", { flag })` with static object keys.
- **Not supported yet:** template literals, variable-only `className`, `cva()` / `tailwind-variants`, arbitrary values `text-[#fff]`.
- The source index auto-detects a per-host `classNameMode`; unsupported shapes fail closed at preview/apply.

## Tailwind utilities

- Only utilities allowed by **`@nuvio/ast-engine`**’s whitelist are accepted. Unknown tokens are rejected at preview/apply time with a readable message.
- **`tailwind-merge`** resolves conflicts when merging; semantics follow that library.

## Host contract

- Editable regions must expose stable **`data-nuvio-id="..."`** attributes (add manually or via **Make Editable** click-to-tag in v0.6+). Ids must be **unique** across the scanned project; duplicates surface at **index** time.

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

1. **Unsupported `className` shapes** (template literals, variable-only, `cva()` / `tailwind-variants`, arbitrary `text-[#fff]`)  
   - Why blocked: safe merge cannot be guaranteed outside detected modes.  
   - Workaround: use supported `cn("base", cond && "token")` or a string-literal `className` on the instrumented host.

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
