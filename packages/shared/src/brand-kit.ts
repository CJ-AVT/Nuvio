import { z } from "zod";
import type { PatchOp } from "./protocol.js";

export const BRAND_ACCENT_COLORS = ["blue", "purple", "green", "slate", "rose"] as const;
export const BRAND_COLORS = ["none", "neutral", ...BRAND_ACCENT_COLORS] as const;
export const BRAND_RADIUS = ["sharp", "soft", "rounded", "pill"] as const;
export const BRAND_DENSITY = ["compact", "balanced", "spacious"] as const;
export const BRAND_TYPOGRAPHY = ["clean", "bold", "soft"] as const;
export const BRAND_SURFACES = ["white", "muted"] as const;
export const BRAND_BUTTON_VARIANTS = ["solid", "outline"] as const;
export const BRAND_BUTTON_HOVERS = ["none", "darken"] as const;
export const BRAND_CARD_SHADOWS = ["none", "sm", "md"] as const;
export const BRAND_CARD_HOVERS = ["none", "border"] as const;

export type BrandColor = (typeof BRAND_COLORS)[number];
export type BrandAccentColor = (typeof BRAND_ACCENT_COLORS)[number];
export type BrandRadius = (typeof BRAND_RADIUS)[number];
export type BrandDensity = (typeof BRAND_DENSITY)[number];
export type BrandTypography = (typeof BRAND_TYPOGRAPHY)[number];
export type BrandSurface = (typeof BRAND_SURFACES)[number];
export type BrandButtonVariant = (typeof BRAND_BUTTON_VARIANTS)[number];
export type BrandButtonHover = (typeof BRAND_BUTTON_HOVERS)[number];
export type BrandCardShadow = (typeof BRAND_CARD_SHADOWS)[number];
export type BrandCardHover = (typeof BRAND_CARD_HOVERS)[number];

export const BRAND_APPLY_ACTIONS = [
  "button",
  "card",
  "heading",
  "text",
  "table",
  "form",
  "badge",
] as const;

export type BrandApplyAction = (typeof BRAND_APPLY_ACTIONS)[number];

/** Preset axes shown in category-first Brand Kit UI. */
export type BrandPresetDimension =
  | "color"
  | "radius"
  | "density"
  | "typography"
  | "surface"
  | "buttonVariant"
  | "buttonHover"
  | "cardShadow"
  | "cardHover";

/**
 * Which brand presets apply per category (drives Brand Kit chips + samples).
 * Form/badge use fragment audit in inspector; UI still exposes recipe-driving presets.
 */
export const BRAND_PRESET_DIMENSIONS_BY_ACTION: Record<
  BrandApplyAction,
  readonly BrandPresetDimension[]
> = {
  button: ["color", "buttonVariant", "radius", "density", "buttonHover"],
  card: ["surface", "color", "radius", "density", "cardShadow", "cardHover"],
  heading: ["color", "typography"],
  text: ["color"],
  table: ["color", "radius"],
  form: ["color", "radius", "density", "surface"],
  badge: ["color"],
};

export function brandPresetDimensionsForAction(
  action: BrandApplyAction,
): readonly BrandPresetDimension[] {
  return BRAND_PRESET_DIMENSIONS_BY_ACTION[action];
}

/** Which Tailwind prefix consumes the project accent for each category (v1.6 slot model). */
export type BrandAccentSlot = "fill" | "border" | "text" | "tint";

export const BRAND_ACCENT_SLOT_BY_ACTION: Record<BrandApplyAction, BrandAccentSlot | null> = {
  button: "fill",
  card: "border",
  heading: "text",
  text: "text",
  table: "border",
  form: "border",
  badge: "tint",
};

/** User-facing title for the accent swatch row in Brand Kit (replaces generic "Color"). */
export function getBrandColorSlotLabel(action: BrandApplyAction): string {
  const labels: Record<BrandApplyAction, string> = {
    button: "Fill",
    card: "Border color",
    heading: "Text color",
    text: "Text color",
    table: "Border color",
    form: "Field border",
    badge: "Tint",
  };
  return labels[action];
}

