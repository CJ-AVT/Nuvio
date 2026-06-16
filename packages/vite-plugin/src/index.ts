import type { IncomingMessage } from "node:http";
import fs from "node:fs";
import path from "node:path";
import type { Duplex } from "node:stream";
import type { Logger, Plugin } from "vite";
import { WebSocket } from "ws";
import { WebSocketServer } from "ws";
import { applyPatchToSource } from "@rte/ast-engine";
import { resolvePatchClassNameMode } from "./resolve-classname-mode.js";
import { detectProjectLibraries } from "./detect-libraries.js";
import { handleTagElementMessage } from "./handle-tag-element.js";
import { handleUntagElementMessage } from "./handle-untag-element.js";
import { injectJsxLocAttributes } from "./jsx-loc-transform.js";
import {
  RTE_BRAND_PATH,
  RTE_DEV_TOKEN_PATH,
  RTE_PCC_PATH,
  RTE_WS_PATH,
  PROTOCOL_VERSION,
  type DuplicateIdError,
  type IndexWireEntry,
  type RuntimeDiagnostics,
  parseClientMessage,
  serializeServerMessage,
} from "@rte/shared";
import { readRuntimeVersions } from "./read-dep-version.js";
import { assertPathWithinRoot } from "@rte/shared/secure-path";
import { pathnameFromUpgradeUrl } from "./upgrade-url.js";
import { handleBrandConfigHttp, brandConfigPath } from "./handle-brand-config.js";
import { handleDevTokenHttp } from "./handle-dev-token.js";
import { handlePccConfigHttp } from "./handle-pcc-config.js";
import {
  validateRteUpgrade,
  warnIfWideDevServerHost,
} from "./dev-auth-guard.js";
import { getOrCreateDevSessionToken } from "./dev-session-token.js";
import {
  buildSourceIndex,
  extractIdsFromSource,
  pickBestSourceIndex,
  type BuildSourceIndexResult,
} from "./source-index.js";

const APP_ENTRY_CANDIDATES = ["src/App.tsx", "src/app.tsx", "App.tsx"] as const;

function rteWsMessageToText(data: unknown): string {
  if (typeof data === "string") {
    return data;
  }
  if (Buffer.isBuffer(data)) {
    return data.toString("utf8");
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString("utf8");
  }
  if (ArrayBuffer.isView(data)) {
    const v = data as ArrayBufferView;
    return Buffer.from(v.buffer, v.byteOffset, v.byteLength).toString("utf8");
  }
  return String(data);
}

/** When glob indexing returns no ids (mis-rooted cwd, etc.), still pick up ids from the app entry file. */
function supplementIndexFromAppTsx(
  serverRoot: string,
  built: BuildSourceIndexResult,
  classNameMode: "literal-only" | "cn-basic",
  emitWarn: (msg: string) => void = console.warn,
): BuildSourceIndexResult {
  if (built.entries.length > 0) {
    return built;
  }
  for (const rel of APP_ENTRY_CANDIDATES) {
    const appTsx = path.resolve(serverRoot, rel);
    if (!fs.existsSync(appTsx)) {
      continue;
    }
    try {
      const code = fs.readFileSync(appTsx, "utf8");
      const hits = extractIdsFromSource(appTsx, code, { classNameMode });
      if (hits.length === 0) {
        continue;
      }
      emitWarn(
        `[Rte] Source index had 0 ids; supplemented from ${appTsx} (${hits.length} id(s)). ` +
          `Fix scan roots if this is unexpected.`,
      );
      return {
        ...built,
        entries: hits,
        scannedFileCount: Math.max(built.scannedFileCount, 1),
      };
    } catch {
      /* try next candidate */
    }
  }
  return built;
}

export interface RtePluginOptions {
  /** Master switch; false disables index + WS server. */
  enabled?: boolean;
  /** Glob patterns relative to Vite config root (see DEFAULT_GLOBS). */
  scanGlobs?: string[];
  /** Log client ops (no source file contents). */
  verbose?: boolean;
  /** className parsing mode: strict literals (default) or simple cn/clsx strings. */
  classNameMode?: "literal-only" | "cn-basic";
}

/**
 * Default globs relative to `root`.
 * Include monorepo layouts (`apps/` / `packages/`) so indexing still finds sources when
 * `root` resolves to the repo root (only `./src/**` would otherwise match nothing).
 */
