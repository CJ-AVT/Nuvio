import type { PatchOp } from "@nuvio/shared";

/** Staged Tailwind picks: Phase 3 typography/spacing + Phase 4 layout/effects (allowlist-backed). */
export type AlphaStylePicks = {
  fontSize: string;
  fontWeight: string;
  textColor: string;
  bgColor: string;
  rounded: string;
  padding: string;
  margin: string;
  textAlign: string;
  gap: string;
  width: string;
  maxWidth: string;
  height: string;
  minHeight: string;
  opacity: string;
  shadow: string;
};

export const EMPTY_ALPHA_PICKS: AlphaStylePicks = {
  fontSize: "",
  fontWeight: "",
  textColor: "",
  bgColor: "",
  rounded: "",
  padding: "",
  margin: "",
  textAlign: "",
  gap: "",
  width: "",
  maxWidth: "",
  height: "",
  minHeight: "",
  opacity: "",
  shadow: "",
};

export function buildAlphaPatchOps(
  baselineText: string,
  draftText: string,
  baselinePicks: AlphaStylePicks,
  draftPicks: AlphaStylePicks,
): PatchOp[] {
  const ops: PatchOp[] = [];
  if (draftText !== baselineText) {
    ops.push({ kind: "setText", text: draftText });
  }
  const keys = Object.keys(EMPTY_ALPHA_PICKS) as (keyof AlphaStylePicks)[];
  for (const key of keys) {
    const next = draftPicks[key].trim();
    if (!next || next === baselinePicks[key]) {
      continue;
    }
    ops.push({ kind: "mergeTailwindClassName", classNameFragment: next });
  }
  return ops;
}
