/**
 * Phase 2 — conservative Tailwind v3-style allowlist for `mergeTailwindClassName`.
 * Expand intentionally; unknown tokens are rejected before `tailwind-merge`.
 */

const SPACING =
  /^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap)-(0|px|auto|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)$/;

const TEXT_SIZE = /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/;

const FONT_WEIGHT = /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/;

const LEADING = /^leading-(none|tight|snug|normal|relaxed|loose|[0-9]+)$/;

/** Tailwind v3: `text-white`, `bg-black`, `border-inherit`, etc. (no numeric scale). */
const COLOR_SOLID = /^(text|bg|border)-(inherit|current|transparent|black|white)$/;

/** `text-slate-400`, `bg-sky-600`, … */
const COLOR_SCALE =
  /^(text|bg|border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/;

/** Common demo / card backgrounds with opacity modifier (Tailwind v3). */
const BG_COLOR_OPACITY = /^bg-(slate|sky|neutral)-(800|900|950)\/(50|75|80)$/;

const ROUNDED = /^rounded$|^rounded-(none|sm|md|lg|xl|2xl|3xl|full)$/;

const LAYOUT = /^(flex|inline-flex|block|inline|inline-block|grid|inline-grid|hidden|contents)$/;

const FLEX = /^(flex-row|flex-col|flex-wrap|flex-1|grow|shrink|basis-0|items-(start|end|center|baseline|stretch)|justify-(start|end|center|between|around|evenly))$/;
const GRID_COLS = /^grid-cols-(1|2|3|4|5|6|7|8|9|10|11|12)$/;

const BORDER_W = /^border(-(0|2|4|8))?$/;
const BORDER_COLOR =
  /^border-(inherit|current|transparent|black|white|(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950))$/;
const RING = /^ring(-(0|1|2|4|8))?$/;
const RING_COLOR =
  /^ring-(inherit|current|transparent|black|white|(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950))$/;

/** Text alignment (PRD full MVP typography). */
const TEXT_ALIGN = /^text-(left|center|right|justify|start|end)$/;
const TRACKING = /^tracking-(tighter|tight|normal|wide|wider|widest)$/;

/** Opacity scale (Tailwind v3 default steps). */
const OPACITY = /^opacity-(0|5|10|15|20|25|30|40|50|60|70|75|80|90|95|100)$/;

/** Box shadow presets. */
const SHADOW = /^shadow$|^shadow-(sm|md|lg|xl|2xl|inner|none)$/;

/** Brand Kit v1.8 — curated hover utilities for accent steps only. */
const HOVER_COLOR_SCALE =
  /^hover:(bg|border)-(slate|gray|blue|green|purple|rose)-(50|100|200|300|400|500|600|700|800)$/;

/** Width utilities (common scale + key fractions). */
const W_WIDTH =
  /^w-(auto|full|screen|min|max|fit|px|0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96|1\/2|1\/3|2\/3|1\/4|3\/4)$/;

/** Height utilities. */
const H_HEIGHT =
  /^h-(auto|full|screen|min|max|fit|px|0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)$/;

/** Max-width (layout containers). */
const MAX_W =
  /^max-w-(none|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|min|max|fit|prose)$/;

/** Min-height (sections / heroes). */
const MIN_H =
  /^min-h-(0|full|screen|min|max|fit|px|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)$/;

/** Strip ZWSP / BOM and normalize Unicode dashes so allowlist matching stays reliable. */
function normalizeTailwindToken(raw: string): string {
  return raw
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u00AD\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-");
}

export function validateTailwindFragment(fragment: string): void {
  const tokens = fragment.trim().split(/\s+/).filter(Boolean);
  for (const raw of tokens) {
    const t = normalizeTailwindToken(raw);
    if (!t) {
      continue;
    }
    if (
      SPACING.test(t) ||
      TEXT_SIZE.test(t) ||
      FONT_WEIGHT.test(t) ||
      LEADING.test(t) ||
      COLOR_SOLID.test(t) ||
      COLOR_SCALE.test(t) ||
      BG_COLOR_OPACITY.test(t) ||
      ROUNDED.test(t) ||
      LAYOUT.test(t) ||
      FLEX.test(t) ||
      GRID_COLS.test(t) ||
      BORDER_W.test(t) ||
      BORDER_COLOR.test(t) ||
      RING.test(t) ||
      RING_COLOR.test(t) ||
      TEXT_ALIGN.test(t) ||
      TRACKING.test(t) ||
      OPACITY.test(t) ||
      SHADOW.test(t) ||
      HOVER_COLOR_SCALE.test(t) ||
      W_WIDTH.test(t) ||
      H_HEIGHT.test(t) ||
      MAX_W.test(t) ||
      MIN_H.test(t)
    ) {
      continue;
    }
    throw new Error(`Unknown or disallowed Tailwind utility: ${t}`);
  }
}
