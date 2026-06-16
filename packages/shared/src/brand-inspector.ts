import {
  BRAND_ACCENT_SLOT_BY_ACTION,
  BRAND_COLORS,
  BRAND_DENSITY,
  BRAND_RADIUS,
  BRAND_TYPOGRAPHY,
  buildBrandClassFragment,
  getBrandColorLabel,
  getBrandDensityLabel,
  getBrandRadiusLabel,
  getBrandTypographyLabel,
  isBrandAccentColor,
  type BrandAccentSlot,
  type BrandApplyAction,
  type BrandButtonVariant,
  type BrandColor,
  type BrandConfig,
  type BrandDensity,
  type BrandFragmentHostHint,
  type BrandRadius,
  type BrandSurface,
  type BrandTypography,
} from "./brand-kit.js";

export type BrandInspectDimension =
  | "color"
  | "radius"
  | "density"
  | "typography"
  | "surface"
  | "buttonVariant";

export type BrandInspectStatus = "match" | "mismatch" | "not_set";

export type BrandInspectRow = {
  dimension: BrandInspectDimension;
  dimensionLabel: string;
  status: BrandInspectStatus;
  currentLabel: string;
  brandLabel: string;
  currentToken?: string;
  expectedToken?: string;
};

export type BrandInspectResult = {
  rows: BrandInspectRow[];
  matchCount: number;
  checkedCount: number;
  headline: string;
};

const DIMENSION_LABELS: Record<BrandInspectDimension, string> = {
  color: "Color",
  radius: "Radius",
  density: "Density",
  typography: "Typography",
  surface: "Surface",
  buttonVariant: "Style",
};

function stripVariantPrefixes(token: string): string {
  let t = token;
  while (t.includes(":")) {
    const idx = t.indexOf(":");
    t = t.slice(idx + 1);
  }
  return t;
}

function tokenizeClassName(className: string): string[] {
  return className
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(stripVariantPrefixes);
}

function colorBgToken(color: BrandColor): string {
  if (color === "neutral") {
    return "bg-gray-600";
  }
  return color === "slate" ? "bg-slate-700" : `bg-${color}-600`;
}

function colorTextToken(color: BrandColor): string {
  if (color === "neutral") {
    return "text-gray-700";
  }
  return color === "slate" ? "text-slate-700" : `text-${color}-600`;
}

function colorBorderToken(color: BrandColor): string | null {
  if (color === "none") {
    return null;
  }
  if (color === "neutral") {
    return "border-gray-200";
  }
  return color === "slate" ? "border-slate-300" : `border-${color}-300`;
}

const RADIUS_TOKENS: Record<BrandRadius, string> = {
  sharp: "rounded-none",
  soft: "rounded-md",
  rounded: "rounded-xl",
  pill: "rounded-full",
};

const BUTTON_DENSITY_TOKENS: Record<BrandDensity, { px: string; py: string }> = {
  compact: { px: "px-3", py: "py-1.5" },
  balanced: { px: "px-4", py: "py-2" },
  spacious: { px: "px-6", py: "py-3" },
};

const CARD_DENSITY_TOKENS: Record<BrandDensity, string> = {
  compact: "p-4",
  balanced: "p-6",
  spacious: "p-8",
};

const TYPOGRAPHY_TOKENS: Record<BrandTypography, { size: string; weight: string }> = {
  clean: { size: "text-base", weight: "font-medium" },
  bold: { size: "text-lg", weight: "font-semibold" },
  soft: { size: "text-sm", weight: "font-normal" },
};

function colorBadgeBgToken(color: BrandColor): string {
  if (color === "neutral") {
    return "bg-gray-100";
  }
  return color === "slate" ? "bg-slate-100" : `bg-${color}-100`;
}

function colorBadgeTextToken(color: BrandColor): string {
  if (color === "neutral") {
    return "text-gray-700";
  }
  return color === "slate" ? "text-slate-700" : `text-${color}-700`;
}

function tokenMatchesBrandColor(token: string, color: BrandColor, prefix: "bg-" | "text-" | "border-"): boolean {
  if (color === "none") {
    return false;
  }
  const exact =
    prefix === "bg-"
      ? [colorBgToken(color), colorBadgeBgToken(color)]
      : prefix === "text-"
        ? [colorTextToken(color), colorBadgeTextToken(color)]
        : [colorBorderToken(color)].filter((value): value is string => value != null);
  if (exact.includes(token)) {
    return true;
  }
  if (!isBrandAccentColor(color)) {
    return false;
  }
  return token.startsWith(prefix) && token.includes(`-${color}-`);
}