const DEFAULT_GLOBS = [
  "src/**/*.{tsx,jsx}",
  "apps/**/src/**/*.{tsx,jsx}",
  "packages/**/src/**/*.{tsx,jsx}",
];

/**
 * Rte Vite plugin — Phase 1: WebSocket protocol + dev-time source index + selection ack.
 */
export function rte(options?: RtePluginOptions): Plugin {
  const envEnabled = process.env.RTE !== "0";
  const enabled = options?.enabled ?? envEnabled;
  const scanGlobs = options?.scanGlobs ?? DEFAULT_GLOBS;
  const verbose = options?.verbose ?? false;
  const classNameMode = options?.classNameMode ?? "literal-only";

  let indexVersion = 0;
  let cachedIndexPayload: string | null = null;
  let runtimeDiagnostics: RuntimeDiagnostics = { overlayCssMode: "self-contained" };
  const idToEntry = new Map<string, IndexWireEntry>();
  let lastDuplicateErrors: DuplicateIdError[] = [];
  let projectRoot = process.cwd();

  return {
    name: "rte",
    apply: "serve",
    config(_config, { command }) {
      if (!enabled || command !== "serve") {
        return {};
      }
      const devAuthToken = getOrCreateDevSessionToken();
      return {
        define: {
          "import.meta.env.VITE_RTE_DEV_TOKEN": JSON.stringify(devAuthToken),
        },
        server: {
          watch: {
            ignored: ["**/rte/brand.json"],
          },
        },
      };
    },
    configResolved(config) {
      if (!enabled) {
        return;
      }
      warnIfWideDevServerHost(config.server.host, (msg) => {
        config.logger.warn(msg);
      });
    },
    transform(code, id) {
      if (!enabled) {
        return null;
      }
      const norm = id.replace(/\\/g, "/");
      if (norm.includes("/packages/overlay/src/dev-token.ts")) {
        const next = code.replace(
          /return env\.env\?\.VITE_RTE_DEV_TOKEN \?\? "";/,
          'return import.meta.env.VITE_RTE_DEV_TOKEN ?? "";',
        );
        if (next !== code) {
          return { code: next, map: null };
        }
      }
      if (!id || id.includes("node_modules") || !/\.(tsx|jsx)$/.test(id)) {
        return null;
      }
      const fileAbs = path.isAbsolute(id) ? id : path.resolve(projectRoot, id);
      const { code: next, changed } = injectJsxLocAttributes(code, fileAbs, projectRoot);
      if (!changed) {
        return null;
      }
      return { code: next, map: null };
    },
    configureServer(server) {
      if (!enabled) {
        server.config.logger.info(
          "[Rte] disabled (set `RTE=1` or `rte({ enabled: true })` to enable).",
        );
        return;
      }
      const log: Logger = server.config.logger;
      const fromConfigFile =
        typeof server.config.configFile === "string"
          ? path.dirname(server.config.configFile)
          : "";
      const serverRoot = path.resolve(server.config.root);
      projectRoot = path.resolve(fromConfigFile || serverRoot);
      const rootCandidates = [
        path.resolve(fromConfigFile || serverRoot),
        serverRoot,
        process.cwd(),
      ];
      const rootsLabel = [...new Set(rootCandidates)].join(" | ");
      const devAuthToken = getOrCreateDevSessionToken();
      const wss = new WebSocketServer({ noServer: true });

      type UndoSnapshot = { file: string; contents: string };
      const undoStack: UndoSnapshot[] = [];
      const UNDO_MAX = 32;
      const pushUndoSnapshot = (file: string, contents: string): void => {
        undoStack.push({ file, contents });
        while (undoStack.length > UNDO_MAX) {
          undoStack.shift();
        }
      };

      const rebuildIndex = (): void => {
        const detectedLibraries = detectProjectLibraries(serverRoot);
        const indexOptions = { classNameMode, detectedLibraries };
        let built = pickBestSourceIndex(rootCandidates, scanGlobs, indexOptions);
        built = supplementIndexFromAppTsx(serverRoot, built, classNameMode, log.warn);
        if (built.entries.length === 0) {
          const fallback = buildSourceIndex(serverRoot, ["src/**/*.{tsx,jsx}"], indexOptions);
          if (fallback.entries.length > 0) {
            log.warn(
              `[Rte] Multi-root scan yielded 0 ids; using serverRoot-only index (${fallback.entries.length} id(s)) from ${serverRoot}.`,
            );
            built = fallback;
          }
        }
        indexVersion += 1;
        idToEntry.clear();
        for (const e of built.entries) {
          idToEntry.set(e.id, e);
        }
        lastDuplicateErrors = built.duplicateErrors;

        const versions = readRuntimeVersions(serverRoot);
        runtimeDiagnostics = {
          ...versions,
          overlayCssMode: "self-contained",
          detectedLibraries: detectedLibraries.length > 0 ? detectedLibraries : undefined,
        };

        cachedIndexPayload = serializeServerMessage({
          type: "indexReady",
          protocolVersion: PROTOCOL_VERSION,
          indexVersion,
          entries: built.entries,
          duplicateErrors: built.duplicateErrors,
          diagnostics: runtimeDiagnostics,
        });

        if (verbose) {
          if (built.parseErrors.length > 0) {
            log.warn(`[Rte] index parse issues: ${built.parseErrors.length} file(s)`);
          }
          if (built.duplicateErrors.length > 0) {
            log.warn(
              `[Rte] duplicate ids: ${built.duplicateErrors.map((d) => d.id).join(", ")}`,
            );
          }
          log.info(
            `[Rte] index roots=${rootsLabel} matchedFiles=${built.scannedFileCount} uniqueIds=${built.entries.length}`,
          );
        } else {
          log.info(
            `[Rte] index v2 — ${built.entries.length} id(s), ${built.scannedFileCount} file(s)`,
          );
        }

        if (built.scannedFileCount === 0) {
          log.warn(
            `[Rte] Source index matched 0 files for globs [${scanGlobs.join(", ")}] under roots ${rootsLabel}. ` +
              `Dev server cwd does not affect this if Vite root is correct; ensure \`data-rte-id\` lives under that root.`,
          );
        } else if (built.entries.length === 0 && built.parseErrors.length > 0) {
          const e0 = built.parseErrors[0]!;
          log.warn(
            `[Rte] Source index has 0 ids after ${built.scannedFileCount} file(s); first error: ${e0.file} — ${e0.message}`,
          );
        } else if (built.entries.length === 0 && built.duplicateErrors.length > 0) {
          log.warn(
            `[Rte] Source index: all contract ids appear duplicated — ${built.duplicateErrors.map((d) => d.id).join(", ")}`,
          );
        } else if (
          built.entries.length === 0 &&
          built.duplicateErrors.length === 0 &&
          built.parseErrors.length === 0
        ) {
          log.warn(
            `[Rte] Source index scanned ${built.scannedFileCount} file(s) under roots ${rootsLabel} but extracted 0 ids (no \`data-rte-id\` / wrapper hits).`,
          );
        }

        if (cachedIndexPayload && wss.clients.size > 0) {
          for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(cachedIndexPayload);
            }
          }
        }
      };

      const debouncedRebuild = (() => {
        let t: ReturnType<typeof setTimeout> | undefined;
        return () => {
          if (t) {
            clearTimeout(t);
          }
          t = setTimeout(() => {
            rebuildIndex();
            t = undefined;
          }, 120);
        };
      })();

      server.watcher.on("change", (file) => {
        if (!/\.(tsx|jsx)$/.test(file)) {
          return;
        }
        debouncedRebuild();
      });

      wss.on("connection", (ws) => {
        if (cachedIndexPayload && ws.readyState === WebSocket.OPEN) {
          ws.send(cachedIndexPayload);
        }

        ws.on("message", async (data) => {
          const text = rteWsMessageToText(data);
          const msg = parseClientMessage(text);
          if (!msg) {
            ws.send(
              serializeServerMessage({
                type: "error",
                code: "bad_message",
                message: "Invalid client message",
              }),
            );
            return;
          }
          if (msg.protocolVersion !== PROTOCOL_VERSION) {
            ws.send(
              serializeServerMessage({
                type: "error",
                code: "bad_version",
                message: `Expected protocolVersion ${PROTOCOL_VERSION}`,
                requestId: "requestId" in msg ? msg.requestId : undefined,
              }),
            );
            return;
          }

          if (msg.type === "ping") {
            if (verbose) {
              log.info(`[Rte] ping ${msg.requestId}`);
            }
            ws.send(
              serializeServerMessage({
                type: "pong",
                protocolVersion: PROTOCOL_VERSION,
                requestId: msg.requestId,
                diagnostics: runtimeDiagnostics,
              }),
            );
            if (cachedIndexPayload) {
              ws.send(cachedIndexPayload);
            }
            return;
          }

          if (msg.type === "select") {
            if (verbose) {
              log.info(`[Rte] select ${msg.id}`);
            }
            const entry = idToEntry.get(msg.id);
            if (!entry) {
              log.warn(`[Rte] select unknown_id: ${msg.id} (index has ${idToEntry.size} id(s))`);
              ws.send(
                serializeServerMessage({
                  type: "selectAck",
                  protocolVersion: PROTOCOL_VERSION,
                  requestId: msg.requestId,
                  id: msg.id,
                  ok: false,
                  errorCode: "unknown_id",
                  errorMessage: "Id not found in dev source index",
                }),
              );
              return;
            }
            ws.send(
              serializeServerMessage({
                type: "selectAck",
                protocolVersion: PROTOCOL_VERSION,
                requestId: msg.requestId,
                id: msg.id,
                ok: true,
                file: entry.file,
                line: entry.line,
                column: entry.column,
                patchHostId: entry.patchHostId,
                primaryTextTargetKey: entry.primaryTextTargetKey,
                textTargets: entry.textTargets,
                styleTargets: entry.styleTargets,
                hierarchyRole: entry.hierarchyRole,
                parentHostId: entry.parentHostId,
                childTargetIds: entry.childTargetIds,
                rowTargets: entry.rowTargets,
                tableMeta: entry.tableMeta,
                tableDataField: entry.tableDataField,
              }),
            );
            return;
          }

          if (msg.type === "tagElement") {
            const writeGuardRoot = path.resolve(fromConfigFile || serverRoot);
            await handleTagElementMessage(ws, msg, {
              writeGuardRoot,
              projectRoot,
              idToEntry,
              duplicateIds: lastDuplicateErrors,
              onIndexRebuilt: debouncedRebuild,
            });
            return;
          }

          if (msg.type === "untagElement") {
            const writeGuardRoot = path.resolve(fromConfigFile || serverRoot);
            await handleUntagElementMessage(ws, msg, {
              writeGuardRoot,
              projectRoot,
              idToEntry,
              onIndexRebuilt: debouncedRebuild,
            });
            return;
          }

          if (msg.type === "patchUndo") {
            const writeGuardRoot = path.resolve(fromConfigFile || serverRoot);
            const last = undoStack.pop();
            if (!last) {
              ws.send(
                serializeServerMessage({
                  type: "patchUndoAck",
                  protocolVersion: PROTOCOL_VERSION,
                  requestId: msg.requestId,
                  ok: false,
                  errorCode: "empty_stack",
                  errorMessage: "Nothing to undo",
                }),
              );
              return;
            }
            try {
              assertPathWithinRoot(writeGuardRoot, last.file);
              fs.writeFileSync(last.file, last.contents, "utf8");
            } catch (e) {
              undoStack.push(last);
              ws.send(
                serializeServerMessage({
                  type: "patchUndoAck",
                  protocolVersion: PROTOCOL_VERSION,
                  requestId: msg.requestId,
                  ok: false,
                  errorCode: "undo_write_error",
                  errorMessage: String(e),
                }),
              );
              return;
            }
            log.info(`[Rte] undo restored ${last.file}`);
            ws.send(
              serializeServerMessage({
                type: "patchUndoAck",
                protocolVersion: PROTOCOL_VERSION,
                requestId: msg.requestId,
                ok: true,
                file: last.file,
                undoStackDepth: undoStack.length,
              }),
            );
            return;
          }

          if (msg.type === "patchApply") {
            const entry = idToEntry.get(msg.id);
            const writeGuardRoot = path.resolve(fromConfigFile || serverRoot);
            const dryRun = msg.dryRun === true;
            const patchAckExtras = dryRun ? ({ dryRun: true as const } as const) : {};
            if (!entry) {
              log.warn(`[Rte] patch unknown_id: ${msg.id} (index has ${idToEntry.size} id(s))`);
              ws.send(
                serializeServerMessage({
                  type: "patchAck",
                  protocolVersion: PROTOCOL_VERSION,
                  requestId: msg.requestId,
                  id: msg.id,
                  ok: false,
                  errorCode: "unknown_id",
                  errorMessage: "Id not found in dev source index",
                  ...patchAckExtras,
                }),
              );
              return;
            }
            try {
              assertPathWithinRoot(writeGuardRoot, entry.file);
            } catch (e) {
              ws.send(
                serializeServerMessage({
                  type: "patchAck",
                  protocolVersion: PROTOCOL_VERSION,
                  requestId: msg.requestId,
                  id: msg.id,
                  ok: false,
                  errorCode: "path_escape",
                  errorMessage: String(e),
                  ...patchAckExtras,
                }),
              );
              return;
            }
            let source: string;
            try {
              source = fs.readFileSync(entry.file, "utf8");
            } catch (e) {
              ws.send(
                serializeServerMessage({
                  type: "patchAck",
                  protocolVersion: PROTOCOL_VERSION,
                  requestId: msg.requestId,
                  id: msg.id,
                  ok: false,
                  errorCode: "read_error",
                  errorMessage: String(e),
                  ...patchAckExtras,
                }),
              );
              return;
            }
            const result = await applyPatchToSource(source, entry.file, msg.id, msg.ops, {
              classNameMode: resolvePatchClassNameMode(entry, classNameMode),
              activeBreakpoint: msg.activeBreakpoint,
            });
            if (!result.ok) {
              ws.send(
                serializeServerMessage({
                  type: "patchAck",
                  protocolVersion: PROTOCOL_VERSION,
                  requestId: msg.requestId,
                  id: msg.id,
                  ok: false,
                  errorCode: result.code,
                  errorMessage: result.message,
                  ...patchAckExtras,
                }),
              );
              return;
            }
            if (dryRun) {
              ws.send(
                serializeServerMessage({
                  type: "patchAck",
                  protocolVersion: PROTOCOL_VERSION,
                  requestId: msg.requestId,
                  id: msg.id,
                  ok: true,
                  diffSummary: result.diffSummary,
                  dryRun: true,
                }),
              );
              if (verbose) {
                log.info(`[Rte] patchPreview ${msg.id} ${msg.ops.map((o) => o.kind).join(",")}`);
              }
              return;
            }
            try {
              fs.writeFileSync(entry.file, result.source, "utf8");
            } catch (e) {
              ws.send(
                serializeServerMessage({
                  type: "patchAck",
                  protocolVersion: PROTOCOL_VERSION,
                  requestId: msg.requestId,
                  id: msg.id,
                  ok: false,
                  errorCode: "write_error",
                  errorMessage: String(e),
                }),
              );
              return;
            }
            pushUndoSnapshot(entry.file, source);
            log.info(`[Rte] touched ${entry.file}`);
            ws.send(
              serializeServerMessage({
                type: "patchAck",
                protocolVersion: PROTOCOL_VERSION,
                requestId: msg.requestId,
                id: msg.id,
                ok: true,
                diffSummary: result.diffSummary,
                writtenFile: entry.file,
                undoStackDepth: undoStack.length,
              }),
            );
            if (verbose) {
              log.info(`[Rte] patchApply ${msg.id} ${msg.ops.map((o) => o.kind).join(",")}`);
            }
            return;
          }
        });
      });

      server.httpServer?.on(
        "upgrade",
        (request: IncomingMessage, socket: Duplex, head: Buffer) => {
          const pathname = pathnameFromUpgradeUrl(request.url);
          if (pathname !== RTE_WS_PATH) {
            return;
          }
          if (!validateRteUpgrade(request, devAuthToken)) {
            socket.destroy();
            return;
          }
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit("connection", ws, request);
          });
        },
      );

      const writeGuardRoot = path.resolve(fromConfigFile || serverRoot);
      const brandFile = path.resolve(brandConfigPath(projectRoot));
      if (fs.existsSync(brandFile)) {
        server.watcher.unwatch(brandFile);
      }
      server.watcher.on("add", (file) => {
        if (path.resolve(file) === brandFile) {
          server.watcher.unwatch(file);
        }
      });

      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";
        const pathname = url.split("?")[0] ?? "";
        if (pathname === RTE_DEV_TOKEN_PATH) {
          handleDevTokenHttp(req, res, devAuthToken);
          return;
        }
        if (pathname === RTE_PCC_PATH) {
          void handlePccConfigHttp(req, res, {
            projectRoot,
            writeGuardRoot,
          });
          return;
        }
        if (pathname !== RTE_BRAND_PATH) {
          next();
          return;
        }
        void handleBrandConfigHttp(req, res, {
          projectRoot,
          writeGuardRoot,
          devAuthToken,
        });
      });

      rebuildIndex();
    },
  };
}
