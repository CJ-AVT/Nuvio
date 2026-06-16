import type { ClassNameMode } from "@rte/ast-engine";
import type { IndexWireEntry, WireClassNameMode } from "@rte/shared";

const PATCHABLE_MODES = new Set<WireClassNameMode>([
  "literal-only",
  "cn-basic",
  "cn-conditional",
  "classnames-static",
]);

/** Pick per-host mode from index metadata, with plugin default as fallback. */
export function resolvePatchClassNameMode(
  entry: Pick<IndexWireEntry, "classNameMode">,
  pluginDefault: ClassNameMode = "literal-only",
): ClassNameMode {
  const detected = entry.classNameMode;
  if (detected && PATCHABLE_MODES.has(detected)) {
    return detected;
  }
  return pluginDefault;
}