function detectCardBorderSlotColor(
  tokens: string[],
): { color: BrandColor | null; token: string | null } {
  let last: { color: BrandColor | null; token: string | null } = { color: null, token: null };

  for (const token of tokens) {
    if (token === "border-gray-200") {
      last = { color: "neutral", token };
      continue;
    }
    if (token === "border-0" || token === "border-transparent") {
      last = { color: "none", token };
      continue;
    }
    for (const color of BRAND_COLORS) {
      if (tokenMatchesBrandColor(token, color, "border-")) {
        last = { color, token };
      }
    }
  }

  return last;
}

function detectBorderSlotColor(
  tokens: string[],
): { color: BrandColor | null; token: string | null } {
  let last: { color: BrandColor | null; token: string | null } = { color: null, token: null };
  let lastAccent: { color: BrandColor | null; token: string | null } = { color: null, token: null };

  for (const token of tokens) {
    if (token === "border-gray-200") {
      last = { color: "neutral", token };
      continue;
    }
    if (token === "border-0" || token === "border-transparent") {
      last = { color: "none", token };
      continue;
    }
    for (const color of BRAND_COLORS) {
      if (!tokenMatchesBrandColor(token, color, "border-")) {
        continue;
      }
      last = { color, token };
      if (isBrandAccentColor(color)) {
        lastAccent = { color, token };
      }
    }
  }

  if (lastAccent.color) {
    return lastAccent;
  }
  return last;
}

function detectBrandColorForSlot(
  tokens: string[],
  slot: BrandAccentSlot,
): { color: BrandColor | null; token: string | null } {
  if (slot === "border") {
    return detectBorderSlotColor(tokens);
  }

  let result: { color: BrandColor | null; token: string | null } = { color: null, token: null };

  for (const token of tokens) {
    if (slot === "text" && token === "text-gray-700") {
      result = { color: "neutral", token };
    }
    if (slot === "tint" && (token === "bg-gray-100" || token === "text-gray-700")) {
      result = { color: "neutral", token };
    }
    for (const color of BRAND_COLORS) {
      if (slot === "fill" && tokenMatchesBrandColor(token, color, "bg-")) {
        result = { color, token };
      } else if (slot === "text" && tokenMatchesBrandColor(token, color, "text-")) {
        result = { color, token };
      } else if (slot === "tint") {
        if (tokenMatchesBrandColor(token, color, "bg-") || tokenMatchesBrandColor(token, color, "text-")) {
          result = { color, token };
        }
      }
    }
  }

  return result;
}

function detectBrandColorForAction(
  tokens: string[],
  action: BrandApplyAction,
): { color: BrandColor | null; token: string | null } {
  if (action === "card") {
    return detectCardBorderSlotColor(tokens);
  }
  const slot = BRAND_ACCENT_SLOT_BY_ACTION[action];
  if (!slot) {
    return { color: null, token: null };
  }
  return detectBrandColorForSlot(tokens, slot);
}

function detectBrandColor(tokens: string[]): { color: BrandColor | null; token: string | null } {
  let result: { color: BrandColor | null; token: string | null } = { color: null, token: null };

  for (const token of tokens) {
    for (const color of BRAND_COLORS) {
      const candidates = [colorBgToken(color), colorTextToken(color), colorBorderToken(color)].filter(
        (value): value is string => value != null,
      );
      if (candidates.includes(token)) {
        result = { color, token };
      }
    }
    if (
      !token.startsWith("bg-") &&
      !token.startsWith("text-") &&
      !token.startsWith("border-")
    ) {
      continue;
    }
    for (const color of BRAND_COLORS) {
      if (!isBrandAccentColor(color)) {
        continue;
      }
      if (token.includes(`-${color}-`)) {
        result = { color, token };
      }
    }
  }

  return result;
}

function detectBrandRadius(tokens: string[]): { radius: BrandRadius | null; token: string | null } {
  let result: { radius: BrandRadius | null; token: string | null } = { radius: null, token: null };
  let lastRoundedToken: string | null = null;

  for (const token of tokens) {
    if (!token.startsWith("rounded")) {
      continue;
    }
    lastRoundedToken = token;
    for (const radius of BRAND_RADIUS) {
      if (token === RADIUS_TOKENS[radius]) {
        result = { radius, token };
      }
    }
  }

  if (result.radius || !lastRoundedToken) {
    return result;
  }

  return { radius: null, token: lastRoundedToken };
}

