/**
 * Offline source index API for `@rte/cli` (doctor / scan / stats).
 */
export {
  buildSourceIndex,
  pickBestSourceIndex,
  extractIdsFromSource,
  type BuildSourceIndexResult,
  type SourceIndexEntry,
} from "./source-index.js";
export { detectProjectLibraries } from "./detect-libraries.js";
export { readRuntimeVersions } from "./read-dep-version.js";
export { RTE_DEFAULT_SCAN_GLOBS } from "./rte-dev-session.js";
