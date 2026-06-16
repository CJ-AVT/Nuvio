import type { TextWireTarget } from "@rte/shared";
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
    <div className="rte-card rte-stack-2">
      <h3 className="rte-section-title">Edit target</h3>
      <p className="rte-text-2xs rte-text-muted rte-leading-snug">
        This area contains multiple pieces of text. Choose which one to edit.
      </p>
      <label className="rte-block rte-stack-1">
        <span className="rte-label">Text to edit</span>
        <select
          className="rte-control rte-select"
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
                : t.rteId
                  ? formatFriendlyId(t.rteId)
                  : t.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