function detectBrandDensityForAction(
  tokens: string[],
  action: BrandApplyAction,
): { density: BrandDensity | null; token: string | null } {
  if (action === "card") {
    let result: { density: BrandDensity | null; token: string | null } = { density: null, token: null };
    for (const density of BRAND_DENSITY) {
      const cardToken = CARD_DENSITY_TOKENS[density];
      if (tokens.includes(cardToken)) {
        result = { density, token: cardToken };
      }
    }
    return result;
  }

  if (action === "button" || action === "form") {
    let result: { density: BrandDensity | null; token: string | null } = { density: null, token: null };
    for (const density of BRAND_DENSITY) {
      const button = BUTTON_DENSITY_TOKENS[density];
      if (tokens.includes(button.px) && tokens.includes(button.py)) {
        result = { density, token: `${button.px} ${button.py}` };
      }
    }
    return result;
  }

  return { density: null, token: null };
}

function detectBrandDensity(tokens: string[]): { density: BrandDensity | null; token: string | null } {
  let result: { density: BrandDensity | null; token: string | null } = { density: null, token: null };

  for (const density of BRAND_DENSITY) {
    const button = BUTTON_DENSITY_TOKENS[density];
    if (tokens.includes(button.px) && tokens.includes(button.py)) {
      result = { density, token: `${button.px} ${button.py}` };
    }
  }

  for (const density of BRAND_DENSITY) {
    const cardToken = CARD_DENSITY_TOKENS[density];
    if (tokens.includes(cardToken)) {
      result = { density, token: cardToken };
    }
  }

  return result;
}

const BRAND_SIZE_TOKENS = new Set(["text-sm", "text-base", "text-lg"]);

function detectBrandTypography(tokens: string[]): {
  typography: BrandTypography | null;
  token: string | null;
} {
  const size = tokens.filter((token) => BRAND_SIZE_TOKENS.has(token)).at(-1) ?? null;
  const weight = tokens.filter((token) => token.startsWith("font-")).at(-1) ?? null;

  if (!size && !weight) {
    return { typography: null, token: null };
  }

  for (const typography of BRAND_TYPOGRAPHY) {
    const expected = TYPOGRAPHY_TOKENS[typography];
    const sizeMatch = !size || size === expected.size;
    const weightMatch = !weight || weight === expected.weight;
    if (size && weight) {
      if (size === expected.size && weight === expected.weight) {
        return { typography, token: `${expected.size} ${expected.weight}` };
      }
      continue;
    }
    if (sizeMatch && weightMatch && (size || weight)) {
      return {
        typography,
        token: [size ?? expected.size, weight ?? expected.weight].join(" "),
      };
    }
  }

  const token = [size, weight].filter(Boolean).join(" ");
  return { typography: null, token: token || null };
}

function radiusLabelFromToken(token: string | null): string {
  if (!token) {
    return "Not set";
  }
  for (const radius of BRAND_RADIUS) {
    if (token === RADIUS_TOKENS[radius]) {
      return getBrandRadiusLabel(radius);
    }
  }
  const suffix = token.replace("rounded-", "");
  return suffix ? `Custom (${suffix})` : "Custom radius";
}

function densityLabelFromToken(token: string | null): string {
  if (!token) {
    return "Not set";
  }
  for (const density of BRAND_DENSITY) {
    const button = BUTTON_DENSITY_TOKENS[density];
    if (token === `${button.px} ${button.py}` || token === CARD_DENSITY_TOKENS[density]) {
      return getBrandDensityLabel(density);
    }
  }
  return "Custom spacing";
}

function typographyLabelFromToken(token: string | null): string {
  if (!token) {
    return "Not set";
  }
  for (const typography of BRAND_TYPOGRAPHY) {
    const expected = TYPOGRAPHY_TOKENS[typography];
    if (token === `${expected.size} ${expected.weight}`) {
      return getBrandTypographyLabel(typography);
    }
  }
  return "Custom typography";
}

function colorLabelFromDetection(color: BrandColor | null, token: string | null): string {
  if (color) {
    return getBrandColorLabel(color);
  }
  if (!token) {
    return "Not set";
  }
  return "Custom color";
}

