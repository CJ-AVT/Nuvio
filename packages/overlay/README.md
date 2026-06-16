# `@rte/overlay`

React **dev overlay**: edit mode, selection, Editor panel, Validate / Apply / Undo.

**Overlay chrome:** Editor panel and Rte chip are draggable (header), collapsible, and excluded from canvas selection. Layout persists in `localStorage` (`rte:overlay-chrome:v1`).

**Phase 4:** Expanded text/background color lists; **Layout & structure** toolbar (`moveSibling`, `setHidden`, `duplicateHost` via protocol v4); **Indexed elements** tree for selection. Structural actions validate on the server then auto-apply; style edits use Validate → Apply → Undo.

**Peers:** `react`, `react-dom` (18.3+ or 19). Overlay chrome ships **self-contained CSS** (`dist/style.css`, auto-loaded by `RteDevShell`) — host Tailwind `content` is **not** required for Rte UI (v0.2.0+).

See the [Rte README](../../README.md) and [CHANGELOG](../../CHANGELOG.md).
