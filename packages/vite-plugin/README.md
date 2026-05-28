# `@nuvio/vite-plugin`

Vite plugin: dev WebSocket channel, **dev-time source index**, secure file writes for Nuvio patches.

**Peer:** `vite` ^5.4 or ^6.

See the [Nuvio README](../../README.md) and [CHANGELOG](../../CHANGELOG.md).

## Options

```ts
nuvio({
  enabled: true, // default unless NUVIO=0
  classNameMode: "literal-only", // default
  // classNameMode: "cn-basic", // allow simple cn/clsx string-list forms
});
```

`cn-basic` supports only calls like `cn("p-4", "rounded-xl")` / `clsx("p-4", "rounded-xl")`.
Conditional/object/array/variable patterns remain non-patchable and fail closed.

Set `NUVIO=0` to disable the plugin globally in CI/dev runs.