function buildRow(
  dimension: BrandInspectDimension,
  status: BrandInspectStatus,
  currentLabel: string,
  brandLabel: string,
  currentToken?: string,
  expectedToken?: string,
): BrandInspectRow {
  return {
    dimension,
    dimensionLabel: DIMENSION_LABELS[dimension],
    status,
    currentLabel,
    brandLabel,
    currentToken,
    expectedToken,
  };
}

function buildHeadline(matchCount: number, checkedCount: number): string {
  if (checkedCount === 0) {
    return "No brand styles detected on this element.";
  }
  if (matchCount === checkedCount) {
    return "Matches your saved brand.";
  }
  if (matchCount === 0) {
    return "This element does not match your saved brand.";
  }
  return `${matchCount} of ${checkedCount} brand traits match your saved brand.`;
}

const INSPECT_DIMENSIONS_BY_ACTION: Record<BrandApplyAction, readonly BrandInspectDimension[]> = {
  button: ["color", "buttonVariant", "radius", "density"],
  card: ["surface", "color", "radius", "density"],
  heading: ["color", "typography"],
  text: ["color"],
  table: ["color", "radius"],
  form: ["color", "radius", "density", "surface"],
  badge: ["color"],
};

function detectBrandSurface(tokens: string[]): { surface: BrandSurface | null; token: string | null } {
  let result: { surface: BrandSurface | null; token: string | null } = { surface: null, token: null };
  if (tokens.includes("bg-slate-50")) {
    result = { surface: "muted", token: "bg-slate-50" };
  }
  if (tokens.includes("bg-white")) {
    result = { surface: "white", token: "bg-white" };
  }
  return result;
}

function detectBrandButtonVariant(
  tokens: string[],
): { buttonVariant: BrandButtonVariant | null; token: string | null } {
  if (tokens.includes("bg-transparent")) {
    return { buttonVariant: "outline", token: "bg-transparent" };
  }
  for (const color of BRAND_COLORS) {
    if (tokens.includes(colorBgToken(color))) {
      return { buttonVariant: "solid", token: colorBgToken(color) };
    }
  }
  return { buttonVariant: null, token: null };
}

function inspectRecipeFragmentMatch(
  className: string,
  expectedFragment: string,
): BrandInspectResult {
  const expectedTokens = tokenizeClassName(expectedFragment);
  const actualTokens = tokenizeClassName(className);
  const matchCount = expectedTokens.filter((token) => actualTokens.includes(token)).length;
  const checkedCount = expectedTokens.length;
  return {
    rows: [],
    matchCount,
    checkedCount,
    headline: buildHeadline(matchCount, checkedCount),
  };
}

/** Infer project preset values from flattened utility tokens (category-scoped when action is set). */
export function inferBrandPresetsFromTokens(
  tokens: readonly string[],
  action?: BrandApplyAction,
): Partial<BrandConfig> {
  const buttonVariantDetection = detectBrandButtonVariant([...tokens]);
  const colorDetection =
    action === "button" && buttonVariantDetection.buttonVariant === "outline"
      ? detectBrandColorForSlot([...tokens], "text")
      : action
        ? detectBrandColorForAction([...tokens], action)
        : detectBrandColor([...tokens]);
  const radiusDetection = detectBrandRadius([...tokens]);
  const densityDetection = action
    ? detectBrandDensityForAction([...tokens], action)
    : detectBrandDensity([...tokens]);
  const typographyDetection = detectBrandTypography([...tokens]);
  const surfaceDetection = detectBrandSurface([...tokens]);
  const dimensions = action ? new Set(INSPECT_DIMENSIONS_BY_ACTION[action]) : null;
  const patch: Partial<BrandConfig> = {};

  if (colorDetection.color && (!dimensions || dimensions.has("color"))) {
    patch.color = colorDetection.color;
  }
  if (surfaceDetection.surface && (!dimensions || dimensions.has("surface"))) {
    patch.surface = surfaceDetection.surface;
  }
  if (buttonVariantDetection.buttonVariant && (!dimensions || dimensions.has("buttonVariant"))) {
    patch.buttonVariant = buttonVariantDetection.buttonVariant;
  }
  if (radiusDetection.radius && (!dimensions || dimensions.has("radius"))) {
    patch.radius = radiusDetection.radius;
  }
  if (densityDetection.density && (!dimensions || dimensions.has("density"))) {
    patch.density = densityDetection.density;
  }
  if (typographyDetection.typography && (!dimensions || dimensions.has("typography"))) {
    patch.typography = typographyDetection.typography;
  }

  return patch;
}

