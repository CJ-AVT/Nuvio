import type { DuplicateIdError, IndexWireEntry } from "@nuvio/shared";
import type { ReactElement } from "react";
import { NuvioChipStatus, type NuvioChannelState } from "./RuntimeDiagnosticsBlock.js";

export type NuvioChromeHeaderProps = {
  expanded: boolean;
  dragging: boolean;
  channel: NuvioChannelState;
  channelLabel: string;
  indexedCount: number;
  duplicateErrors: readonly DuplicateIdError[];
  selectedId: string | null;
  selectedEntry?: IndexWireEntry;
  indexEntries?: readonly IndexWireEntry[];
  selectError: string | null;
  developerDetails: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onResetChipPosition: () => void;
  onResetPanelPosition: () => void;
  onDeveloperDetailsChange: (enabled: boolean) => void;
  onHeaderPointerDown: (e: React.PointerEvent) => void;
};

export function NuvioChromeHeader({
  expanded,
  dragging,
  channel,
  channelLabel,
  indexedCount,
  duplicateErrors,
  selectedId,
  selectedEntry,
  indexEntries,
  selectError,
  developerDetails,
  onExpand,
  onCollapse,
  onResetChipPosition,
  onResetPanelPosition,
  onDeveloperDetailsChange,
  onHeaderPointerDown,
}: NuvioChromeHeaderProps): ReactElement {
  return (
    <header
      className={`nuvio-chrome-header ${dragging ? "nuvio-chrome-header--grabbing" : ""}`}
      onPointerDown={onHeaderPointerDown}
    >
      <div className="nuvio-chrome-header-top">
        <span className="nuvio-chrome-title">Real-Time Editor</span>
        <span className="nuvio-chip-spacer" aria-hidden="true" />

        {!expanded ? (
          <button
            type="button"
            className="nuvio-button-icon nuvio-chrome-expand-btn"
            title="Expand editor"
            aria-label="Expand Real-Time Editor"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
          >
            +
          </button>
        ) : (
          <div className="nuvio-chrome-header-tools">
            <button
              type="button"
              className={`nuvio-toggle-details ${
                developerDetails ? "nuvio-toggle-details--on" : ""
              }`}
              title="Show file paths, risk level, and technical diagnostics"
              aria-label="Developer details"
              aria-pressed={developerDetails}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onDeveloperDetailsChange(!developerDetails)}
            >
              Developer details
            </button>
            <button
              type="button"
              className="nuvio-button-icon"
              title="Reset position"
              aria-label="Reset position"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                onResetPanelPosition();
                onResetChipPosition();
              }}
            >
              Reset
            </button>
            <button
              type="button"
              className="nuvio-button-icon nuvio-chrome-collapse-btn"
              title="Collapse editor"
              aria-label="Collapse Real-Time Editor"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onCollapse();
              }}
            >
              −
            </button>
          </div>
        )}
      </div>

      <div className={`nuvio-chrome-header-meta ${expanded ? "nuvio-chrome-header-meta--visible" : ""}`}>
        <NuvioChipStatus
          channel={channel}
          channelLabel={channelLabel}
          indexedCount={indexedCount}
          duplicateErrors={duplicateErrors}
          selectedId={selectedId}
          selectedEntry={selectedEntry}
          indexEntries={indexEntries}
          selectError={selectError}
          developerDetails={developerDetails}
        />
      </div>
    </header>
  );
}
