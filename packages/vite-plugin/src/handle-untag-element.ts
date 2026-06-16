import fs from "node:fs";
import path from "node:path";
import type { WebSocket } from "ws";
import { removeDataRteIdFromSource } from "@rte/ast-engine";
import {
  PROTOCOL_VERSION,
  serializeServerMessage,
  type ClientUntagElement,
  type IndexWireEntry,
} from "@rte/shared";
import { assertPathWithinRoot } from "@rte/shared/secure-path";

export type UntagElementContext = {
  writeGuardRoot: string;
  projectRoot: string;
  idToEntry: Map<string, IndexWireEntry>;
  onIndexRebuilt: () => void;
};

export async function handleUntagElementMessage(
  ws: WebSocket,
  msg: ClientUntagElement,
  ctx: UntagElementContext,
): Promise<void> {
  const ackFail = (errorCode: string, errorMessage: string) => {
    ws.send(
      serializeServerMessage({
        type: "untagElementAck",
        protocolVersion: PROTOCOL_VERSION,
        requestId: msg.requestId,
        ok: false,
        errorCode,
        errorMessage,
      }),
    );
  };

  const entry = ctx.idToEntry.get(msg.id);
  if (!entry) {
    ackFail("not_indexed", "That id is not in the dev index — select a tagged element first");
    return;
  }

  const fileAbs = path.isAbsolute(entry.file)
    ? path.resolve(entry.file)
    : path.resolve(ctx.projectRoot, entry.file);

  try {
    assertPathWithinRoot(ctx.writeGuardRoot, fileAbs);
  } catch (e) {
    ackFail("path_escape", String(e));
    return;
  }

  let source: string;
  try {
    source = fs.readFileSync(fileAbs, "utf8");
  } catch (e) {
    ackFail("read_error", String(e));
    return;
  }

  const result = await removeDataRteIdFromSource(source, fileAbs, msg.id);
  if (!result.ok) {
    ackFail(result.code, result.message);
    return;
  }

  try {
    fs.writeFileSync(fileAbs, result.source, "utf8");
  } catch (e) {
    ackFail("write_error", String(e));
    return;
  }

  ctx.onIndexRebuilt();

  ws.send(
    serializeServerMessage({
      type: "untagElementAck",
      protocolVersion: PROTOCOL_VERSION,
      requestId: msg.requestId,
      ok: true,
      id: result.id,
    }),
  );
}