/** Infer project preset values from a host class string (category-scoped when action is set). */
export function inferBrandPresetsFromClassName(
  className: string,
  action?: BrandApplyAction,
): Partial<BrandConfig> {
  return inferBrandPresetsFromTokens(tokenizeClassName(className), action);
}

/** Category-scoped audit: only checks dimensions the bulk recipe for that action sets. */
export function inspectBrandMatchForAction(
  action: BrandApplyAction,
  className: string,
  brand: BrandConfig,
  hint?: BrandFragmentHostHint,
): BrandInspectResult {
  if (action === "text") {
    return inspectRecipeFragmentMatch(className, buildBrandClassFragment("text", brand));
  }
  if (action === "form" || action === "badge") {
    return inspectRecipeFragmentMatch(className, buildBrandClassFragment(action, brand, hint));
  }
  const full = inspectBrandMatch(className, brand);
  const dimensions = new Set(INSPECT_DIMENSIONS_BY_ACTION[action]);
  const rows = full.rows.filter((row) => dimensions.has(row.dimension));
  const checkedRows = rows.filter((row) => row.status !== "not_set");
  const matchCount = checkedRows.filter((row) => row.status === "match").length;

  return {
    rows,
    matchCount,
    checkedCount: checkedRows.length,
    headline: buildHeadline(matchCount, checkedRows.length),
  };
}

/** Read-only audit: compare a host class string to the saved brand recipe. */
export function inspectBrandMatch(className: string, brand: BrandConfig): BrandInspectResult {
  const tokens = tokenizeClassName(className);

  const colorDetection = detectBrandColor(tokens);
  const radiusDetection = detectBrandRadius(tokens);
  const densityDetection = detectBrandDensity(tokens);
  const typographyDetection = detectBrandTypography(tokens);

  const rows: BrandInspectRow[] = [
    buildRow(
      "color",
      colorDetection.token == null
        ? "not_set"
        : colorDetection.color === brand.color
          ? "match"
          : "mismatch",
      colorLabelFromDetection(colorDetection.color, colorDetection.token),
      getBrandColorLabel(brand.color),
      colorDetection.token ?? undefined,
      colorTextToken(brand.color),
    ),
    buildRow(
      "radius",
      radiusDetection.token == null
        ? "not_set"
        : radiusDetection.radius === brand.radius
          ? "match"
          : "mismatch",
      radiusDetection.radius
        ? getBrandRadiusLabel(radiusDetection.radius)
        : radiusLabelFromToken(radiusDetection.token),
      getBrandRadiusLabel(brand.radius),
      radiusDetection.token ?? undefined,
      RADIUS_TOKENS[brand.radius],
    ),
    buildRow(
      "density",
      densityDetection.token == null
        ? "not_set"
        : densityDetection.density === brand.density
          ? "match"
          : "mismatch",
      densityDetection.density
        ? getBrandDensityLabel(densityDetection.density)
        : densityLabelFromToken(densityDetection.token),
      getBrandDensityLabel(brand.density),
      densityDetection.token ?? undefined,
      `${BUTTON_DENSITY_TOKENS[brand.density].px} ${BUTTON_DENSITY_TOKENS[brand.density].py}`,
    ),
    buildRow(
      "typography",
      typographyDetection.token == null
        ? "not_set"
        : typographyDetection.typography === brand.typography
          ? "match"
          : "mismatch",
      typographyDetection.typography
        ? getBrandTypographyLabel(typographyDetection.typography)
        : typographyLabelFromToken(typographyDetection.token),
      getBrandTypographyLabel(brand.typography),
      typographyDetection.token ?? undefined,
      `${TYPOGRAPHY_TOKENS[brand.typography].size} ${TYPOGRAPHY_TOKENS[brand.typography].weight}`,
    ),
  ];

  const checkedRows = rows.filter((row) => row.status !== "not_set");
  const matchCount = checkedRows.filter((row) => row.status === "match").length;

  return {
    rows,
    matchCount,
    checkedCount: checkedRows.length,
    headline: buildHeadline(matchCount, checkedRows.length),
  };
}
