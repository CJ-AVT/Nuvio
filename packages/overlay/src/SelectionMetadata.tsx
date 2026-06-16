import type { IndexWireEntry } from "@rte/shared";
import type { ReactElement } from "react";

function riskClass(level: IndexWireEntry["riskLevel"]): string {
  if (level === "unsupported") {
    return "rte-risk-unsupported";
  }
  if (level === "caution") {
    return "rte-risk-caution";
  }
  if (level === "safe") {
    return "rte-risk-safe";
  }
  return "rte-text-muted";
}

function classNamePatchLabel(entry: IndexWireEntry): string {
  if (entry.hasLiteralClassName === false) {
    return "className not patchable (unsupported expression)";
  }
  if (entry.classNameMode === "cn-conditional") {
    return "className patchable (cn conditional)";
  }
  if (entry.classNameMode === "classnames-static") {
    return "className patchable (classnames map)";
  }
  if (entry.classNameMode === "cn-basic") {
    return "className patchable (cn string list)";
  }
  if (entry.hasLiteralClassName === true) {
    return "className patchable (string literal)";
  }
  return "className patchability unknown";
}

export function SelectionMetadata({
  entry,
}: {
  entry: IndexWireEntry;
}): ReactElement {
  const risk = entry.riskLevel ?? "safe";
  const reasons = entry.unsupportedReasons ?? [];

  return (
    <div className="rte-card rte-card--strong">
      <p className="rte-text-2xs rte-text-muted">
        <span className="rte-text-mono">{entry.tagName ?? "element"}</span>
        {entry.componentName ? (
          <>
            {" "}
            · component <span className="rte-text-mono">{entry.componentName}</span>
          </>
        ) : null}
        {entry.insideMap ? (
          <span className="rte-text-warn"> · inside .map()</span>
        ) : null}
      </p>
      <p className="rte-text-2xs">
        <span className="rte-text-muted">Risk </span>
        <span className={riskClass(entry.riskLevel)}>{risk}</span>
        <span className="rte-text-muted-dim"> · </span>
        <span className="rte-text-muted">{classNamePatchLabel(entry)}</span>
        {entry.libraryHint ? (
          <>
            <span className="rte-text-muted-dim"> · </span>
            <span className="rte-text-muted">{entry.libraryHint}</span>
          </>
        ) : null}
      </p>
      <p className="rte-text-2xs rte-text-muted">
        Text{" "}
        {entry.textEditable === false ? (
          <span className="rte-text-warn">not editable (container)</span>
        ) : (
          <span className="rte-text-success">editable</span>
        )}
        {entry.structuralEditable === false ? (
          <>
            {" "}
            · <span className="rte-text-warn">structure limited</span>
          </>
        ) : null}
      </p>
      {reasons.length > 0 ? (
        <ul className="rte-meta-reasons">
          {reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
