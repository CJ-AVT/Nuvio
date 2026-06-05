import { defineConfig } from "vitest/config";

export default defineConfig({
  define: {
    "import.meta.env.NUVIO_POSTHOG_TOKEN": JSON.stringify("phc_test_token"),
    "import.meta.env.VITE_NUVIO_TELEMETRY": JSON.stringify(
      process.env.VITE_NUVIO_TELEMETRY ?? "",
    ),
  },
  test: { environment: "jsdom", passWithNoTests: true },
});
