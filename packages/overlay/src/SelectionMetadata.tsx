import type { IndexWireEntry } from "@nuvio/shared";
import type { ReactElement } from "react";

function riskClass(level: IndexWireEntry["riskLevel"]): string {
  if (level === "unsupported") {
    return "nuvio-risk-unsupported";
  }
  if (level === "caution") {
    return "nuvio-risk-caution";
  }
  if (level === "safe") {
    return "nuvio-risk-safe";
  }
  return "nuvio-text-muted";
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
    <div className="nuvio-card nuvio-card--strong">
      <p className="nuvio-text-2xs nuvio-text-muted">
        <span className="nuvio-text-mono">{entry.tagName ?? "element"}</span>
        {entry.componentName ? (
          <>
            {" "}
            · component <span className="nuvio-text-mono">{entry.componentName}</span>
          </>
        ) : null}
        {entry.insideMap ? (
          <span className="nuvio-text-warn"> · inside .map()</span>
        ) : null}
      </p>
      <p className="nuvio-text-2xs">
        <span className="nuvio-text-muted">Risk </span>
        <span className={riskClass(entry.riskLevel)}>{risk}</span>
        <span className="nuvio-text-muted-dim"> · </span>
        <span className="nuvio-text-muted">{classNamePatchLabel(entry)}</span>
        {entry.libraryHint ? (
          <>
            <span className="nuvio-text-muted-dim"> · </span>
            <span className="nuvio-text-muted">{entry.libraryHint}</span>
          </>
        ) : null}
      </p>
      <p className="nuvio-text-2xs nuvio-text-muted">
        Text{" "}
        {entry.textEditable === false ? (
          <span className="nuvio-text-warn">not editable (container)</span>
        ) : (
          <span className="nuvio-text-success">editable</span>
        )}
        {entry.structuralEditable === false ? (
          <>
            {" "}
            · <span className="nuvio-text-warn">structure limited</span>
          </>
        ) : null}
      </p>
      {reasons.length > 0 ? (
        <ul className="nuvio-meta-reasons">
          {reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
