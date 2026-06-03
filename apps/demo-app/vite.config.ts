import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";
import { nuvio } from "@nuvio/vite-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
/** Dev: bundle overlay from source so HMR does not 404 when `dist/` is rebuilt or missing. */
const overlayDevEntry = path.resolve(repoRoot, "packages/overlay/src/index.tsx");

export default defineConfig(({ command }) => ({
  plugins: [react(), nuvio() as unknown as PluginOption] as PluginOption[],
  resolve: {
    ...(command === "serve"
      ? { alias: { "@nuvio/overlay": overlayDevEntry } }
      : {}),
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5174,
    fs: {
      allow: [repoRoot],
    },
  },
  root: __dirname,
}));
