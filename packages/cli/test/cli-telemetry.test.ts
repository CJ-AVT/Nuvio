import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const captureMock = vi.fn();
const flushMock = vi.fn().mockResolvedValue(undefined);
const shutdownMock = vi.fn().mockResolvedValue(undefined);

vi.mock("posthog-node", () => ({
  PostHog: vi.fn().mockImplementation(() => ({
    capture: captureMock,
    flush: flushMock,
    shutdown: shutdownMock,
  })),
}));

describe("runCli telemetry", () => {
  let prevTelemetry: string | undefined;
  let prevToken: string | undefined;
  let prevHome: string | undefined;

  beforeEach(async () => {
    vi.resetModules();
    captureMock.mockClear();
    flushMock.mockClear();
    shutdownMock.mockClear();
    prevTelemetry = process.env.NUVIO_TELEMETRY;
    prevToken = process.env.NUVIO_POSTHOG_TOKEN;
    prevHome = process.env.HOME;
    delete process.env.NUVIO_TELEMETRY;
    process.env.NUVIO_POSTHOG_TOKEN = "phc_test_token";
    process.env.HOME = "/tmp/nuvio-cli-telemetry-test";
    const telemetry = await import("../src/telemetry.js");
    telemetry.__resetTelemetryForTests();
  });

  afterEach(() => {
    if (prevTelemetry === undefined) delete process.env.NUVIO_TELEMETRY;
    else process.env.NUVIO_TELEMETRY = prevTelemetry;
    if (prevToken === undefined) delete process.env.NUVIO_POSTHOG_TOKEN;
    else process.env.NUVIO_POSTHOG_TOKEN = prevToken;
    if (prevHome === undefined) delete process.env.HOME;
    else process.env.HOME = prevHome;
  });

  async function runCli(argv: string[]) {
    const { runCli: run } = await import("../src/cli.js");
    return run(argv);
  }

  function invokedCommand(): string | undefined {
    const call = captureMock.mock.calls.find(
      (entry) => (entry[0] as { event?: string }).event === "nuvio_cli_invoked",
    );
    return (call?.[0] as { properties?: { command?: string } } | undefined)
      ?.properties?.command;
  }

  it("fires nuvio_cli_invoked for --help before exiting", async () => {
    const code = await runCli(["node", "nuvio", "--help"]);
    expect(code).toBe(0);
    expect(invokedCommand()).toBe("help");
    expect(flushMock).toHaveBeenCalled();
    expect(shutdownMock).toHaveBeenCalled();
  });

  it("fires nuvio_cli_invoked with command none for bare nuvio", async () => {
    const code = await runCli(["node", "nuvio"]);
    expect(code).toBe(1);
    expect(invokedCommand()).toBe("none");
    expect(shutdownMock).toHaveBeenCalled();
  });

  it("fires nuvio_cli_invoked with command unknown for unsupported commands", async () => {
    const code = await runCli(["node", "nuvio", "deploy"]);
    expect(code).toBe(1);
    expect(invokedCommand()).toBe("unknown");
    expect(shutdownMock).toHaveBeenCalled();
  });

  it("fires nuvio_cli_invoked with command doctor", async () => {
    const code = await runCli([
      "node",
      "nuvio",
      "doctor",
      "--skip-dev-server",
      "--cwd",
      "/tmp/nuvio-cli-doctor-telemetry-missing",
    ]);
    expect(code).toBe(1);
    expect(invokedCommand()).toBe("doctor");
    expect(shutdownMock).toHaveBeenCalled();
  });

  it("does not throw when telemetry capture fails", async () => {
    captureMock.mockImplementation(() => {
      throw new Error("posthog down");
    });
    await expect(runCli(["node", "nuvio", "--help"])).resolves.toBe(0);
  });
});
