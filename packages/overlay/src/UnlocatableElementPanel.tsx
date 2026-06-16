import type { ReactElement } from "react";
import { buildFixHandoffClipboard, copyTextToClipboard } from "./fix-handoff.js";
import type { UnlocatableClickTarget } from "./rte-loc-dom.js";

export type UnlocatableElementPanelProps = {
  target: UnlocatableClickTarget;
  developerDetails: boolean;
  onDismiss: () => void;
};

const WRAPPER_FIX_STEP =
  "Forward props on the underlying native element (e.g. spread remaining props onto the root div) so rte attributes reach the DOM.";

function reasonCopy(
  target: UnlocatableClickTarget,
  developerDetails: boolean,
): { lead: string; hint: string; fixStep: string } {
  switch (target.reason) {
    case "no_vite_plugin":
      return {
        lead: developerDetails
          ? "rte can't map this click to source — the Vite plugin may not be running."
          : "rte isn't connected to your project files yet.",
        hint: developerDetails
          ? "Add @rte/vite-plugin to vite.config.ts, restart the dev server, then hard-refresh."
          : "Run rte init or add the dev plugin to your Vite config, then restart the dev server.",
        fixStep: "Wire @rte/vite-plugin in vite.config.ts and restart vite dev.",
      };
    case "wrapper_not_forwarding":
      return {
        lead: `This <${target.tagName}> element isn't reachable for tagging.`,
        hint: developerDetails
          ? "It may be rendered inside a component wrapper (Card, Button, etc.) that doesn't forward rte attributes to the DOM."
          : "It looks like a component wrapper — the inner HTML element needs to receive rte's tracking attributes.",
        fixStep: WRAPPER_FIX_STEP,
      };
    case "inside_app_link":
      return {
        lead: "Can't tag elements inside a navigation link.",
        hint: "Pick a child element instead, or temporarily disable the link while tagging.",
        fixStep: "Select a child element outside the <a href> wrapper, or add data-rte-id on the link host in source.",
      };
  }
}

export function UnlocatableElementPanel({
  target,
  developerDetails,
  onDismiss,
}: UnlocatableElementPanelProps): ReactElement {
  const { lead, hint, fixStep } = reasonCopy(target, developerDetails);

  const onCopyFix = (): void => {
    void copyTextToClipboard(
      buildFixHandoffClipboard({
        hostId: `(unlocatable ${target.tagName})`,
        userIntent: "make element editable via click-to-tag",
        reason: lead,
        suggestedNextStep: fixStep,
      }),
    );
  };

  return (
    <div className="rte-make-editable">
      <p className="rte-make-editable-lead">{lead}</p>
      <p className="rte-make-editable-hint">{hint}</p>
      <div className="rte-make-editable-actions">
        {developerDetails ? (
          <button type="button" className="rte-button" onClick={onCopyFix}>
            Copy Fix Prompt
          </button>
        ) : null}
        <button type="button" className="rte-button rte-button-secondary" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