/** Curated accent swatches shown per category (border-slot categories include none/neutral). */
export function brandColorsForAction(action: BrandApplyAction): readonly BrandColor[] {
  const slot = BRAND_ACCENT_SLOT_BY_ACTION[action];
  if (slot === "border") {
    return BRAND_COLORS;
  }
  if (slot === "text") {
    return ["neutral", ...BRAND_ACCENT_COLORS];
  }
  if (slot === "tint") {
    return ["neutral", ...BRAND_ACCENT_COLORS];
  }
  return BRAND_ACCENT_COLORS;
}

export function isBrandAccentColor(color: BrandColor): color is BrandAccentColor {
  return (BRAND_ACCENT_COLORS as readonly string[]).includes(color);
}

export const BRAND_RADIUS_FIELD_LABEL = "Corners";
export const BRAND_DENSITY_FIELD_LABEL = "Spacing";

export function getBrandTypographyFieldLabel(action: BrandApplyAction): string {
  return action === "heading" ? "Heading style" : "Typography";
}

export const BRAND_SURFACE_FIELD_LABEL = "Surface";
export const BRAND_BUTTON_VARIANT_FIELD_LABEL = "Style";
export const BRAND_BUTTON_HOVER_FIELD_LABEL = "Hover";
export const BRAND_CARD_SHADOW_FIELD_LABEL = "Shadow";
export const BRAND_CARD_HOVER_FIELD_LABEL = "Hover";

function formatAccentForSummary(action: BrandApplyAction, config: BrandConfig): string {
  if (config.color === "none" && (action === "card" || action === "table" || action === "form")) {
    return "No border";
  }
  const label = COLOR_LABELS[config.color];
  switch (action) {
    case "button":
      return config.buttonVariant === "outline" ? `${label} outline` : `${label} fill`;
    case "card":
    case "table":
      return `${label} border`;
    case "form":
      return `${label} field border`;
    case "badge":
      return `${label} tint`;
    case "heading":
    case "text":
      return `${label} text`;
    default:
      return label;
  }
}

export type BrandFragmentHostHint = {
  tagName?: string;
  hierarchyRole?: string;
  hostId?: string;
};

export type BrandConfig = {
  color: BrandColor;
  surface: BrandSurface;
  buttonVariant: BrandButtonVariant;
  buttonHover: BrandButtonHover;
  cardShadow: BrandCardShadow;
  cardHover: BrandCardHover;
  radius: BrandRadius;
  density: BrandDensity;
  typography: BrandTypography;
};

export type BrandTokens = {
  accent: BrandColor;
  surface: BrandSurface;
  radius: BrandRadius;
  density: BrandDensity;
  typography: BrandTypography;
  buttonVariant: BrandButtonVariant;
  buttonHover: BrandButtonHover;
  cardShadow: BrandCardShadow;
  cardHover: BrandCardHover;
};

export type BrandConfigFileV2 = {
  version: 2;
  tokens: BrandTokens;
};

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  color: "blue",
  surface: "white",
  buttonVariant: "solid",
  buttonHover: "darken",
  cardShadow: "none",
  cardHover: "none",
  radius: "soft",
  density: "balanced",
  typography: "clean",
};

export const brandConfigSchema = z.object({
  color: z.enum(BRAND_COLORS),
  surface: z.enum(BRAND_SURFACES),
  buttonVariant: z.enum(BRAND_BUTTON_VARIANTS),
  buttonHover: z.enum(BRAND_BUTTON_HOVERS),
  cardShadow: z.enum(BRAND_CARD_SHADOWS),
  cardHover: z.enum(BRAND_CARD_HOVERS),
  radius: z.enum(BRAND_RADIUS),
  density: z.enum(BRAND_DENSITY),
  typography: z.enum(BRAND_TYPOGRAPHY),
});

const brandTokensSchema = z.object({
  accent: z.enum(BRAND_COLORS),
  surface: z.enum(BRAND_SURFACES),
  radius: z.enum(BRAND_RADIUS),
  density: z.enum(BRAND_DENSITY),
  typography: z.enum(BRAND_TYPOGRAPHY),
  buttonVariant: z.enum(BRAND_BUTTON_VARIANTS),
  buttonHover: z.enum(BRAND_BUTTON_HOVERS),
  cardShadow: z.enum(BRAND_CARD_SHADOWS),
  cardHover: z.enum(BRAND_CARD_HOVERS),
});

