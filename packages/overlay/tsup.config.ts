import { copyFile } from "node:fs/promises";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom", "@nuvio/shared"],
  esbuildOptions(options) {
    options.loader = { ...options.loader, ".css": "empty" };
  },
  async onSuccess() {
    await copyFile("src/styles/overlay.css", "dist/style.css");
  },
});
