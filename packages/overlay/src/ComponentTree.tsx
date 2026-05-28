import type { DuplicateIdError, IndexWireEntry } from "@nuvio/shared";
import { useMemo, useState, type ReactElement } from "react";

export type ComponentTreeProps = {
  entries: readonly IndexWireEntry[];
  duplicateErrors: readonly DuplicateIdError[];
  selectedId: string | null;
  onSelectId: (id: string) => void;
};

function shortPath(file: string): string {
  const norm = file.replace(/\\/g, "/");
  const parts = norm.split("/");
  return parts.length <= 2 ? norm : parts.slice(-2).join("/");
}

function riskDotClass(level: IndexWireEntry["riskLevel"]): string {
  if (level === "unsupported") {
    return "nuvio-tree-risk nuvio-tree-risk--unsupported";
  }
  if (level === "caution") {
    return "nuvio-tree-risk nuvio-tree-risk--caution";
  }
  return "nuvio-tree-risk nuvio-tree-risk--safe";
}

export function ComponentTree({
  entries,
  duplicateErrors,
  selectedId,
  onSelectId,
}: ComponentTreeProps): ReactElement {
  type FilterKey = "all" | "text" | "style" | "structure" | "unsupported" | "duplicates";
  const [filter, setFilter] = useState<FilterKey>("all");

  const selectedEntry = useMemo(
    () => (selectedId ? entries.find((e) => e.id === selectedId) : undefined),
    [entries, selectedId],
  );

  const hostContextEntries = useMemo(() => {
    if (!selectedEntry) {
      return entries;
    }
    const ids = new Set<string>([
      selectedEntry.id,
      ...(selectedEntry.childTargetIds ?? []),
      ...entries.filter((e) => e.parentHostId === selectedEntry.id).map((e) => e.id),
    ]);
    return entries.filter((e) => ids.has(e.id));
  }, [entries, selectedEntry]);

  const filtered = useMemo(() => {
    const src = selectedEntry ? hostContextEntries : entries;
    const out = src.filter((e) => {
      if (filter === "all" || filter === "duplicates") {
        return true;
      }
      if (filter === "unsupported") {
        return e.riskLevel === "unsupported";
      }
      if (filter === "structure") {
        return e.structuralEditable === true;
      }
      if (filter === "style") {
        return e.hasLiteralClassName === true;
      }
      if (filter === "text") {
        return e.textEditable === true || e.hierarchyRole === "text";
      }
      return true;
    });
    return [...out].sort((a, b) => a.id.localeCompare(b.id));
  }, [entries, filter, hostContextEntries, selectedEntry]);

  const groups = useMemo(() => {
    const map = new Map<string, IndexWireEntry[]>();
    for (const e of filtered) {
      const key = e.parentHostId ?? "__root__";
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <section>
      <h3 className="nuvio-tree-title">Indexed elements</h3>
      <div className="nuvio-tree-filters">
        {(["all", "text", "style", "structure", "unsupported", "duplicates"] as const).map((key) => (
          <button
            key={key}
            type="button"
            className={`nuvio-tree-filter ${filter === key ? "nuvio-tree-filter--active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {key}
          </button>
        ))}
      </div>
      {filter === "duplicates" ? (
        duplicateErrors.length === 0 ? (
          <p className="nuvio-text-xs nuvio-text-muted-dim">No duplicate ids reported.</p>
        ) : (
          <ul className="nuvio-tree-list">
            {duplicateErrors.map((dup) => (
              <li key={dup.id} className="nuvio-tree-item">
                <p className="nuvio-tree-dup-title">{dup.id}</p>
                {dup.occurrences.map((occ, i) => (
                  <p key={`${dup.id}-${i}`} className="nuvio-tree-btn-path">
                    {shortPath(occ.file)}:{occ.line}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        )
      ) : filtered.length === 0 ? (
        <p className="nuvio-text-xs nuvio-text-muted-dim">No ids in dev index.</p>
      ) : (
        groups.map(([groupKey, group]) => (
          <div key={groupKey} className="nuvio-tree-group">
            <p className="nuvio-tree-group-title">
              {groupKey === "__root__" ? "Top-level hosts" : `Host: ${groupKey}`}
            </p>
            <ul className="nuvio-tree-list">
              {group.map((e) => {
                const active = e.id === selectedId;
                return (
                  <li key={e.id} className="nuvio-tree-item">
                    <button
                      type="button"
                      className={`nuvio-tree-btn ${active ? "nuvio-tree-btn--active" : ""}`}
                      onClick={() => onSelectId(e.id)}
                    >
                      <span className="nuvio-tree-btn-row">
                        {e.riskLevel ? (
                          <span
                            className={riskDotClass(e.riskLevel)}
                            title={e.riskLevel}
                            aria-hidden="true"
                          />
                        ) : null}
                        <span className="nuvio-tree-role">{e.hierarchyRole ?? "unknown"}</span>
                        <span className="nuvio-break-all nuvio-text-mono">{e.id}</span>
                      </span>
                      <span className="nuvio-tree-btn-path">
                        {e.tagName ? `${e.tagName} · ` : ""}
                        {shortPath(e.file)}:{e.line}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
