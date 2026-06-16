import type { DuplicateIdError, IndexWireEntry, RuntimeDiagnostics } from "@rte/shared";
import type { ReactElement } from "react";
import {
  formatSelectionTitle,
  getSimpleChipIndexedLabel,
  getSimpleDuplicateWarning,
  getSimpleIndexEmptyMessage,
  getSimpleSelectErrorMessage,
} from "./selection-summary.js";

export type RteChannelState = "idle" | "connecting" | "ready" | "error";

function statusDotClass(channel: RteChannelState, indexedCount: number): string {
  if (indexedCount === 0 && channel === "ready") {
    return "rte-status-dot rte-status-dot--warn";
  }
  if (channel === "ready") {
    return "rte-status-dot rte-status-dot--connected";
  }
  if (channel === "connecting") {
    return "rte-status-dot rte-status-dot--connecting";
  }
  if (channel === "error") {
    return "rte-status-dot rte-status-dot--error";
  }
  return "rte-status-dot rte-status-dot--idle";
}

function statusLabel(channel: RteChannelState, channelLabel: string): string {
  if (channel === "ready") {
    return channelLabel === "connected" ? "Connected" : channelLabel;
  }
  if (channel === "connecting") {
    return "Connecting";
  }
  if (channel === "error") {
    return "Error";
  }
  return "Offline";
}

/** Stack versions row for the Editor panel only. */
export function EditorStackVersions({
  diagnostics,
}: {
  diagnostics: RuntimeDiagnostics | null;
}): ReactElement | null {
  const hasVersions =
    diagnostics?.viteVersion || diagnostics?.reactVersion || diagnostics?.tailwindVersion;
  const hasLibraries = (diagnostics?.detectedLibraries?.length ?? 0) > 0;
  if (!hasVersions && !hasLibraries) {
    return null;
  }
  return (
    <p className="rte-editor-versions">
      {diagnostics?.viteVersion ? `Vite ${diagnostics.viteVersion}` : null}
      {diagnostics?.viteVersion && diagnostics?.reactVersion ? " · " : null}
      {diagnostics?.reactVersion ? `React ${diagnostics.reactVersion}` : null}
      {(diagnostics?.viteVersion || diagnostics?.reactVersion) && diagnostics?.tailwindVersion
        ? " · "
        : null}
      {diagnostics?.tailwindVersion ? `Tailwind ${diagnostics.tailwindVersion}` : null}
      {(hasVersions && hasLibraries) ? " · " : null}
      {hasLibraries ? `Libraries: ${diagnostics!.detectedLibraries!.join(", ")}` : null}
    </p>
  );
}

/** Compact chip status — no duplicate Rte / Editing labels. */
export function RteChipStatus({
  channel,
  channelLabel,
  indexedCount,
  duplicateErrors,
  selectedId,
  selectedEntry,
  indexEntries,
  selectError,
  developerDetails,
}: {
  channel: RteChannelState;
  channelLabel: string;
  indexedCount: number;
  duplicateErrors: readonly DuplicateIdError[];
  selectedId: string | null;
  selectedEntry?: IndexWireEntry;
  indexEntries?: readonly IndexWireEntry[];
  selectError: string | null;
  developerDetails: boolean;
}): ReactElement {
  const status = statusLabel(channel, channelLabel);
  const warnings: string[] = [];

  if (developerDetails) {
    if (indexedCount === 0 && channel === "ready") {
      warnings.push("0 ids — add data-rte-id to editable nodes");
    }
    if (duplicateErrors.length > 0) {
      warnings.push(`Duplicate ids: ${duplicateErrors.map((d) => d.id).join(", ")}`);
    }
    if (selectError) {
      warnings.push(selectError);
    }
  } else {
    if (indexedCount === 0 && channel === "ready") {
      warnings.push(getSimpleIndexEmptyMessage());
    }
    const dup = getSimpleDuplicateWarning(duplicateErrors);
    if (dup) {
      warnings.push(dup);
    }
    if (selectError) {
      warnings.push(getSimpleSelectErrorMessage(selectError));
    }
  }

  const indexedLabel = developerDetails
    ? `${indexedCount} id${indexedCount === 1 ? "" : "s"}`
    : getSimpleChipIndexedLabel(indexedCount);

  return (
    <div className="rte-chip-status">
      <p className="rte-chip-status-line">
        <span className={statusDotClass(channel, indexedCount)} aria-hidden="true" />
        <span className="rte-chip-status-text">
          <span className={channel === "ready" ? "rte-text-success" : "rte-text-muted"}>
            {status}
          </span>
          <span className="rte-text-dim"> · </span>
          <span className="rte-text-muted">{indexedLabel}</span>
        </span>
      </p>
      {selectedId ? (
        <p className="rte-chip-selected rte-truncate">
          <span className="rte-text-muted">Selected </span>
          <span className={developerDetails ? "rte-text-mono rte-text-accent" : "rte-text-accent"}>
            {developerDetails
              ? selectedId
              : formatSelectionTitle(selectedId, selectedEntry, indexEntries)}
          </span>
        </p>
      ) : null}
      {warnings.length > 0 ? (
        <div className="rte-chip-warnings">
          {warnings.map((w) => (
            <p key={w} className="rte-chip-warning-line">
              {w}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** @deprecated Use RteChipStatus or EditorStackVersions */
export function RuntimeDiagnosticsBlock(props: {
  channel: RteChannelState;
  channelLabel: string;
  indexedCount: number;
  duplicateErrors: readonly DuplicateIdError[];
  diagnostics: RuntimeDiagnostics | null;
  editMode: boolean;
  selectedId: string | null;
  selectError?: string | null;
}): ReactElement {
  return (
    <RteChipStatus
      channel={props.channel}
      channelLabel={props.channelLabel}
      indexedCount={props.indexedCount}
      duplicateErrors={props.duplicateErrors}
      selectedId={props.selectedId}
      selectError={props.selectError ?? null}
      developerDetails={false}
    />
  );
}
