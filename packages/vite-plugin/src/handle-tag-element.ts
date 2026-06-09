import fs from "node:fs";
import path from "node:path";
import type { WebSocket } from "ws";
import { insertDataNuvioIdAtLocation, isValidNuvioId } from "@nuvio/ast-engine";
import {
  PROTOCOL_VERSION,
  serializeServerMessage,
  type ClientTagElement,
  type DuplicateIdError,
  type IndexWireEntry,
} from "@nuvio/shared";
import { assertPathWithinRoot } from "@nuvio/shared/secure-path";

export type TagElementContext = {
  writeGuardRoot: string;
  projectRoot: string;
  idToEntry: Map<string, IndexWireEntry>;
  duplicateIds: readonly DuplicateIdError[];
  onIndexRebuilt: () => void;
};

export async function handleTagElementMessage(
  ws: WebSocket,
  msg: ClientTagElement,
  ctx: TagElementContext,
): Promise<void> {
  const ackFail = (errorCode: string, errorMessage: string) => {
    ws.send(
      serializeServerMessage({
        type: "tagElementAck",
        protocolVersion: PROTOCOL_VERSION,
        requestId: msg.requestId,
        ok: false,
        errorCode,
        errorMessage,
      }),
    );
  };

  if (!isValidNuvioId(msg.nuvioId)) {
    ackFail("invalid_id", "Id must be segmented lowercase (e.g. page.title)");
    return;
  }

  if (ctx.idToEntry.has(msg.nuvioId) || ctx.duplicateIds.some((d) => d.id === msg.nuvioId)) {
    ackFail("duplicate_id", "That id is already used — pick another name");
    return;
  }

  const fileAbs = path.isAbsolute(msg.file)
    ? path.resolve(msg.file)
    : path.resolve(ctx.projectRoot, msg.file);

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

  const result = await insertDataNuvioIdAtLocation(
    source,
    fileAbs,
    msg.line,
    msg.column,
    msg.nuvioId,
  );

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
      type: "tagElementAck",
      protocolVersion: PROTOCOL_VERSION,
      requestId: msg.requestId,
      ok: true,
      id: result.id,
    }),
  );
}
