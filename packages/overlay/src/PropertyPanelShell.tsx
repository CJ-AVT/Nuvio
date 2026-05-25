import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type ReactElement,
  type RefObject,
} from "react";
import type { IndexWireEntry, PatchOp } from "@nuvio/shared";
import type { Point } from "./overlay-chrome-storage.js";
import { useChromeDrag } from "./useChromeDrag.js";
import {
  EMPTY_ALPHA_PICKS,
  buildAlphaPatchOps,
  type AlphaStylePicks,
} from "./alpha-patch-ops.js";
import {
  alphaPicksDiffer,
  readAlphaPicksFromElement,
} from "./read-alpha-picks.js";
import { ComponentTree } from "./ComponentTree.js";
import { escapeAttrSelector } from "./nuvio-dom.js";
import {
  NUVO_GLASS_FRAME,
  NUVO_GLASS_HEADER,
  NUVO_GLASS_SECTION,
  NUVO_GLASS_SURFACE_STYLE,
} from "./overlay-chrome-classes.js";
import {
  buildDuplicateOp,
  buildHideOp,
  buildMoveSiblingOp,
  buildShowOp,
} from "./structural-patch-ops.js";
import {
  formatPatchUserMessage,
  getIndexedSiblingMoveAvailability,
} from "./sibling-move.js";
import { ColorPickerRow } from "./ColorPickerRow.js";
import { BACKGROUND_COLOR_OPTIONS, TEXT_COLOR_OPTIONS } from "./tailwind-color-options.js";

export type PropertyPanelShellProps = {
  selectedId: string | null;
  resolvedFile: string | undefined;
  resolvedLine: number | undefined;
  /** From server `indexReady`; must be greater than 0 for patchApply to resolve ids. */
  indexIdCount: number;
  selectError: string | null;
  channelReady: boolean;
  previewSummary: string | null;
  previewError: string | null;
  lastPatchError: string | null;
  stagedVersion: number;
  previewValidatedFingerprint: string | null;
  /** Ops from the last successful Validate (style or structural). */
  previewValidatedOps: readonly PatchOp[] | null;
  /** Latest validate was started from Layout & structure (not style Validate). */
  structuralPreviewActive: boolean;
  undoStackDepth: number;
  previewBusy: boolean;
  onStagedPatchFingerprint: (fingerprint: string) => void;
  onRequestPreview: (ops: PatchOp[]) => void;
  onRequestApply: (ops: PatchOp[]) => void;
  onRequestUndo: () => void;
  onCancelPreview: () => void;
  shellRef: RefObject<HTMLElement | null>;
  panelCollapsed: boolean;
  panelPosition: Point | null;
  onPanelCollapsedChange: (collapsed: boolean) => void;
  onPanelPositionChange: (position: Point | null) => void;
  indexEntries: readonly IndexWireEntry[];
  onSelectIndexedId: (id: string) => void;
  /** Validate/apply structural ops (move, hide, duplicate) without mixing style staging. */
  onRequestStructuralPreview: (ops: PatchOp[]) => void;
};

function assignShellRef(
  shellRef: RefObject<HTMLElement | null>,
  el: HTMLElement | null,
): void {
  (shellRef as MutableRefObject<HTMLElement | null>).current = el;
}

function SelectRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}): ReactElement {
  return (
    <label className="grid grid-cols-[minmax(0,6.5rem)_1fr] items-center gap-x-2 gap-y-1">
      <span className="text-xs text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-slate-600 bg-slate-950 px-2 py-1 text-xs text-slate-100"
      >
        {options.map((o) => (
          <option key={o.value || "__none"} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PropertyPanelShell({
  selectedId,
  resolvedFile,
  resolvedLine,
  indexIdCount,
  selectError,
  channelReady,
  previewSummary,
  previewError,
  lastPatchError,
  stagedVersion,
  previewValidatedFingerprint,
  previewValidatedOps,
  structuralPreviewActive,
  undoStackDepth,
  previewBusy,
  onStagedPatchFingerprint,
  onRequestPreview,
  onRequestApply,
  onRequestUndo,
  onCancelPreview,
  shellRef,
  panelCollapsed,
  panelPosition,
  onPanelCollapsedChange,
  onPanelPositionChange,
  indexEntries,
  onSelectIndexedId,
  onRequestStructuralPreview,
}: PropertyPanelShellProps): ReactElement {
  const internalShellRef = useRef<HTMLElement | null>(null);
  const [missing, setMissing] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [baselineText, setBaselineText] = useState("");
  const [baselinePicks, setBaselinePicks] = useState<AlphaStylePicks>(EMPTY_ALPHA_PICKS);
  const [picks, setPicks] = useState<AlphaStylePicks>(EMPTY_ALPHA_PICKS);
  const selectedIdRef = useRef<string | null>(selectedId);
  selectedIdRef.current = selectedId;

  const setShellElement = useCallback(
    (el: HTMLElement | null) => {
      internalShellRef.current = el;
      assignShellRef(shellRef, el);
    },
    [shellRef],
  );

  const [livePanelPosition, setLivePanelPosition] = useState<Point | null>(panelPosition);

  const { dragging: panelDragging, onHeaderPointerDown } = useChromeDrag({
    shellRef: internalShellRef,
    enabled: !panelCollapsed,
    position: livePanelPosition,
    setPosition: (next) => {
      if (next) {
        setLivePanelPosition(next);
      }
    },
    onDragEnd: onPanelPositionChange,
  });

  useEffect(() => {
    if (!panelDragging) {
      setLivePanelPosition(panelPosition);
    }
  }, [panelPosition, panelDragging]);

  const displayPanelPosition = livePanelPosition;

  const tabOnRight =
    displayPanelPosition != null &&
    typeof window !== "undefined" &&
    displayPanelPosition.x > window.innerWidth / 2;

  useEffect(() => {
    if (!selectedId) {
      setMissing(false);
      return;
    }
    const el = document.querySelector(`[data-nuvio-id="${escapeAttrSelector(selectedId)}"]`);
    setMissing(!(el instanceof HTMLElement));
  }, [selectedId]);

  const syncFromSelectedElement = useCallback((): void => {
    const id = selectedIdRef.current;
    if (!id) {
      return;
    }
    const el = document.querySelector(`[data-nuvio-id="${escapeAttrSelector(id)}"]`);
    if (!(el instanceof HTMLElement)) {
      return;
    }
    const text = (el.textContent ?? "").trim();
    const fromClass = readAlphaPicksFromElement(el);
    setBaselineText(text);
    setDraftText(text);
    setBaselinePicks(fromClass);
    setPicks(fromClass);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDraftText("");
      setBaselineText("");
      setBaselinePicks(EMPTY_ALPHA_PICKS);
      setPicks(EMPTY_ALPHA_PICKS);
      return;
    }
    syncFromSelectedElement();
  }, [selectedId, syncFromSelectedElement]);

  /** After Apply/Undo, Vite HMR may update the DOM a tick later; resync draft from the live node. */
  useEffect(() => {
    if (stagedVersion === 0) {
      return;
    }
    const id = selectedIdRef.current;
    if (!id) {
      return;
    }
    const t = window.setTimeout(syncFromSelectedElement, 280);
    return () => window.clearTimeout(t);
  }, [stagedVersion, syncFromSelectedElement]);

  const stagedOps = useMemo(
    () => buildAlphaPatchOps(baselineText, draftText, baselinePicks, picks),
    [baselineText, draftText, baselinePicks, picks],
  );

  const stagedOpsFingerprint = useMemo(() => JSON.stringify(stagedOps), [stagedOps]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    onStagedPatchFingerprint(stagedOpsFingerprint);
  }, [selectedId, stagedOpsFingerprint, onStagedPatchFingerprint]);

  const hasStagedOps =
    draftText !== baselineText || alphaPicksDiffer(picks, baselinePicks);
  const selectionResolved = Boolean(resolvedFile);
  const patchBlockedReason =
    indexIdCount === 0
      ? "Source index has 0 ids — the dev server cannot map data-nuvio-id to files. Run pnpm dev from the repo root (builds packages), then hard-refresh. Check the terminal for [Nuvio] index warnings."
      : selectedId && !selectionResolved
        ? selectError ??
          "Server did not confirm this id (no source file). Patches stay disabled until selection succeeds."
        : null;
  const previewApplyMismatch =
    hasStagedOps &&
    selectionResolved &&
    channelReady &&
    indexIdCount > 0 &&
    (!previewSummary ||
      previewError != null ||
      previewValidatedFingerprint !== stagedOpsFingerprint);
  const patchActionsDisabled =
    !channelReady || !hasStagedOps || indexIdCount === 0 || !selectionResolved;
  /** Structural ops (move/hide/duplicate) do not require style/text staging. */
  const structuralActionsDisabled =
    !channelReady ||
    indexIdCount === 0 ||
    !selectedId ||
    !selectionResolved ||
    missing;
  const applyReady =
    channelReady &&
    indexIdCount > 0 &&
    selectionResolved &&
    previewValidatedOps != null &&
    previewValidatedOps.length > 0 &&
    previewValidatedFingerprint != null &&
    !previewError &&
    !previewBusy;
  const applyDisabled = !applyReady;
  const [siblingMove, setSiblingMove] = useState(() => ({
    canMoveUp: false,
    canMoveDown: false,
    peerCount: 0,
  }));

  useLayoutEffect(() => {
    if (!selectedId || missing) {
      setSiblingMove({ canMoveUp: false, canMoveDown: false, peerCount: 0 });
      return;
    }
    setSiblingMove(getIndexedSiblingMoveAvailability(selectedId));
  }, [selectedId, missing, stagedVersion]);

  const structuralPreviewMessage = structuralPreviewActive
    ? formatPatchUserMessage(previewError)
    : null;
  const structuralPreviewOk =
    structuralPreviewActive && !previewError && previewSummary ? previewSummary : null;

  const fontSizeOpts = [
    { value: "", label: "—" },
    { value: "text-sm", label: "text-sm" },
    { value: "text-base", label: "text-base" },
    { value: "text-lg", label: "text-lg" },
    { value: "text-xl", label: "text-xl" },
    { value: "text-2xl", label: "text-2xl" },
  ];
  const fontWeightOpts = [
    { value: "", label: "—" },
    { value: "font-medium", label: "font-medium" },
    { value: "font-semibold", label: "font-semibold" },
    { value: "font-bold", label: "font-bold" },
  ];
  const roundedOpts = [
    { value: "", label: "—" },
    { value: "rounded-md", label: "rounded-md" },
    { value: "rounded-lg", label: "rounded-lg" },
    { value: "rounded-xl", label: "rounded-xl" },
    { value: "rounded-full", label: "rounded-full" },
  ];
  const padOpts = [
    { value: "", label: "—" },
    { value: "p-2", label: "p-2" },
    { value: "p-4", label: "p-4" },
    { value: "p-6", label: "p-6" },
    { value: "px-4 py-2", label: "px-4 py-2" },
  ];
  const marginOpts = [
    { value: "", label: "—" },
    { value: "m-2", label: "m-2" },
    { value: "m-4", label: "m-4" },
    { value: "mx-auto", label: "mx-auto" },
    { value: "mt-4", label: "mt-4" },
    { value: "mb-4", label: "mb-4" },
  ];
  const textAlignOpts = [
    { value: "", label: "—" },
    { value: "text-left", label: "text-left" },
    { value: "text-center", label: "text-center" },
    { value: "text-right", label: "text-right" },
    { value: "text-justify", label: "text-justify" },
  ];
  const gapOpts = [
    { value: "", label: "—" },
    { value: "gap-1", label: "gap-1" },
    { value: "gap-2", label: "gap-2" },
    { value: "gap-4", label: "gap-4" },
    { value: "gap-6", label: "gap-6" },
    { value: "gap-8", label: "gap-8" },
  ];
  const widthOpts = [
    { value: "", label: "—" },
    { value: "w-auto", label: "w-auto" },
    { value: "w-full", label: "w-full" },
    { value: "w-1/2", label: "w-1/2" },
    { value: "w-1/3", label: "w-1/3" },
    { value: "w-2/3", label: "w-2/3" },
    { value: "w-1/4", label: "w-1/4" },
    { value: "w-3/4", label: "w-3/4" },
  ];
  const maxWidthOpts = [
    { value: "", label: "—" },
    { value: "max-w-sm", label: "max-w-sm" },
    { value: "max-w-md", label: "max-w-md" },
    { value: "max-w-lg", label: "max-w-lg" },
    { value: "max-w-xl", label: "max-w-xl" },
    { value: "max-w-2xl", label: "max-w-2xl" },
    { value: "max-w-4xl", label: "max-w-4xl" },
    { value: "max-w-prose", label: "max-w-prose" },
    { value: "max-w-full", label: "max-w-full" },
  ];
  const heightOpts = [
    { value: "", label: "—" },
    { value: "h-auto", label: "h-auto" },
    { value: "h-full", label: "h-full" },
    { value: "h-8", label: "h-8" },
    { value: "h-12", label: "h-12" },
    { value: "h-16", label: "h-16" },
    { value: "h-24", label: "h-24" },
    { value: "h-screen", label: "h-screen" },
  ];
  const minHeightOpts = [
    { value: "", label: "—" },
    { value: "min-h-0", label: "min-h-0" },
    { value: "min-h-full", label: "min-h-full" },
    { value: "min-h-screen", label: "min-h-screen" },
    { value: "min-h-16", label: "min-h-16" },
    { value: "min-h-24", label: "min-h-24" },
  ];
  const opacityOpts = [
    { value: "", label: "—" },
    { value: "opacity-0", label: "opacity-0" },
    { value: "opacity-25", label: "opacity-25" },
    { value: "opacity-50", label: "opacity-50" },
    { value: "opacity-75", label: "opacity-75" },
    { value: "opacity-100", label: "opacity-100" },
  ];
  const shadowOpts = [
    { value: "", label: "—" },
    { value: "shadow-none", label: "shadow-none" },
    { value: "shadow-sm", label: "shadow-sm" },
    { value: "shadow", label: "shadow" },
    { value: "shadow-md", label: "shadow-md" },
    { value: "shadow-lg", label: "shadow-lg" },
    { value: "shadow-xl", label: "shadow-xl" },
  ];

  if (panelCollapsed) {
    return (
      <button
        type="button"
        ref={(el) => setShellElement(el)}
        className={`pointer-events-auto fixed z-[9998] rounded-2xl px-2 py-3 text-xs font-semibold text-slate-100 ${NUVO_GLASS_FRAME} ${
          tabOnRight ? "right-4 top-1/2 -translate-y-1/2" : "left-4 top-1/2 -translate-y-1/2"
        }`}
        style={{
          ...NUVO_GLASS_SURFACE_STYLE,
          ...(displayPanelPosition
            ? {
                left: tabOnRight ? undefined : displayPanelPosition.x,
                right: tabOnRight
                  ? window.innerWidth - displayPanelPosition.x - 40
                  : undefined,
                top: displayPanelPosition.y,
                transform: "none",
              }
            : {}),
        }}
        title="Expand Editor panel"
        onClick={() => onPanelCollapsedChange(false)}
      >
        <span className={tabOnRight ? "" : "inline-block -scale-x-100"} aria-hidden="true">
          ›
        </span>
        <span className="sr-only">Expand Editor</span>
      </button>
    );
  }

  const docked = displayPanelPosition === null;
  const panelStyle: CSSProperties | undefined = docked
    ? undefined
    : {
        left: displayPanelPosition.x,
        top: displayPanelPosition.y,
        maxHeight: "min(calc(100vh - 2rem), 720px)",
        height: "min(calc(100vh - 2rem), 720px)",
      };

  return (
    <aside
      ref={setShellElement}
      style={{ ...NUVO_GLASS_SURFACE_STYLE, ...panelStyle }}
      className={`pointer-events-auto fixed z-[9998] flex w-[min(100vw-2rem,20rem)] flex-col overflow-hidden rounded-2xl text-sm text-slate-100 ${NUVO_GLASS_FRAME} ${
        docked ? "left-4 top-4 max-h-[calc(100vh-2rem)]" : ""
      } ${panelDragging ? "select-none" : ""}`}
    >
      <header
        className={`flex shrink-0 items-center gap-2 px-3 py-2 ${NUVO_GLASS_HEADER} ${
          panelDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={onHeaderPointerDown}
      >
        <span className="min-w-0 flex-1 font-semibold">Editor</span>
        <button
          type="button"
          className="shrink-0 rounded px-1.5 py-0.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          title="Collapse panel"
          aria-label="Collapse Editor panel"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onPanelCollapsedChange(true)}
        >
          −
        </button>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
        {selectedId ? (
          <p className="text-xs text-slate-400">
            <span className="font-mono text-sky-300/95">{selectedId}</span>
            {resolvedFile ? (
              <span className="text-slate-500">
                {" "}
                ·{" "}
                <span className="font-mono text-slate-300">
                  {resolvedFile}
                  {resolvedLine != null ? `:${resolvedLine}` : ""}
                </span>
              </span>
            ) : null}
          </p>
        ) : (
          <p className="text-xs text-slate-500">Select an element on the page.</p>
        )}
        {indexIdCount === 0 ? (
          <p className="text-xs text-amber-200/90">Index empty — restart dev server.</p>
        ) : null}
        {selectedId && !resolvedFile && selectError ? (
          <p className="text-xs text-red-300/95">{selectError}</p>
        ) : null}

        {selectedId && missing ? (
          <p className="text-xs text-amber-300/90">
            No matching <span className="font-mono">data-nuvio-id</span> node in the document.
          </p>
        ) : null}

        {selectedId && !missing ? (
          <section className={`space-y-2 p-2 ${NUVO_GLASS_SECTION}`}>
            <h3 className="text-xs font-medium text-slate-400">Structure</h3>
            {previewBusy && structuralPreviewActive ? (
              <p className="text-[11px] text-sky-200/90">Updating layout…</p>
            ) : null}
            {structuralPreviewMessage ? (
              <p className="rounded border border-red-800/70 bg-red-950/50 px-2 py-1.5 text-xs text-red-200">
                {structuralPreviewMessage}
              </p>
            ) : null}
            {structuralPreviewOk ? (
              <p className="rounded border border-emerald-700/50 bg-emerald-950/25 px-2 py-1.5 font-mono text-[11px] text-emerald-100/95">
                {structuralPreviewOk}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={structuralActionsDisabled || !siblingMove.canMoveUp}
                title={
                  siblingMove.canMoveUp
                    ? "Move earlier in source / left in row"
                    : "Already first in this row"
                }
                className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-100 enabled:hover:bg-slate-600 disabled:opacity-40"
                onClick={() => onRequestStructuralPreview(buildMoveSiblingOp("up"))}
              >
                Move up
              </button>
              <button
                type="button"
                disabled={structuralActionsDisabled || !siblingMove.canMoveDown}
                title={
                  siblingMove.canMoveDown
                    ? "Move later in source / right in row"
                    : "Already last in this row"
                }
                className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-100 enabled:hover:bg-slate-600 disabled:opacity-40"
                onClick={() => onRequestStructuralPreview(buildMoveSiblingOp("down"))}
              >
                Move down
              </button>
              <button
                type="button"
                disabled={structuralActionsDisabled}
                className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-100 enabled:hover:bg-slate-600 disabled:opacity-40"
                onClick={() => onRequestStructuralPreview(buildHideOp())}
              >
                Hide
              </button>
              <button
                type="button"
                disabled={structuralActionsDisabled}
                className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-100 enabled:hover:bg-slate-600 disabled:opacity-40"
                onClick={() => onRequestStructuralPreview(buildShowOp())}
              >
                Show
              </button>
              <button
                type="button"
                disabled={structuralActionsDisabled}
                className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-100 enabled:hover:bg-slate-600 disabled:opacity-40"
                onClick={() => onRequestStructuralPreview(buildDuplicateOp())}
              >
                Duplicate
              </button>
            </div>
          </section>
        ) : null}

        {selectedId && !missing ? (
          <section className={`space-y-2 p-2 ${NUVO_GLASS_SECTION}`}>
            <h3 className="text-xs font-medium text-slate-400">Style</h3>
            {previewBusy ? (
              <p className="rounded border border-sky-800/50 bg-sky-950/40 px-2 py-1.5 text-[11px] text-sky-100/95">
                Validating patch with the dev server…
              </p>
            ) : null}
            {lastPatchError ? (
              <p className="rounded border border-red-800/70 bg-red-950/50 px-2 py-1.5 text-xs text-red-200">
                {lastPatchError}
              </p>
            ) : null}
            {previewError && !structuralPreviewActive ? (
              <p className="rounded border border-red-800/70 bg-red-950/50 px-2 py-1.5 text-xs text-red-200">
                {formatPatchUserMessage(previewError)}
              </p>
            ) : null}
            {patchBlockedReason ? (
              <p className="rounded border border-amber-800/60 bg-amber-950/40 px-2 py-1.5 text-xs text-amber-100/95">
                {patchBlockedReason}
              </p>
            ) : null}
            {hasStagedOps && !patchBlockedReason && previewApplyMismatch ? (
              <p className="rounded border border-slate-600/80 bg-slate-900/60 px-2 py-1.5 text-[11px] leading-snug text-slate-300">
                Run <span className="font-medium text-slate-200">Validate</span> after each edit so
                the summary matches what you apply.
              </p>
            ) : null}
            <label className="block space-y-1">
              <span className="text-xs text-slate-500">Text</span>
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                rows={2}
                className="w-full resize-y rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-xs text-slate-100"
              />
            </label>
            <div className="space-y-2 pt-1">
              <SelectRow
                label="Font size"
                value={picks.fontSize}
                onChange={(v) => setPicks((p) => ({ ...p, fontSize: v }))}
                options={fontSizeOpts}
              />
              <SelectRow
                label="Weight"
                value={picks.fontWeight}
                onChange={(v) => setPicks((p) => ({ ...p, fontWeight: v }))}
                options={fontWeightOpts}
              />
              <ColorPickerRow
                label="Text color"
                value={picks.textColor}
                onChange={(v) => setPicks((p) => ({ ...p, textColor: v }))}
                options={TEXT_COLOR_OPTIONS}
                utilityPrefix="text"
              />
              <ColorPickerRow
                label="Background"
                value={picks.bgColor}
                onChange={(v) => setPicks((p) => ({ ...p, bgColor: v }))}
                options={BACKGROUND_COLOR_OPTIONS}
                utilityPrefix="bg"
              />
              <SelectRow
                label="Radius"
                value={picks.rounded}
                onChange={(v) => setPicks((p) => ({ ...p, rounded: v }))}
                options={roundedOpts}
              />
              <SelectRow
                label="Padding"
                value={picks.padding}
                onChange={(v) => setPicks((p) => ({ ...p, padding: v }))}
                options={padOpts}
              />
              <SelectRow
                label="Margin"
                value={picks.margin}
                onChange={(v) => setPicks((p) => ({ ...p, margin: v }))}
                options={marginOpts}
              />
              <p className="pt-1 text-[10px] font-medium text-slate-500">Layout & effects</p>
              <SelectRow
                label="Text align"
                value={picks.textAlign}
                onChange={(v) => setPicks((p) => ({ ...p, textAlign: v }))}
                options={textAlignOpts}
              />
              <SelectRow
                label="Gap"
                value={picks.gap}
                onChange={(v) => setPicks((p) => ({ ...p, gap: v }))}
                options={gapOpts}
              />
              <SelectRow
                label="Width"
                value={picks.width}
                onChange={(v) => setPicks((p) => ({ ...p, width: v }))}
                options={widthOpts}
              />
              <SelectRow
                label="Max width"
                value={picks.maxWidth}
                onChange={(v) => setPicks((p) => ({ ...p, maxWidth: v }))}
                options={maxWidthOpts}
              />
              <SelectRow
                label="Height"
                value={picks.height}
                onChange={(v) => setPicks((p) => ({ ...p, height: v }))}
                options={heightOpts}
              />
              <SelectRow
                label="Min height"
                value={picks.minHeight}
                onChange={(v) => setPicks((p) => ({ ...p, minHeight: v }))}
                options={minHeightOpts}
              />
              <SelectRow
                label="Opacity"
                value={picks.opacity}
                onChange={(v) => setPicks((p) => ({ ...p, opacity: v }))}
                options={opacityOpts}
              />
              <SelectRow
                label="Shadow"
                value={picks.shadow}
                onChange={(v) => setPicks((p) => ({ ...p, shadow: v }))}
                options={shadowOpts}
              />
            </div>
            {previewSummary && !structuralPreviewActive ? (
              <div className="rounded border border-emerald-700/50 bg-emerald-950/25 p-2 ring-1 ring-emerald-500/20">
                <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-400/90">
                  Validated change
                </p>
                <p className="mt-1 font-mono text-[11px] leading-snug text-emerald-100/95">{previewSummary}</p>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                disabled={patchActionsDisabled}
                className="rounded bg-slate-700 px-2 py-1 text-xs font-medium text-slate-100 enabled:hover:bg-slate-600 disabled:opacity-40"
                onClick={() => onRequestPreview(stagedOps)}
              >
                Validate
              </button>
              <button
                type="button"
                disabled={applyDisabled}
                className="rounded bg-sky-700 px-2 py-1 text-xs font-medium text-white enabled:hover:bg-sky-600 disabled:opacity-40"
                onClick={() => {
                  if (previewValidatedOps?.length) {
                    onRequestApply([...previewValidatedOps]);
                  }
                }}
              >
                Apply
              </button>
              <button
                type="button"
                disabled={!channelReady || undoStackDepth <= 0}
                className="rounded bg-slate-700 px-2 py-1 text-xs font-medium text-slate-100 enabled:hover:bg-slate-600 disabled:opacity-40"
                onClick={() => onRequestUndo()}
              >
                Undo last
              </button>
              <button
                type="button"
                className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
                onClick={() => onCancelPreview()}
              >
                Cancel
              </button>
            </div>
          </section>
        ) : null}

        <ComponentTree
          entries={indexEntries}
          selectedId={selectedId}
          onSelectId={onSelectIndexedId}
        />
      </div>
    </aside>
  );
}