const brandConfigFileV2Schema = z.object({
  version: z.literal(2),
  tokens: brandTokensSchema,
});

const COLOR_LABELS: Record<BrandColor, string> = {
  none: "None",
  neutral: "Neutral",
  blue: "Blue",
  purple: "Purple",
  green: "Green",
  slate: "Slate",
  rose: "Rose",
};

const RADIUS_LABELS: Record<BrandRadius, string> = {
  sharp: "Sharp",
  soft: "Soft",
  rounded: "Rounded",
  pill: "Pill",
};

const DENSITY_LABELS: Record<BrandDensity, string> = {
  compact: "Compact",
  balanced: "Balanced",
  spacious: "Spacious",
};

const SURFACE_LABELS: Record<BrandSurface, string> = {
  white: "White",
  muted: "Muted",
};

const BUTTON_VARIANT_LABELS: Record<BrandButtonVariant, string> = {
  solid: "Solid",
  outline: "Outline",
};

const BUTTON_HOVER_LABELS: Record<BrandButtonHover, string> = {
  none: "None",
  darken: "Darken",
};

const CARD_SHADOW_LABELS: Record<BrandCardShadow, string> = {
  none: "None",
  sm: "Subtle",
  md: "Medium",
};

const CARD_HOVER_LABELS: Record<BrandCardHover, string> = {
  none: "None",
  border: "Border",
};

const TYPOGRAPHY_LABELS: Record<BrandTypography, string> = {
  clean: "Clean",
  bold: "Bold",
  soft: "Soft",
};

const ACTION_LABELS: Record<BrandApplyAction, string> = {
  button: "Button",
  card: "Card",
  heading: "Heading",
  text: "Text",
  table: "Table",
  form: "Form",
  badge: "Badge",
};

function colorBgClass(color: BrandColor): string {
  if (color === "neutral") {
    return "bg-gray-600";
  }
  return color === "slate" ? "bg-slate-700" : `bg-${color}-600`;
}

function colorTextClass(color: BrandColor): string {
  if (color === "neutral") {
    return "text-gray-700";
  }
  return color === "slate" ? "text-slate-700" : `text-${color}-600`;
}

function colorBorderClass(color: BrandColor): string | null {
  if (color === "none") {
    return null;
  }
  if (color === "neutral") {
    return "border-gray-200";
  }
  return color === "slate" ? "border-slate-300" : `border-${color}-300`;
}

function colorAccentBorderClass(color: BrandColor): string {
  if (color === "neutral") {
    return "border-gray-600";
  }
  return color === "slate" ? "border-slate-700" : `border-${color}-600`;
}

function accentBorderRecipeParts(color: BrandColor): string[] {
  if (color === "none") {
    return ["border-0"];
  }
  const borderColor = colorBorderClass(color);
  if (!borderColor) {
    return [];
  }
  return ["border", borderColor];
}

function surfaceBgClass(surface: BrandSurface): string {
  return surface === "muted" ? "bg-slate-50" : "bg-white";
}

function colorBadgeBgClass(color: BrandColor): string {
  if (color === "neutral") {
    return "bg-gray-100";
  }
  return color === "slate" ? "bg-slate-100" : `bg-${color}-100`;
}

function colorBadgeTextClass(color: BrandColor): string {
  if (color === "neutral") {
    return "text-gray-700";
  }
  return color === "slate" ? "text-slate-700" : `text-${color}-700`;
}

function radiusClass(radius: BrandRadius): string {
  const map: Record<BrandRadius, string> = {
    sharp: "rounded-none",
    soft: "rounded-md",
    rounded: "rounded-xl",
    pill: "rounded-full",
  };
  return map[radius];
}

function densityButtonPadding(density: BrandDensity): string {
  const map: Record<BrandDensity, string> = {
    compact: "px-3 py-1.5",
    balanced: "px-4 py-2",
    spacious: "px-6 py-3",
  };
  return map[density];
}

