# `@rte/ast-engine`

Parses TSX/JSX, locates `data-rte-id` hosts, applies patch ops (`setText`, `mergeTailwindClassName`, `moveSibling`, `setHidden`, `duplicateHost`) with whitelist + `tailwind-merge`, formats with Prettier. Golden tests in `src/apply-patch.test.ts`.

See the [Rte README](../../README.md) and [CHANGELOG](../../CHANGELOG.md).
