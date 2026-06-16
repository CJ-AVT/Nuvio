/** WebSocket path on the Vite dev server (must match `configureServer` upgrade handler). */
export const RTE_WS_PATH = "/__rte/ws" as const;

/** HTTP path for reading/writing `rte/brand.json` in dev. */
export const RTE_BRAND_PATH = "/__rte/brand" as const;

/** HTTP path for resolving `rte/pages/*.pcc.yaml` by route in dev. */
export const RTE_PCC_PATH = "/__rte/pcc" as const;

/** Dev-only: returns per-server auth token JSON for overlay bootstrap. */
export { RTE_DEV_TOKEN_PATH } from "./dev-auth.js";
