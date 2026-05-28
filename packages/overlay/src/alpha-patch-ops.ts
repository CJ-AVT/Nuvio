import type { PatchOp } from "@nuvio/shared";

/** Staged Tailwind picks: Phase 3 typography/spacing + Phase 4 layout/effects (allowlist-backed). */
export type AlphaStylePicks = {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  textAlign: string;
  textColor: string;
  bgColor: string;
  padding: string;
  paddingX: string;
  paddingY: string;
  margin: string;
  marginX: string;
  marginY: string;
  gap: string;
  flexDirection: string;
  justify: string;
  items: string;
  gridCols: string;
  rounded: string;
  borderWidth: string;
  borderColor: string;
  ringWidth: string;
  ringColor: string;
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
  lineHeight: "",
  letterSpacing: "",
  textAlign: "",
  textColor: "",
  bgColor: "",
  padding: "",
  paddingX: "",
  paddingY: "",
  margin: "",
  marginX: "",
  marginY: "",
  gap: "",
  flexDirection: "",
  justify: "",
  items: "",
  gridCols: "",
  rounded: "",
  borderWidth: "",
  borderColor: "",
  ringWidth: "",
  ringColor: "",
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
  options?: { textEditable?: boolean },
): PatchOp[] {
  const ops: PatchOp[] = [];
  const allowText = options?.textEditable !== false;
  if (allowText && draftText !== baselineText) {
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
