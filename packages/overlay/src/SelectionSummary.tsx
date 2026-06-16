import type { IndexWireEntry } from "@rte/shared";
import type { ReactElement } from "react";
import {
  getSimpleSelectionStatus,
  mapUnsupportedReasonToSimple,
} from "./selection-summary.js";

function toneClass(tone: ReturnType<typeof getSimpleSelectionStatus>["tone"]): string {
  if (tone === "success") {
    return "rte-text-success";
  }
  if (tone === "warn") {
    return "rte-text-warn";
  }
  return "rte-text-muted";
}

export function SelectionSummary({ entry }: { entry: IndexWireEntry }): ReactElement {
  const { message, tone } = getSimpleSelectionStatus(entry);
  const plainReasons = (entry.unsupportedReasons ?? []).slice(0, 2).map(mapUnsupportedReasonToSimple);

  return (
    <div className="rte-card rte-card--strong">
      <p className={`rte-text-xs rte-leading-snug ${toneClass(tone)}`}>{message}</p>
      {plainReasons.length > 0 ? (
        <ul className="rte-meta-reasons">
          {plainReasons.map((reason, idx) => (
            <li key={`${idx}-${reason}`}>{reason}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
