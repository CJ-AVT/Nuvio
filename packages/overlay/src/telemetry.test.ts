import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const captureMock = vi.fn();
const initMock = vi.fn();

vi.mock("posthog-js", () => ({
  posthog: {
    init: initMock,
    capture: captureMock,
  },
}));

describe("overlay telemetry", () => {
  beforeEach(() => {
    vi.resetModules();
    captureMock.mockClear();
    initMock.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  async function loadTelemetry() {
    return import("./telemetry.js");
  }

  it("is disabled when localStorage nuvio.telemetry is 0", async () => {
    localStorage.setItem("nuvio.telemetry", "0");
    const { captureOverlayEvent, __resetOverlayTelemetryForTests } =
      await loadTelemetry();
    __resetOverlayTelemetryForTests();
    captureOverlayEvent("overlay_connected");
    expect(initMock).not.toHaveBeenCalled();
    expect(captureMock).not.toHaveBeenCalled();
  });

  it("is disabled when VITE_NUVIO_TELEMETRY is 0", async () => {
    const { isOverlayTelemetryOptedOut } = await loadTelemetry();
    expect(
      isOverlayTelemetryOptedOut({
        localStorageTelemetry: null,
        viteTelemetry: "0",
      }),
    ).toBe(true);
  });

  it("does not throw when capture fails", async () => {
    captureMock.mockImplementation(() => {
      throw new Error("posthog down");
    });
    const { captureOverlayEvent, __resetOverlayTelemetryForTests } =
      await loadTelemetry();
    __resetOverlayTelemetryForTests();
    expect(() => captureOverlayEvent("apply_to_code")).not.toThrow();
  });

  it("maps apply failure reasons from error codes", async () => {
    const { mapApplyFailureReason } = await loadTelemetry();
    expect(mapApplyFailureReason("unknown_id")).toBe("no_patch_target");
    expect(mapApplyFailureReason("host_not_found")).toBe("no_patch_target");
    expect(mapApplyFailureReason("patch_rejected")).toBe("unsupported_classname");
    expect(mapApplyFailureReason("write_error")).toBe("apply_error");
    expect(
      mapApplyFailureReason("unknown_id", { duplicateIdsActive: true }),
    ).toBe("duplicate_id");
  });

  it("emits only allowed properties on apply_failed", async () => {
    const { captureApplyFailed, __resetOverlayTelemetryForTests } =
      await loadTelemetry();
    __resetOverlayTelemetryForTests();
    captureApplyFailed("write_error");
    expect(captureMock).toHaveBeenCalledWith("apply_failed", { reason: "apply_error" });
    const props = captureMock.mock.calls[0]?.[1] as Record<string, string> | undefined;
    expect(Object.keys(props ?? {})).toEqual(["reason"]);
  });
});