function densityCardPadding(density: BrandDensity): string {
  const map: Record<BrandDensity, string> = {
    compact: "p-4",
    balanced: "p-6",
    spacious: "p-8",
  };
  return map[density];
}

function typographyClasses(typography: BrandTypography): string {
  const map: Record<BrandTypography, string> = {
    clean: "text-base font-medium",
    bold: "text-lg font-semibold",
    soft: "text-sm font-normal",
  };
  return map[typography];
}

function buttonHoverClass(
  color: BrandColor,
  buttonHover: BrandButtonHover,
  buttonVariant: BrandButtonVariant,
): string | null {
  if (buttonHover === "none" || color === "none" || color === "neutral") {
    return null;
  }
  if (buttonVariant === "outline") {
    return color === "slate" ? "hover:bg-slate-100" : `hover:bg-${color}-50`;
  }
  return color === "slate" ? "hover:bg-slate-800" : `hover:bg-${color}-700`;
}

function cardShadowClass(cardShadow: BrandCardShadow): string | null {
  if (cardShadow === "none") {
    return null;
  }
  return cardShadow === "sm" ? "shadow-sm" : "shadow-md";
}

function cardHoverBorderClass(color: BrandColor, cardHover: BrandCardHover): string | null {
  if (cardHover === "none" || color === "none" || color === "neutral") {
    return null;
  }
  return color === "slate" ? "hover:border-slate-400" : `hover:border-${color}-400`;
}

function joinRecipeClasses(parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(" ").trim();
}

function isFormLabelHost(hint?: BrandFragmentHostHint): boolean {
  const tag = hint?.tagName?.toLowerCase() ?? "";
  const hostId = hint?.hostId?.toLowerCase() ?? "";
  return tag === "label" || hostId.endsWith(".label");
}

export function brandFragmentHostHint(entry: {
  id: string;
  tagName?: string;
  hierarchyRole?: string;
}): BrandFragmentHostHint {
  return {
    tagName: entry.tagName,
    hierarchyRole: entry.hierarchyRole,
    hostId: entry.id,
  };
}

export function normalizeBrandConfig(input: unknown): BrandConfig {
  const parsed = brandConfigSchema.safeParse(input);
  if (parsed.success) {
    return parsed.data;
  }
  const v2 = brandConfigFileV2Schema.safeParse(input);
  if (v2.success) {
    const { tokens } = v2.data;
    return {
      color: tokens.accent,
      surface: tokens.surface,
      buttonVariant: tokens.buttonVariant,
      buttonHover: tokens.buttonHover ?? DEFAULT_BRAND_CONFIG.buttonHover,
      cardShadow: tokens.cardShadow ?? DEFAULT_BRAND_CONFIG.cardShadow,
      cardHover: tokens.cardHover ?? DEFAULT_BRAND_CONFIG.cardHover,
      radius: tokens.radius,
      density: tokens.density,
      typography: tokens.typography,
    };
  }
  if (input && typeof input === "object") {
    const partial = input as Record<string, unknown>;
    const tokens =
      partial.version === 2 && partial.tokens && typeof partial.tokens === "object"
        ? (partial.tokens as Record<string, unknown>)
        : null;
    const source = tokens ?? partial;
    return {
      color: brandConfigSchema.shape.color.safeParse(source.accent ?? source.color).success
        ? ((source.accent ?? source.color) as BrandColor)
        : DEFAULT_BRAND_CONFIG.color,
      surface: brandConfigSchema.shape.surface.safeParse(source.surface).success
        ? (source.surface as BrandSurface)
        : DEFAULT_BRAND_CONFIG.surface,
      buttonVariant: brandConfigSchema.shape.buttonVariant.safeParse(source.buttonVariant).success
        ? (source.buttonVariant as BrandButtonVariant)
        : DEFAULT_BRAND_CONFIG.buttonVariant,
      buttonHover: brandConfigSchema.shape.buttonHover.safeParse(source.buttonHover).success
        ? (source.buttonHover as BrandButtonHover)
        : DEFAULT_BRAND_CONFIG.buttonHover,
      cardShadow: brandConfigSchema.shape.cardShadow.safeParse(source.cardShadow).success
        ? (source.cardShadow as BrandCardShadow)
        : DEFAULT_BRAND_CONFIG.cardShadow,
      cardHover: brandConfigSchema.shape.cardHover.safeParse(source.cardHover).success
        ? (source.cardHover as BrandCardHover)
        : DEFAULT_BRAND_CONFIG.cardHover,
      radius: brandConfigSchema.shape.radius.safeParse(source.radius).success
        ? (source.radius as BrandRadius)
        : DEFAULT_BRAND_CONFIG.radius,
      density: brandConfigSchema.shape.density.safeParse(source.density).success
        ? (source.density as BrandDensity)
        : DEFAULT_BRAND_CONFIG.density,
      typography: brandConfigSchema.shape.typography.safeParse(source.typography).success
        ? (source.typography as BrandTypography)
        : DEFAULT_BRAND_CONFIG.typography,
    };
  }
  return { ...DEFAULT_BRAND_CONFIG };
}

