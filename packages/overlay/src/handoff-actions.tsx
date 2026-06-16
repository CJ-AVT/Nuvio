import type { PlainPatchAction } from "./plain-patch-messages.js";
import { getPlainPatchHandoffStep } from "./plain-patch-messages.js";
import {
  buildEditorUrl,
  buildFixHandoffClipboard,
  copyTextToClipboard,
  MAKE_TABLE_EDITABLE_SNIPPET,
} from "./fix-handoff.js";
import type { ReactElement } from "react";

export type HandoffActionBarProps = {
  reason: string;
  suggestedAction: PlainPatchAction;
  hostId: string;
  file?: string;
  line?: number;
  componentName?: string;
  userIntent?: string;
  tableContext?: boolean;
  simpleMode?: boolean;
  onSwitchTarget?: () => void;
  onAddIdHint?: () => void;
  onChangeBreakpoint?: () => void;
};

export function HandoffActionBar({
  reason,
  suggestedAction,
  hostId,
  file,
  line,
  componentName,
  userIntent = "edit selection in rte",
  tableContext = false,
  simpleMode = false,
  onSwitchTarget,
  onAddIdHint,
  onChangeBreakpoint,
}: HandoffActionBarProps): ReactElement {
  const editorUrl = simpleMode ? null : buildEditorUrl(file, line);

  const copyHandoff = (): void => {
    const suggestedNextStep = tableContext
      ? MAKE_TABLE_EDITABLE_SNIPPET
      : getPlainPatchHandoffStep(reason);
    void copyTextToClipboard(
      buildFixHandoffClipboard({
        hostId,
        file,
        line,
        componentName,
        userIntent,
        reason,
        suggestedNextStep,
      }),
    );
  };

  return (
    <div className="rte-stack-2">
      {simpleMode ? <p className="rte-text-xs rte-leading-snug">{reason}</p> : null}
      <div className="rte-row-wrap">
      {suggestedAction === "switchTarget" && onSwitchTarget ? (
        <button type="button" className="rte-button rte-button-primary" onClick={onSwitchTarget}>
          {simpleMode ? "Edit title instead" : "Pick text target"}
        </button>
      ) : null}
      {suggestedAction === "changeBreakpoint" && onChangeBreakpoint ? (
        <button type="button" className="rte-button" onClick={onChangeBreakpoint}>
          Check breakpoint
        </button>
      ) : null}
      {!simpleMode && suggestedAction === "addId" && onAddIdHint ? (
        <button type="button" className="rte-button" onClick={onAddIdHint}>
          How to add ids
        </button>
      ) : null}
      {(suggestedAction === "useHandoff" || suggestedAction === "addId") && (
        <button type="button" className="rte-button rte-button-primary" onClick={copyHandoff}>
          Copy Fix Prompt
        </button>
      )}
      {!simpleMode && editorUrl ? (
        <a
          href={editorUrl}
          className="rte-button rte-button-ghost"
          target="_blank"
          rel="noreferrer"
        >
          Open in editor
        </a>
      ) : null}
      </div>
    </div>
  );
}
