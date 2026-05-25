import { useEffect, useId, useRef, useState, type ReactElement } from "react";
import type { ColorOption } from "./tailwind-color-options.js";
import {
  TAILWIND_COLOR_FAMILIES,
  TAILWIND_COLOR_SHADES,
  TAILWIND_PALETTE_HEX,
} from "./tailwind-palette-hex.js";

function hexForUtility(value: string, options: readonly ColorOption[]): string {
  if (!value) {
    return "transparent";
  }
  const hit = options.find((o) => o.value === value);
  if (hit) {
    return hit.hex;
  }
  const m = value.match(/^(text|bg)-([a-z]+)-(\d+)$/);
  if (m) {
    return TAILWIND_PALETTE_HEX[m[2]]?.[m[3]] ?? "#64748b";
  }
  if (value === "text-white" || value === "bg-white") {
    return "#ffffff";
  }
  if (value === "text-black" || value === "bg-black") {
    return "#000000";
  }
  return "#64748b";
}

function familyLabel(family: string): string {
  return family.charAt(0).toUpperCase() + family.slice(1);
}

export function ColorPickerRow({
  label,
  value,
  onChange,
  options,
  utilityPrefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly ColorOption[];
  utilityPrefix: "text" | "bg";
}): ReactElement {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const swatchHex = hexForUtility(value, options);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onDoc = (e: MouseEvent): void => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const specials = options.filter(
    (o) =>
      !o.value ||
      o.value === `${utilityPrefix}-white` ||
      o.value === `${utilityPrefix}-black` ||
      o.value === "bg-transparent",
  );

  const pick = (next: string): void => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative grid grid-cols-[minmax(0,6.5rem)_1fr] items-start gap-x-2 gap-y-1">
      <span className="pt-1 text-xs text-slate-500">{label}</span>
      <div className="min-w-0">
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listId : undefined}
          className="flex w-full items-center gap-2 rounded border border-slate-600 bg-slate-950 px-2 py-1 text-left text-xs text-slate-100 hover:border-slate-500"
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className="h-5 w-5 shrink-0 rounded border border-slate-600/80"
            style={{
              backgroundColor: swatchHex,
              backgroundImage:
                !value || value.includes("transparent")
                  ? "linear-gradient(45deg, #475569 25%, transparent 25%), linear-gradient(-45deg, #475569 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #475569 75%), linear-gradient(-45deg, transparent 75%, #475569 75%)"
                  : undefined,
              backgroundSize: !value || value.includes("transparent") ? "6px 6px" : undefined,
              backgroundPosition: !value || value.includes("transparent") ? "0 0, 0 3px, 3px -3px, -3px 0" : undefined,
            }}
            aria-hidden="true"
          />
          <span className="min-w-0 truncate font-mono text-[11px]">{value || "—"}</span>
        </button>

        {open ? (
          <div
            id={listId}
            role="listbox"
            aria-label={`${label} palette`}
            className="absolute left-0 right-0 z-20 mt-1 max-h-[min(20rem,50vh)] overflow-auto rounded-lg border border-slate-600 bg-slate-950 p-2 shadow-2xl ring-1 ring-slate-700/80"
          >
            <p className="mb-2 text-[10px] leading-snug text-slate-500">
              Tailwind palette — picks a utility class (e.g. {utilityPrefix}-sky-500), not a custom
              hex value.
            </p>
            <div className="mb-2 flex flex-wrap gap-1">
              {specials.map((o) => (
                <button
                  key={o.value || "__none"}
                  type="button"
                  role="option"
                  aria-selected={value === o.value}
                  title={o.label}
                  className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${
                    value === o.value
                      ? "bg-sky-900/60 text-sky-100 ring-1 ring-sky-500/50"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                  onClick={() => pick(o.value)}
                >
                  <span
                    className="inline-block h-3.5 w-3.5 rounded border border-slate-600/60"
                    style={{ backgroundColor: o.hex }}
                  />
                  {o.label}
                </button>
              ))}
            </div>
            <div
              className="grid gap-px text-[9px] text-slate-600"
              style={{
                gridTemplateColumns: `3.25rem repeat(${TAILWIND_COLOR_SHADES.length}, minmax(0, 1fr))`,
              }}
            >
              <span />
              {TAILWIND_COLOR_SHADES.map((s) => (
                <span key={s} className="text-center tabular-nums">
                  {s}
                </span>
              ))}
              {TAILWIND_COLOR_FAMILIES.map((family) => (
                <div key={family} className="contents">
                  <span className="truncate pr-1 text-right text-slate-500">{familyLabel(family)}</span>
                  {TAILWIND_COLOR_SHADES.map((shade) => {
                    const util = `${utilityPrefix}-${family}-${shade}`;
                    const hex = TAILWIND_PALETTE_HEX[family][String(shade)];
                    const selected = value === util;
                    return (
                      <button
                        key={util}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        title={util}
                        className={`aspect-square min-h-[1.125rem] min-w-0 rounded-sm border ${
                          selected
                            ? "border-sky-400 ring-2 ring-sky-400/80 ring-offset-1 ring-offset-slate-950"
                            : "border-slate-800/80 hover:scale-110 hover:border-slate-500"
                        }`}
                        style={{ backgroundColor: hex }}
                        onClick={() => pick(util)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
