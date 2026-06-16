import { defineConfig } from "vitest/config";

export default defineConfig({
  define: {
    "import.meta.env.VITE_RTE_DEV_TOKEN": JSON.stringify("test-dev-token"),
  },
  test: { environment: "jsdom", passWithNoTests: true },
});
