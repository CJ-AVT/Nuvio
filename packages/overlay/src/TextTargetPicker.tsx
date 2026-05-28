import type { TextWireTarget } from "@nuvio/shared";
import type { ReactElement } from "react";
import { formatFriendlyId } from "./selection-summary.js";

export function TextTargetPicker(props: {
  hostId: string;
  targets: readonly TextWireTarget[];
  activeKey: string;
  onActiveKeyChange: (key: string) => void;
  developerDetails: boolean;
  onHoverKeyChange?: (key: string | null) => void;
}): ReactElement {
  const { targets, activeKey, onActiveKeyChange, developerDetails, onHoverKeyChange } = props;

  if (targets.length <= 1) {
    return <></>;
  }

  return (
    <div className="nuvio-card nuvio-stack-2">
      <h3 className="nuvio-section-title">Edit target</h3>
      <p className="nuvio-text-2xs nuvio-text-muted nuvio-leading-snug">
        This area contains multiple pieces of text. Choose which one to edit.
      </p>
      <label className="nuvio-block nuvio-stack-1">
        <span className="nuvio-label">Text to edit</span>
        <select
          className="nuvio-control nuvio-select"
          value={activeKey}
          onChange={(e) => onActiveKeyChange(e.target.value)}
          onMouseLeave={() => onHoverKeyChange?.(null)}
        >
          {targets.map((t) => (
            <option
              key={t.key}
              value={t.key}
              onMouseEnter={() => onHoverKeyChange?.(t.key)}
            >
              {developerDetails
                ? t.label
                : t.nuvioId
                  ? formatFriendlyId(t.nuvioId)
                  : t.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
