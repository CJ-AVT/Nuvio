import type { IndexWireEntry } from "@nuvio/shared";
import type { ReactElement } from "react";

export type ComponentTreeProps = {
  entries: readonly IndexWireEntry[];
  selectedId: string | null;
  onSelectId: (id: string) => void;
};

function shortPath(file: string): string {
  const norm = file.replace(/\\/g, "/");
  const parts = norm.split("/");
  return parts.length <= 2 ? norm : parts.slice(-2).join("/");
}

export function ComponentTree({
  entries,
  selectedId,
  onSelectId,
}: ComponentTreeProps): ReactElement {
  const sorted = [...entries].sort((a, b) => a.id.localeCompare(b.id));

  return (
    <section>
      <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        Indexed elements
      </h3>
      {sorted.length === 0 ? (
        <p className="text-xs text-slate-600">No ids in dev index.</p>
      ) : (
        <ul className="max-h-40 space-y-0.5 overflow-y-auto rounded border border-slate-800/80 bg-slate-950/50 p-1">
          {sorted.map((e) => {
            const active = e.id === selectedId;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  className={`w-full rounded px-2 py-1 text-left text-[11px] leading-snug ${
                    active
                      ? "bg-sky-900/50 font-medium text-sky-200"
                      : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                  }`}
                  onClick={() => onSelectId(e.id)}
                >
                  <span className="block break-all font-mono">{e.id}</span>
                  <span className="block text-[10px] text-slate-500">
                    {shortPath(e.file)}:{e.line}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
