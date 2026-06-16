# `@rte/vite-plugin`

Vite plugin: dev WebSocket channel, **dev-time source index**, secure file writes for Rte patches.

**Peer:** `vite` ^5.4, ^6, or ^8.

See the [Rte README](../../README.md) and [CHANGELOG](../../CHANGELOG.md).

## Options

```ts
rte({
  enabled: true, // default unless RTE=0
  classNameMode: "literal-only", // default
  // classNameMode: "cn-basic", // allow simple cn/clsx string-list forms
});
```

`cn-basic` supports only calls like `cn("p-4", "rounded-xl")` / `clsx("p-4", "rounded-xl")`.
Conditional/object/array/variable patterns remain non-patchable and fail closed.

Set `RTE=0` to disable the plugin globally in CI/dev runs.
