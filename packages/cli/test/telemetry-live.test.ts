import { describe, expect, it } from "vitest";
import {
  buildCliTelemetryProps,
  captureCliEvent,
  captureCliInvoked,
  shutdownTelemetry,
} from "../src/telemetry.js";

const LIVE = process.env.NUVIO_TELEMETRY_LIVE === "1";

describe.skipIf(!LIVE)("live PostHog CLI smoke", () => {
  it(
    "sends nuvio_cli_invoked, nuvio_init_started, and nuvio_init_completed to PostHog",
    async () => {
      captureCliInvoked("init", "pnpm");
      const props = buildCliTelemetryProps("pnpm");
      captureCliEvent("nuvio_init_started", props);
      captureCliEvent("nuvio_init_completed", {
        ...props,
        result_tier: "full",
      });
      await shutdownTelemetry();
      expect(true).toBe(true);
    },
    20_000,
  );
});
