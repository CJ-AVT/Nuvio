import type { IndexWireEntry } from "@nuvio/shared";
import type { ReactElement } from "react";
import {
  getSimpleSelectionStatus,
  mapUnsupportedReasonToSimple,
} from "./selection-summary.js";

function toneClass(tone: ReturnType<typeof getSimpleSelectionStatus>["tone"]): string {
  if (tone === "success") {
    return "nuvio-text-success";
  }
  if (tone === "warn") {
    return "nuvio-text-warn";
  }
  return "nuvio-text-muted";
}

export function SelectionSummary({ entry }: { entry: IndexWireEntry }): ReactElement {
  const { message, tone } = getSimpleSelectionStatus(entry);
  const plainReasons = (entry.unsupportedReasons ?? []).slice(0, 2).map(mapUnsupportedReasonToSimple);

  return (
    <div className="nuvio-card nuvio-card--strong">
      <p className={`nuvio-text-xs nuvio-leading-snug ${toneClass(tone)}`}>{message}</p>
      {plainReasons.length > 0 ? (
        <ul className="nuvio-meta-reasons">
          {plainReasons.map((reason, idx) => (
            <li key={`${idx}-${reason}`}>{reason}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
