import type { DuplicateIdError, IndexWireEntry } from "@rte/shared";
import type { ReactElement } from "react";
import { RteChipStatus, type RteChannelState } from "./RuntimeDiagnosticsBlock.js";
import { RteChromeMenu } from "./RteChromeMenu.js";

export type RteChromeHeaderProps = {
  expanded: boolean;
  dragging: boolean;
  channel: RteChannelState;
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

export function RteChromeHeader({
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
}: RteChromeHeaderProps): ReactElement {
  return (
    <header
      className={`rte-chrome-header ${dragging ? "rte-chrome-header--grabbing" : ""}`}
      onPointerDown={onHeaderPointerDown}
    >
      <div className="rte-chrome-header-top">
        <span className="rte-chrome-title">Real-Time Editor</span>
        <span className="rte-chip-spacer" aria-hidden="true" />

        {!expanded ? (
          <button
            type="button"
            className="rte-button-icon rte-chrome-expand-btn"
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
          <div className="rte-chrome-header-tools">
            <RteChromeMenu
              developerDetails={developerDetails}
              onReset={() => {
                onResetPanelPosition();
                onResetChipPosition();
              }}
              onDeveloperDetailsChange={onDeveloperDetailsChange}
            />
            <button
              type="button"
              className="rte-button-icon rte-chrome-collapse-btn"
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

      <div className={`rte-chrome-header-meta ${expanded ? "rte-chrome-header-meta--visible" : ""}`}>
        <RteChipStatus
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
