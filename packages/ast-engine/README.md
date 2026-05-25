# `@nuvio/ast-engine`

Parses TSX/JSX, locates `data-nuvio-id` hosts, applies patch ops (`setText`, `mergeTailwindClassName`, `moveSibling`, `setHidden`, `duplicateHost`) with whitelist + `tailwind-merge`, formats with Prettier. Golden tests in `src/apply-patch.test.ts`.

See the [Nuvio README](../../README.md) and [CHANGELOG](../../CHANGELOG.md).
