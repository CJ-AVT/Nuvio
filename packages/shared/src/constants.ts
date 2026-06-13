/** WebSocket path on the Vite dev server (must match `configureServer` upgrade handler). */
export const NUVIO_WS_PATH = "/__nuvio/ws" as const;

/** HTTP path for reading/writing `nuvio/brand.json` in dev. */
export const NUVIO_BRAND_PATH = "/__nuvio/brand" as const;

/** HTTP path for resolving `nuvio/pages/*.pcc.yaml` by route in dev. */
export const NUVIO_PCC_PATH = "/__nuvio/pcc" as const;
