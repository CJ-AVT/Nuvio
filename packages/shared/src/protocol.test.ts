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

  it("accepts patchApply with activeBreakpoint", () => {
    const msg = parseClientMessage(
      JSON.stringify({
        type: "patchApply",
        protocolVersion: PROTOCOL_VERSION,
        requestId: "r3c",
        id: "hero.title",
        ops: [{ kind: "mergeTailwindClassName", classNameFragment: "p-6" }],
        activeBreakpoint: "md",
      }),
    );
    expect(msg).toEqual({
      type: "patchApply",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "r3c",
      id: "hero.title",
      ops: [{ kind: "mergeTailwindClassName", classNameFragment: "p-6" }],
      activeBreakpoint: "md",
    });
  });

  it("accepts patchApply with removeTailwindClassName", () => {
    const msg = parseClientMessage(
      JSON.stringify({
        type: "patchApply",
        protocolVersion: PROTOCOL_VERSION,
        requestId: "r3d",
        id: "metric.orders.card",
        ops: [{ kind: "removeTailwindClassName", classNameFragment: "p-4" }],
      }),
    );
    expect(msg).toEqual({
      type: "patchApply",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "r3d",
      id: "metric.orders.card",
      ops: [{ kind: "removeTailwindClassName", classNameFragment: "p-4" }],
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

  it("accepts tagElement", () => {
    const msg = parseClientMessage(
      JSON.stringify({
        type: "tagElement",
        protocolVersion: PROTOCOL_VERSION,
        requestId: "t1",
        file: "src/App.tsx",
        line: 4,
        column: 9,
        nuvioId: "page.title",
      }),
    );
    expect(msg).toEqual({
      type: "tagElement",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "t1",
      file: "src/App.tsx",
      line: 4,
      column: 9,
      nuvioId: "page.title",
    });
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

  it("round-trips pong with diagnostics", () => {
    const msg: ServerMessage = {
      type: "pong",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "r1",
      diagnostics: {
        viteVersion: "6.0.0",
        reactVersion: "19.0.0",
        tailwindVersion: "4.0.0",
        overlayCssMode: "self-contained",
      },
    };
    expect(parseServerMessage(serializeServerMessage(msg))).toEqual(msg);
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

  it("parses indexReady v2 entries and diagnostics", () => {
    const msg: ServerMessage = {
      type: "indexReady",
      protocolVersion: PROTOCOL_VERSION,
      indexVersion: 1,
      entries: [
        {
          id: "hero.title",
          file: "/x/Hero.tsx",
          line: 4,
          column: 8,
          tagName: "h1",
          componentName: "Hero",
          hasLiteralClassName: true,
          classNameValue: "text-xl",
          textEditable: true,
          structuralEditable: true,
          riskLevel: "safe",
          unsupportedReasons: [],
          insideMap: false,
        },
      ],
      duplicateErrors: [],
      diagnostics: {
        viteVersion: "6.0.0",
        overlayCssMode: "self-contained",
      },
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

  it("parses index v3 textTargets on indexReady and selectAck", () => {
    const indexMsg: ServerMessage = {
      type: "indexReady",
      protocolVersion: PROTOCOL_VERSION,
      indexVersion: 2,
      entries: [
        {
          id: "metric.orders.card",
          file: "/x/Card.tsx",
          line: 10,
          column: 4,
          textTargets: [
            {
              key: "metric.orders.label",
              label: "h3 · Orders",
              file: "/x/Card.tsx",
              line: 11,
              column: 6,
              tagName: "h3",
              textEditable: true,
              textPreview: "Orders",
              nuvioId: "metric.orders.label",
              patchHostId: "metric.orders.label",
            },
          ],
          styleTargets: [
            {
              key: "host",
              label: "div · container",
              file: "/x/Card.tsx",
              line: 10,
              column: 4,
              tagName: "div",
              nuvioId: "metric.orders.card",
              patchHostId: "metric.orders.card",
              classNamePatchable: true,
            },
          ],
          hierarchyRole: "card",
          parentHostId: "dashboard.metrics",
          childTargetIds: ["metric.orders.label"],
          patchHostId: "metric.orders.card",
          primaryTextTargetKey: "metric.orders.label",
        },
      ],
      duplicateErrors: [],
    };
    expect(parseServerMessage(serializeServerMessage(indexMsg))).toEqual(indexMsg);

    const selectMsg: ServerMessage = {
      type: "selectAck",
      protocolVersion: PROTOCOL_VERSION,
      requestId: "s1",
      id: "metric.orders.card",
      ok: true,
      file: "/x/Card.tsx",
      line: 10,
      column: 4,
      textTargets: indexMsg.entries[0]?.textTargets,
      styleTargets: indexMsg.entries[0]?.styleTargets,
      hierarchyRole: "card",
      parentHostId: "dashboard.metrics",
      childTargetIds: ["metric.orders.label"],
      patchHostId: "metric.orders.card",
      primaryTextTargetKey: "metric.orders.label",
    };
    expect(parseServerMessage(serializeServerMessage(selectMsg))).toEqual(selectMsg);
  });
});