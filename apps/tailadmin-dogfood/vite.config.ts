import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { rte } from "@rte/vite-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const overlayDevEntry = path.resolve(repoRoot, "packages/overlay/src/index.tsx");

export default defineConfig(({ command }) => ({
  plugins: [react(), rte()],
  resolve: {
    ...(command === "serve"
      ? { alias: { "@rte/overlay": overlayDevEntry } }
      : {}),
    dedupe: ["react", "react-dom"],
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  root: __dirname,
}));
