import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { rte } from "@rte/vite-plugin";

export default defineConfig({
  plugins: [react(), rte()],
});