/** On-disk `rte/brand.json` shape (v2). */
export function serializeBrandConfig(config: BrandConfig): BrandConfigFileV2 {
  return {
    version: 2,
    tokens: {
      accent: config.color,
      surface: config.surface,
      radius: config.radius,
      density: config.density,
      typography: config.typography,
      buttonVariant: config.buttonVariant,
      buttonHover: config.buttonHover,
      cardShadow: config.cardShadow,
      cardHover: config.cardHover,
    },
  };
}

export function brandConfigsEqual(a: BrandConfig, b: BrandConfig): boolean {
  return (
    a.color === b.color &&
    a.surface === b.surface &&
    a.buttonVariant === b.buttonVariant &&
    a.buttonHover === b.buttonHover &&
    a.cardShadow === b.cardShadow &&
    a.cardHover === b.cardHover &&
    a.radius === b.radius &&
    a.density === b.density &&
    a.typography === b.typography
  );
}

/** Single builder for Brand Preview UI and patch payloads (allowlist-safe v1.1). */
export function buildBrandClassFragment(
  action: BrandApplyAction,
  config: BrandConfig,
  hint?: BrandFragmentHostHint,
): string {
  switch (action) {
    case "button":
      if (config.buttonVariant === "outline") {
        return joinRecipeClasses([
          "border",
          colorAccentBorderClass(config.color),
          colorTextClass(config.color),
          "bg-transparent",
          radiusClass(config.radius),
          densityButtonPadding(config.density),
          buttonHoverClass(config.color, config.buttonHover, config.buttonVariant),
        ]);
      }
      return joinRecipeClasses([
        colorBgClass(config.color),
        "text-white",
        radiusClass(config.radius),
        densityButtonPadding(config.density),
        buttonHoverClass(config.color, config.buttonHover, config.buttonVariant),
      ]);
    case "card":
      return joinRecipeClasses([
        surfaceBgClass(config.surface),
        ...accentBorderRecipeParts(config.color),
        radiusClass(config.radius),
        densityCardPadding(config.density),
        cardShadowClass(config.cardShadow),
        cardHoverBorderClass(config.color, config.cardHover),
      ]);
    case "heading":
      return [typographyClasses(config.typography), colorTextClass(config.color)].join(" ").trim();
    case "text":
      return joinRecipeClasses(["text-sm font-normal", colorTextClass(config.color)]);
    case "table":
      return joinRecipeClasses([
        "max-w-full",
        ...accentBorderRecipeParts(config.color),
        radiusClass(config.radius),
      ]);
    case "form":
      if (isFormLabelHost(hint)) {
        return "text-sm font-medium text-gray-700";
      }
      return joinRecipeClasses([
        surfaceBgClass(config.surface),
        ...accentBorderRecipeParts(config.color),
        radiusClass(config.radius),
        densityButtonPadding(config.density),
      ]);
    case "badge":
      return [
        "inline-flex",
        "items-center",
        "px-2",
        "py-0.5",
        "text-xs",
        "font-medium",
        "rounded-full",
        colorBadgeBgClass(config.color),
        colorBadgeTextClass(config.color),
      ]
        .join(" ")
        .trim();
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

export function buildBrandPatchOps(
  action: BrandApplyAction,
  config: BrandConfig,
  hint?: BrandFragmentHostHint,
): PatchOp[] {
  return [
    {
      kind: "mergeTailwindClassName",
      classNameFragment: buildBrandClassFragment(action, config, hint),
    },
  ];
}

/** Plain-language summary for Simple Mode (no Tailwind tokens). */
export function buildBrandPreviewSummary(
  action: BrandApplyAction,
  config: BrandConfig,
): string {
  if (action === "text") {
    return `${ACTION_LABELS.text} · ${formatAccentForSummary(action, config)} · Body size`;
  }
  if (action === "heading") {
    return [
      ACTION_LABELS.heading,
      formatAccentForSummary(action, config),
      TYPOGRAPHY_LABELS[config.typography],
    ].join(" · ");
  }
  if (action === "card") {
    const parts = [
      ACTION_LABELS.card,
      SURFACE_LABELS[config.surface],
      formatAccentForSummary(action, config),
      RADIUS_LABELS[config.radius],
      DENSITY_LABELS[config.density],
    ];
    if ((config.cardShadow ?? DEFAULT_BRAND_CONFIG.cardShadow) !== "none") {
      parts.push(
        `${CARD_SHADOW_LABELS[config.cardShadow ?? DEFAULT_BRAND_CONFIG.cardShadow]} shadow`,
      );
    }
    if ((config.cardHover ?? DEFAULT_BRAND_CONFIG.cardHover) !== "none") {
      parts.push(`${CARD_HOVER_LABELS[config.cardHover ?? DEFAULT_BRAND_CONFIG.cardHover]} hover`);
    }
    return parts.join(" · ");
  }
  if (action === "table") {
    return [
      ACTION_LABELS.table,
      formatAccentForSummary(action, config),
      RADIUS_LABELS[config.radius],
    ].join(" · ");
  }
  if (action === "form") {
    return [
      ACTION_LABELS.form,
      formatAccentForSummary(action, config),
      RADIUS_LABELS[config.radius],
      DENSITY_LABELS[config.density],
    ].join(" · ");
  }
  if (action === "badge") {
    return [
      ACTION_LABELS.badge,
      formatAccentForSummary(action, config),
      RADIUS_LABELS.pill,
    ].join(" · ");
  }
  return [
    ACTION_LABELS.button,
    formatAccentForSummary(action, config),
    BUTTON_VARIANT_LABELS[config.buttonVariant],
    RADIUS_LABELS[config.radius],
    DENSITY_LABELS[config.density],
    (config.buttonHover ?? DEFAULT_BRAND_CONFIG.buttonHover) !== "none"
      ? `${BUTTON_HOVER_LABELS[config.buttonHover ?? DEFAULT_BRAND_CONFIG.buttonHover]} hover`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function getBrandColorLabel(color: BrandColor): string {
  return COLOR_LABELS[color];
}

export function getBrandRadiusLabel(radius: BrandRadius): string {
  return RADIUS_LABELS[radius];
}

export function getBrandDensityLabel(density: BrandDensity): string {
  return DENSITY_LABELS[density];
}

export function getBrandTypographyLabel(typography: BrandTypography): string {
  return TYPOGRAPHY_LABELS[typography];
}

export function getBrandSurfaceLabel(surface: BrandSurface): string {
  return SURFACE_LABELS[surface];
}

export function getBrandButtonVariantLabel(variant: BrandButtonVariant): string {
  return BUTTON_VARIANT_LABELS[variant];
}

export function getBrandButtonHoverLabel(hover: BrandButtonHover): string {
  return BUTTON_HOVER_LABELS[hover];
}

export function getBrandCardShadowLabel(shadow: BrandCardShadow): string {
  return CARD_SHADOW_LABELS[shadow];
}

export function getBrandCardHoverLabel(hover: BrandCardHover): string {
  return CARD_HOVER_LABELS[hover];
}
