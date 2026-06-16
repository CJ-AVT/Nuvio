import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** Installed @rte/cli semver (from package.json). */
export const RTE_VERSION: string = (
  require("../package.json") as { version: string }
).version;
