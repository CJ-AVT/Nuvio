# Nuvio telemetry spec (v0.3)

**Implemented in v0.5.4** — see [PostHog_telemetry.md](PostHog_telemetry.md) for the shipped PostHog integration (anonymous, opt-out).

This file retains the original v0.3 **design notes**. v0.5.4 supersedes the opt-in / disabled-by-default model below.

## Goals

- Measure reliability and UX friction without collecting source code.
- Support product decisions (where validations fail, what controls are used).
- Keep implementation opt-in and privacy-first.

## Non-goals

- No source file contents.
- No full className strings.
- No project secrets, env vars, or auth headers.

## Opt-in model

- Default: telemetry disabled.
- Enable only via explicit local config/env toggle in future implementation.
- If enabled, users can disable any time without restarting their app.

## Event schema (proposed)

Common envelope:

```json
{
  "event": "string",
  "ts": "ISO-8601",
  "sessionId": "uuid",
  "nuvioVersion": "semver",
  "protocolVersion": 5,
  "meta": {}
}
```

Recommended events:

- `overlay_opened`
  - `meta`: `{ "mode": "simple|developer" }`
- `selection_changed`
  - `meta`: `{ "riskLevel": "safe|caution|unsupported", "insideMap": boolean }`
- `validate_requested`
  - `meta`: `{ "opKinds": ["setText","mergeTailwindClassName"], "activeBreakpoint": "base|sm|md|lg|xl" }`
- `validate_result`
  - `meta`: `{ "ok": boolean, "errorCode": "string|null", "latencyMs": number }`
- `apply_result`
  - `meta`: `{ "ok": boolean, "errorCode": "string|null", "undoStackDepth": number|null }`
- `undo_result`
  - `meta`: `{ "ok": boolean, "errorCode": "string|null" }`
- `duplicate_id_blocked`
  - `meta`: `{ "idHash": "sha256(id)" }`

## Data minimization rules

- Hash identifiers (`data-nuvio-id`) before transport.
- Do not include absolute file paths; at most send coarse categories.
- Truncate error messages to code + short reason class.

## Transport and retention (future)

- Batch events in memory, flush on interval or session end.
- Backoff and drop-on-failure to avoid blocking editor interactions.
- Suggested retention: 30 days raw events, longer only aggregated metrics.

## Security

- Use HTTPS-only endpoints.
- No third-party forwarding of raw events by default.
- Allow self-hosted endpoint config in future.

## Implementation status

- v0.3: **spec documented only**.
- v0.4+: optional implementation behind explicit opt-in.
