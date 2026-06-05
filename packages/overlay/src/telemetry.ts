import { posthog } from "posthog-js";
import { NUVIO_POSTHOG_TOKEN } from "./nuvio-posthog-token.js";

const POSTHOG_HOST = "https://us.i.posthog.com";

export type OverlayTelemetryEvent =
  | "overlay_connected"
  | "first_selection"
  | "preview_changes"
  | "apply_to_code"
  | "apply_failed";

export type ApplyFailureReason =
  | "duplicate_id"
  | "no_patch_target"
  | "unsupported_classname"
  | "apply_error";

type OverlayEventProps = {
  reason?: ApplyFailureReason;
};

let initialized = false;
let firstSelectionSent = false;
let overlayConnectedSent = false;

function posthogToken(): string {
  return NUVIO_POSTHOG_TOKEN;
}

function tokenIsConfigured(token: string): boolean {
  return Boolean(token && token.startsWith("phc_"));
}

export function isOverlayTelemetryOptedOut(flags: {
  localStorageTelemetry: string | null;
  viteTelemetry: string | undefined;
}): boolean {
  return flags.localStorageTelemetry === "0" || flags.viteTelemetry === "0";
}

export function isOverlayTelemetryEnabled(): boolean {
  try {
    const localStorageTelemetry =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("nuvio.telemetry")
        : null;
    const env = import.meta as ImportMeta & {
      env?: { VITE_NUVIO_TELEMETRY?: string };
    };
    if (
      isOverlayTelemetryOptedOut({
        localStorageTelemetry,
        viteTelemetry: env.env?.VITE_NUVIO_TELEMETRY,
      })
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function ensureInitialized(): boolean {
  if (!isOverlayTelemetryEnabled()) return false;
  const token = posthogToken();
  if (!tokenIsConfigured(token)) return false;
  if (!initialized) {
    const debug =
      typeof localStorage !== "undefined" &&
      localStorage.getItem("nuvio.telemetry.debug") === "1";
    posthog.init(token, {
      api_host: POSTHOG_HOST,
      ui_host: "https://us.posthog.com",
      autocapture: false,
      capture_pageview: false,
      disable_session_recording: true,
      person_profiles: "identified_only",
      persistence: "localStorage",
      debug,
    });
    initialized = true;
  }
  return true;
}

export function mapApplyFailureReason(
  errorCode: string | undefined,
  options?: { duplicateIdsActive?: boolean },
): ApplyFailureReason {
  if (options?.duplicateIdsActive && errorCode === "unknown_id") {
    return "duplicate_id";
  }
  if (errorCode === "unknown_id" || errorCode === "host_not_found") {
    return "no_patch_target";
  }
  if (errorCode === "patch_rejected") {
    return "unsupported_classname";
  }
  return "apply_error";
}

export function captureOverlayEvent(
  event: OverlayTelemetryEvent,
  props?: OverlayEventProps,
): void {
  try {
    if (!ensureInitialized()) return;
    const payload: Record<string, string> = {};
    if (props?.reason) {
      payload.reason = props.reason;
    }
    posthog.capture(event, Object.keys(payload).length > 0 ? payload : undefined);
  } catch {
    // never break overlay
  }
}

export function captureOverlayConnected(): void {
  if (overlayConnectedSent) return;
  overlayConnectedSent = true;
  captureOverlayEvent("overlay_connected");
}

export function captureFirstSelection(): void {
  if (firstSelectionSent) return;
  firstSelectionSent = true;
  captureOverlayEvent("first_selection");
}

export function captureApplyFailed(
  errorCode: string | undefined,
  options?: { duplicateIdsActive?: boolean },
): void {
  captureOverlayEvent("apply_failed", {
    reason: mapApplyFailureReason(errorCode, options),
  });
}

/** Test-only reset of module state. */
export function __resetOverlayTelemetryForTests(): void {
  initialized = false;
  firstSelectionSent = false;
  overlayConnectedSent = false;
}
