import { BRAND_APPLY_ACTIONS, type BrandApplyAction } from "./brand-kit.js";

/** Lowercase plural labels for page discovery copy (e.g. "7 cards · 2 buttons"). */
export const BRAND_PAGE_DISCOVERY_PLURALS: Record<BrandApplyAction, string> = {
  button: "buttons",
  card: "cards",
  heading: "headings",
  text: "text blocks",
  table: "tables",
  form: "forms",
  badge: "badges",
};

const BRAND_PAGE_DISCOVERY_SINGULARS: Record<BrandApplyAction, string> = {
  button: "button",
  card: "card",
  heading: "heading",
  text: "text block",
  table: "table",
  form: "form",
  badge: "badge",
};

function formatDiscoveryCount(action: BrandApplyAction, count: number): string {
  const label = count === 1 ? BRAND_PAGE_DISCOVERY_SINGULARS[action] : BRAND_PAGE_DISCOVERY_PLURALS[action];
  return `${count} ${label}`;
}

export type BrandPageDiscoveryCounts = Readonly<Partial<Record<BrandApplyAction, number>>>;

/** Plain-language summary of brandable categories visible on the current page. */
export function buildBrandPageDiscoveryLine(counts: BrandPageDiscoveryCounts): string | null {
  const parts: string[] = [];
  for (const action of BRAND_APPLY_ACTIONS) {
    const count = counts[action] ?? 0;
    if (count > 0) {
      parts.push(formatDiscoveryCount(action, count));
    }
  }
  if (parts.length === 0) {
    return null;
  }
  return `On this page: ${parts.join(" · ")}`;
}
