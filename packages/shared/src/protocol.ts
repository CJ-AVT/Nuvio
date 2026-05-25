import { z } from "zod";

/** Bump when wire payloads change incompatibly. */
export const PROTOCOL_VERSION = 4 as const;

export const indexEntrySchema = z.object({
  id: z.string(),
  file: z.string(),
  line: z.number().int(),
  column: z.number().int(),
});

export type IndexWireEntry = z.infer<typeof indexEntrySchema>;

export const duplicateIdOccurrenceSchema = z.object({
  file: z.string(),
  line: z.number().int(),
  column: z.number().int(),
});

export const duplicateIdErrorSchema = z.object({
  id: z.string(),
  occurrences: z.array(duplicateIdOccurrenceSchema),
});

export type DuplicateIdError = z.infer<typeof duplicateIdErrorSchema>;

export const clientPingSchema = z.object({
  type: z.literal("ping"),
  protocolVersion: z.number().int(),
  requestId: z.string().min(1),
});

export type ClientPing = z.infer<typeof clientPingSchema>;

export const clientSelectSchema = z.object({
  type: z.literal("select"),
  protocolVersion: z.number().int(),
  requestId: z.string().min(1),
  id: z.string().min(1),
});

export type ClientSelect = z.infer<typeof clientSelectSchema>;

export const patchOpSetTextSchema = z.object({
  kind: z.literal("setText"),
  text: z.string(),
});

export const patchOpMergeTailwindSchema = z.object({
  kind: z.literal("mergeTailwindClassName"),
  classNameFragment: z.string(),
});

/** Reorder host among JSX element siblings under a flex/grid parent (Phase 4). */
export const patchOpMoveSiblingSchema = z.object({
  kind: z.literal("moveSibling"),
  direction: z.enum(["up", "down"]),
});

/** Toggle `hidden` on a string-literal className (Phase 4 toolbar). */
export const patchOpSetHiddenSchema = z.object({
  kind: z.literal("setHidden"),
  hidden: z.boolean(),
});

/** Clone the host JSX element with a new unique `data-nuvio-id` (Phase 4 toolbar). */
export const patchOpDuplicateHostSchema = z.object({
  kind: z.literal("duplicateHost"),
});

export const patchOpSchema = z.discriminatedUnion("kind", [
  patchOpSetTextSchema,
  patchOpMergeTailwindSchema,
  patchOpMoveSiblingSchema,
  patchOpSetHiddenSchema,
  patchOpDuplicateHostSchema,
]);

export type PatchOp = z.infer<typeof patchOpSchema>;

export const clientPatchApplySchema = z.object({
  type: z.literal("patchApply"),
  protocolVersion: z.number().int(),
  requestId: z.string().min(1),
  id: z.string().min(1),
  ops: z.array(patchOpSchema).min(1),
  /** When true, server validates and returns `patchAck` with `diffSummary` but does not write disk or push undo. */
  dryRun: z.boolean().optional(),
});

export type ClientPatchApply = z.infer<typeof clientPatchApplySchema>;

export const clientPatchUndoSchema = z.object({
  type: z.literal("patchUndo"),
  protocolVersion: z.number().int(),
  requestId: z.string().min(1),
});

export type ClientPatchUndo = z.infer<typeof clientPatchUndoSchema>;

export const clientMessageSchema = z.discriminatedUnion("type", [
  clientPingSchema,
  clientSelectSchema,
  clientPatchApplySchema,
  clientPatchUndoSchema,
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;

export const serverPongSchema = z.object({
  type: z.literal("pong"),
  protocolVersion: z.number().int(),
  requestId: z.string(),
});

export const serverErrorSchema = z.object({
  type: z.literal("error"),
  code: z.string(),
  message: z.string(),
  requestId: z.string().optional(),
});

export const serverIndexReadySchema = z.object({
  type: z.literal("indexReady"),
  protocolVersion: z.number().int(),
  indexVersion: z.number().int(),
  entries: z.array(indexEntrySchema),
  duplicateErrors: z.array(duplicateIdErrorSchema),
});

export type ServerIndexReady = z.infer<typeof serverIndexReadySchema>;

export const serverSelectAckSchema = z.object({
  type: z.literal("selectAck"),
  protocolVersion: z.number().int(),
  requestId: z.string(),
  id: z.string(),
  ok: z.boolean(),
  file: z.string().optional(),
  line: z.number().int().optional(),
  column: z.number().int().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
});

export type ServerSelectAck = z.infer<typeof serverSelectAckSchema>;

export const serverPatchAckSchema = z.object({
  type: z.literal("patchAck"),
  protocolVersion: z.number().int(),
  requestId: z.string(),
  id: z.string(),
  ok: z.boolean(),
  diffSummary: z.string().optional(),
  /** Present when this ack is for a `patchApply` with `dryRun: true`. */
  dryRun: z.boolean().optional(),
  /** Absolute path written on successful non-dry apply (for touched-file log). */
  writtenFile: z.string().optional(),
  /** Server undo stack size after this apply (non-dry success only). */
  undoStackDepth: z.number().int().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
});

export type ServerPatchAck = z.infer<typeof serverPatchAckSchema>;

export const serverPatchUndoAckSchema = z.object({
  type: z.literal("patchUndoAck"),
  protocolVersion: z.number().int(),
  requestId: z.string(),
  ok: z.boolean(),
  file: z.string().optional(),
  /** Remaining in-memory undo snapshots after this undo (success only). */
  undoStackDepth: z.number().int().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
});

export type ServerPatchUndoAck = z.infer<typeof serverPatchUndoAckSchema>;

export const serverMessageSchema = z.discriminatedUnion("type", [
  serverPongSchema,
  serverErrorSchema,
  serverIndexReadySchema,
  serverSelectAckSchema,
  serverPatchAckSchema,
  serverPatchUndoAckSchema,
]);

export type ServerMessage = z.infer<typeof serverMessageSchema>;

export function parseClientMessage(raw: string): ClientMessage | null {
  let json: unknown;
  try {
    json = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  const r = clientMessageSchema.safeParse(json);
  return r.success ? r.data : null;
}

export function parseServerMessage(raw: string): ServerMessage | null {
  let json: unknown;
  try {
    json = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  const r = serverMessageSchema.safeParse(json);
  return r.success ? r.data : null;
}

export function serializeServerMessage(msg: ServerMessage): string {
  return JSON.stringify(msg);
}
