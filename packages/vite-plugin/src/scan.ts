/**
 * Offline source index API for `@nuvio/cli` (doctor / scan / stats).
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
export { NUVIO_DEFAULT_SCAN_GLOBS } from "./nuvio-dev-session.js";
