import { describe, expect, it } from "vitest";
import type { ServerMessage } from "./protocol.js";
import {
  PROTOCOL_VERSION,
  parseClientMessage,
  parseServerMessage,
  serializeServerMessage,
} from "./protocol.js";

describe("parseClientMessage", () => {
  it("accepts ping", () => {
    const msg = parseClientMessage(
      JSON.stringify({
        type: "ping",
        protocolVersion: PROTOCOL_VERSION,
        requestId: "r1",
      }),
    );
    expect(msg).toEqual({
      type: "ping",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "r1",
    });
  });

  it("accepts select", () => {
    const msg = parseClientMessage(
      JSON.stringify({
        type: "select",
        protocolVersion: PROTOCOL_VERSION,
        requestId: "r2",
        id: "hero.title",
      }),
    );
    expect(msg).toEqual({
      type: "select",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "r2",
      id: "hero.title",
    });
  });

  it("accepts patchApply", () => {
    const msg = parseClientMessage(
      JSON.stringify({
        type: "patchApply",
        protocolVersion: PROTOCOL_VERSION,
        requestId: "r3",
        id: "hero.title",
        ops: [{ kind: "setText", text: "Hi" }],
      }),
    );
    expect(msg).toEqual({
      type: "patchApply",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "r3",
      id: "hero.title",
      ops: [{ kind: "setText", text: "Hi" }],
    });
  });

  it("accepts patchApply with dryRun", () => {
    const msg = parseClientMessage(
      JSON.stringify({
        type: "patchApply",
        protocolVersion: PROTOCOL_VERSION,
        requestId: "r3b",
        id: "hero.title",
        ops: [{ kind: "setText", text: "Hi" }],
        dryRun: true,
      }),
    );
    expect(msg).toEqual({
      type: "patchApply",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "r3b",
      id: "hero.title",
      ops: [{ kind: "setText", text: "Hi" }],
      dryRun: true,
    });
  });

  it("accepts patchApply with Phase 4 structural ops", () => {
    const msg = parseClientMessage(
      JSON.stringify({
        type: "patchApply",
        protocolVersion: PROTOCOL_VERSION,
        requestId: "r4",
        id: "demo.card",
        ops: [
          { kind: "moveSibling", direction: "up" },
          { kind: "setHidden", hidden: true },
          { kind: "duplicateHost" },
        ],
      }),
    );
    expect(msg?.type).toBe("patchApply");
    if (msg?.type === "patchApply") {
      expect(msg.ops).toHaveLength(3);
    }
  });

  it("accepts patchUndo", () => {
    const msg = parseClientMessage(
      JSON.stringify({
        type: "patchUndo",
        protocolVersion: PROTOCOL_VERSION,
        requestId: "u1",
      }),
    );
    expect(msg).toEqual({
      type: "patchUndo",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "u1",
    });
  });

  it("rejects unknown shape", () => {
    expect(parseClientMessage(JSON.stringify({ type: "nope" }))).toBeNull();
    expect(parseClientMessage("not json")).toBeNull();
  });
});

describe("server messages", () => {
  it("round-trips pong", () => {
    const raw = serializeServerMessage({
      type: "pong",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "r1",
    });
    expect(parseServerMessage(raw)).toEqual({
      type: "pong",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "r1",
    });
  });

  it("parses indexReady", () => {
    const msg: ServerMessage = {
      type: "indexReady",
      protocolVersion: PROTOCOL_VERSION,
      indexVersion: 3,
      entries: [
        { id: "a", file: "/x/A.tsx", line: 1, column: 0 },
      ],
      duplicateErrors: [],
    };
    expect(parseServerMessage(serializeServerMessage(msg))).toEqual(msg);
  });

  it("parses patchAck", () => {
    const msg: ServerMessage = {
      type: "patchAck",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "r1",
      id: "a",
      ok: true,
      diffSummary: "Applied 1 operation to a",
    };
    expect(parseServerMessage(serializeServerMessage(msg))).toEqual(msg);
  });

  it("parses patchAck with dryRun", () => {
    const msg: ServerMessage = {
      type: "patchAck",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "r1",
      id: "a",
      ok: true,
      diffSummary: "Preview",
      dryRun: true,
    };
    expect(parseServerMessage(serializeServerMessage(msg))).toEqual(msg);
  });

  it("parses patchUndoAck", () => {
    const msg: ServerMessage = {
      type: "patchUndoAck",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "u1",
      ok: true,
      file: "/x/A.tsx",
    };
    expect(parseServerMessage(serializeServerMessage(msg))).toEqual(msg);
  });

  it("parses patchAck with writtenFile and undoStackDepth", () => {
    const msg: ServerMessage = {
      type: "patchAck",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "r9",
      id: "hero",
      ok: true,
      diffSummary: "ok",
      writtenFile: "/proj/apps/demo/src/App.tsx",
      undoStackDepth: 2,
    };
    expect(parseServerMessage(serializeServerMessage(msg))).toEqual(msg);
  });

  it("parses patchUndoAck with undoStackDepth", () => {
    const msg: ServerMessage = {
      type: "patchUndoAck",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "u2",
      ok: true,
      file: "/x/A.tsx",
      undoStackDepth: 0,
    };
    expect(parseServerMessage(serializeServerMessage(msg))).toEqual(msg);
  });
});