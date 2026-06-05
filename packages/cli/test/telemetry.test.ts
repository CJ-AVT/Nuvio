import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const captureMock = vi.fn();
const shutdownMock = vi.fn().mockResolvedValue(undefined);

vi.mock("posthog-node", () => ({
  PostHog: vi.fn().mockImplementation(() => ({
    capture: captureMock,
    shutdown: shutdownMock,
  })),
}));

describe("cli telemetry", () => {
  let tempHome: string;
  let prevHome: string | undefined;
  let prevTelemetry: string | undefined;
  let prevToken: string | undefined;

  beforeEach(() => {
    vi.resetModules();
    captureMock.mockClear();
    shutdownMock.mockClear();
    tempHome = mkdtempSync(join(tmpdir(), "nuvio-telemetry-"));
    prevHome = process.env.HOME;
    prevTelemetry = process.env.NUVIO_TELEMETRY;
    prevToken = process.env.NUVIO_POSTHOG_TOKEN;
    process.env.HOME = tempHome;
    process.env.NUVIO_POSTHOG_TOKEN = "phc_test_token";
  });

  afterEach(() => {
    process.env.HOME = prevHome;
    if (prevTelemetry === undefined) delete process.env.NUVIO_TELEMETRY;
    else process.env.NUVIO_TELEMETRY = prevTelemetry;
    if (prevToken === undefined) delete process.env.NUVIO_POSTHOG_TOKEN;
    else process.env.NUVIO_POSTHOG_TOKEN = prevToken;
    rmSync(tempHome, { recursive: true, force: true });
  });

  async function loadTelemetry() {
    return import("../src/telemetry.js");
  }

  it("is disabled when NUVIO_TELEMETRY=0", async () => {
    process.env.NUVIO_TELEMETRY = "0";
    const { captureCliEvent, __resetTelemetryForTests } = await loadTelemetry();
    __resetTelemetryForTests();
    captureCliEvent("nuvio_init_started", {
      nuvio_version: "0.5.4",
      os: "darwin",
      arch: "arm64",
      node: "v20.0.0",
    });
    expect(captureMock).not.toHaveBeenCalled();
  });

  it("is disabled when NUVIO_TELEMETRY=false", async () => {
    process.env.NUVIO_TELEMETRY = "false";
    const { captureCliEvent, __resetTelemetryForTests } = await loadTelemetry();
    __resetTelemetryForTests();
    captureCliEvent("nuvio_init_started", {
      nuvio_version: "0.5.4",
      os: "darwin",
      arch: "arm64",
      node: "v20.0.0",
    });
    expect(captureMock).not.toHaveBeenCalled();
  });

  it("does not throw when capture fails", async () => {
    delete process.env.NUVIO_TELEMETRY;
    captureMock.mockImplementation(() => {
      throw new Error("posthog down");
    });
    const { captureCliEvent, __resetTelemetryForTests } = await loadTelemetry();
    __resetTelemetryForTests();
    expect(() =>
      captureCliEvent("nuvio_init_started", {
        nuvio_version: "0.5.4",
        os: "darwin",
        arch: "arm64",
        node: "v20.0.0",
      }),
    ).not.toThrow();
  });

  it("reuses anonymous id after first creation", async () => {
    delete process.env.NUVIO_TELEMETRY;
    const mod = await loadTelemetry();
    mod.__resetTelemetryForTests();
    mod.captureCliEvent("nuvio_init_started", {
      nuvio_version: "0.5.4",
      os: "darwin",
      arch: "arm64",
      node: "v20.0.0",
    });
    const telemetryPath = join(tempHome, ".nuvio", "telemetry.json");
    expect(existsSync(telemetryPath)).toBe(true);
    const firstId = (JSON.parse(readFileSync(telemetryPath, "utf8")) as {
      anonymousId: string;
    }).anonymousId;

    vi.resetModules();
    const mod2 = await loadTelemetry();
    mod2.__resetTelemetryForTests();
    mod2.captureCliEvent("nuvio_init_completed", {
      nuvio_version: "0.5.4",
      os: "darwin",
      arch: "arm64",
      node: "v20.0.0",
    });
    const secondId = (JSON.parse(readFileSync(telemetryPath, "utf8")) as {
      anonymousId: string;
    }).anonymousId;
    expect(secondId).toBe(firstId);
    expect(captureMock).toHaveBeenCalled();
    const distinctIds = captureMock.mock.calls.map(
      (call) => (call[0] as { distinctId: string }).distinctId,
    );
    expect(distinctIds.every((id) => id === firstId)).toBe(true);
  });

  it("does not include file paths or forbidden keys in properties", async () => {
    delete process.env.NUVIO_TELEMETRY;
    const { captureCliEvent, __resetTelemetryForTests } = await loadTelemetry();
    __resetTelemetryForTests();
    captureCliEvent("nuvio_init_failed", {
      nuvio_version: "0.5.4",
      os: "darwin",
      arch: "arm64",
      node: "v20.0.0",
      error_code: "install_failed",
      // @ts-expect-error intentional forbidden key for sanitize test
      cwd: "/Users/me/project",
      // @ts-expect-error intentional forbidden key for sanitize test
      path: "src/App.tsx",
    });
    expect(captureMock).toHaveBeenCalled();
    const props = (captureMock.mock.calls[0]?.[0] as { properties?: Record<string, unknown> })
      .properties;
    expect(props).toBeDefined();
    for (const [key, value] of Object.entries(props ?? {})) {
      expect(["cwd", "root", "file", "path", "name", "message", "stack"]).not.toContain(key);
      if (typeof value === "string") {
        expect(value).not.toMatch(/[/\\]/);
      }
    }
    expect(props?.error_code).toBe("install_failed");
  });
});
