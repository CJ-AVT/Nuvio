import type { IndexWireEntry, TextWireTarget } from "@rte/shared";
import type { ReactElement } from "react";
import { detectSimpleRouterMode } from "./task-router-modes.js";
import { formatFriendlyId } from "./selection-summary.js";

export type ContainerGuidanceProps = {
  entry: IndexWireEntry;
  selectedId: string;
  textTargets: readonly TextWireTarget[];
  indexEntries: readonly IndexWireEntry[];
  developerDetails: boolean;
  taskRouterActive: boolean;
  onSwitchToTarget: (target: { rteId?: string; key: string }) => void;
  onSelectId: (id: string) => void;
  onCopyFixPrompt?: () => void;
};

type GuidanceChoice = {
  label: string;
  rteId?: string;
  key?: string;
};

export function shouldShowContainerGuidance(
  entry: IndexWireEntry,
  selectedId: string,
  indexEntries: readonly IndexWireEntry[],
  developerDetails: boolean,
  taskRouterActive: boolean,
): boolean {
  if (developerDetails || taskRouterActive) {
    return false;
  }
  if (entry.textEditable !== false) {
    return false;
  }
  if (detectSimpleRouterMode(entry, selectedId, indexEntries)) {
    return false;
  }
  return true;
}

function categorizeTarget(target: TextWireTarget, entry: IndexWireEntry): string {
  const id = (target.rteId ?? target.label).toLowerCase();
  if (id.includes("button") || id.includes(".cta") || id.includes(".filter") || id.includes(".seeall")) {
    return "Edit button";
  }
  if (id.endsWith(".card") || entry.hierarchyRole === "card") {
    return "Edit card";
  }
  if (
    id.endsWith(".title") ||
    id.endsWith(".heading") ||
    id.endsWith(".lead") ||
    id.includes(".header.")
  ) {
    return "Edit title";
  }
  return "Edit text";
}

function buildGuidanceChoices(
  entry: IndexWireEntry,
  textTargets: readonly TextWireTarget[],
  indexEntries: readonly IndexWireEntry[],
): GuidanceChoice[] {
  const editable = textTargets.filter((t) => t.textEditable);
  const fromTargets: GuidanceChoice[] = [];
  const seen = new Set<string>();

  for (const target of editable) {
    const label = categorizeTarget(target, entry);
    const dedupeKey = target.rteId ?? target.key;
    if (seen.has(`${label}:${dedupeKey}`)) {
      continue;
    }
    seen.add(`${label}:${dedupeKey}`);
    fromTargets.push({
      label,
      rteId: target.rteId,
      key: target.key,
    });
  }

  const cardChild = indexEntries.find(
    (e) => e.parentHostId === entry.id && (e.id.endsWith(".card") || e.hierarchyRole === "card"),
  );
  if (cardChild && !seen.has(`Edit card:${cardChild.id}`)) {
    fromTargets.push({ label: "Edit card", rteId: cardChild.id });
  }

  const navChild = indexEntries.find(
    (e) => e.id.startsWith("nav.") && (e.parentHostId === entry.id || entry.id.includes("sidebar")),
  );
  if (navChild && !fromTargets.some((c) => c.label === "Edit button")) {
    fromTargets.push({ label: "Edit button", rteId: navChild.id });
  }

  const uniqueLabels = new Map<string, GuidanceChoice>();
  for (const choice of fromTargets) {
    if (!uniqueLabels.has(choice.label)) {
      uniqueLabels.set(choice.label, choice);
    }
  }
  return [...uniqueLabels.values()].slice(0, 4);
}

export function ContainerGuidance({
  entry,
  selectedId,
  textTargets,
  indexEntries,
  developerDetails,
  taskRouterActive,
  onSwitchToTarget,
  onSelectId,
  onCopyFixPrompt,
}: ContainerGuidanceProps): ReactElement | null {
  if (!shouldShowContainerGuidance(entry, selectedId, indexEntries, developerDetails, taskRouterActive)) {
    return null;
  }
  if (textTargets.length === 0 && !entry.id.includes("sidebar")) {
    return null;
  }

  const choices = buildGuidanceChoices(entry, textTargets, indexEntries);
  if (choices.length === 0) {
    return null;
  }

  if (developerDetails && choices.length === 1) {
    const target = choices[0];
    const label = target.rteId
      ? formatFriendlyId(target.rteId, entry)
      : (textTargets.find((t) => t.key === target.key)?.textPreview ?? target.label);
    return (
      <div className="rte-banner rte-banner--info rte-stack-2">
        <p className="rte-text-2xs rte-leading-snug">
          This area is a layout container. Edit the{" "}
          <span className="rte-font-medium">{label}</span> instead?
        </p>
        <button
          type="button"
          className="rte-button rte-button-primary"
          onClick={() => {
            if (target.rteId) {
              onSelectId(target.rteId);
            } else if (target.key) {
              onSwitchToTarget({ key: target.key, rteId: target.rteId });
            }
          }}
        >
          {target.label}
        </button>
      </div>
    );
  }

  return (
    <div className="rte-banner rte-banner--info rte-stack-2">
      <p className="rte-text-2xs rte-leading-snug">This area has editable parts.</p>
      <div className="rte-stack-1">
        {choices.map((choice) => (
          <button
            key={`${choice.label}-${choice.rteId ?? choice.key}`}
            type="button"
            className="rte-button rte-button--block"
            onClick={() => {
              if (choice.rteId) {
                onSelectId(choice.rteId);
              } else if (choice.key) {
                onSwitchToTarget({ key: choice.key, rteId: choice.rteId });
              }
            }}
          >
            {choice.label}
          </button>
        ))}
        {onCopyFixPrompt ? (
          <button type="button" className="rte-button rte-button-ghost rte-button--block" onClick={onCopyFixPrompt}>
            Copy Fix Prompt
          </button>
        ) : null}
      </div>
    </div>
  );
}
