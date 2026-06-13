import type { ReactElement } from "react";
import type {
  BrandApplyAction,
  BrandColor,
  BrandConfig,
  BrandButtonVariant,
  BrandDensity,
  BrandRadius,
  BrandSurface,
  BrandTypography,
} from "@nuvio/shared";

const SAMPLE_COLORS: Record<
  BrandColor,
  { bg: string; text: string; border: string; badgeBg: string; badgeText: string }
> = {
  none: { bg: "transparent", text: "#6b7280", border: "transparent", badgeBg: "#f3f4f6", badgeText: "#374151" },
  neutral: { bg: "#4b5563", text: "#374151", border: "#e5e7eb", badgeBg: "#f3f4f6", badgeText: "#374151" },
  blue: { bg: "#2563eb", text: "#2563eb", border: "#93c5fd", badgeBg: "#dbeafe", badgeText: "#1d4ed8" },
  purple: { bg: "#9333ea", text: "#9333ea", border: "#d8b4fe", badgeBg: "#f3e8ff", badgeText: "#7e22ce" },
  green: { bg: "#16a34a", text: "#16a34a", border: "#86efac", badgeBg: "#dcfce7", badgeText: "#15803d" },
  slate: { bg: "#334155", text: "#334155", border: "#cbd5e1", badgeBg: "#f1f5f9", badgeText: "#334155" },
  rose: { bg: "#e11d48", text: "#e11d48", border: "#fda4af", badgeBg: "#ffe4e6", badgeText: "#be123c" },
};

const SAMPLE_RADIUS_PX: Record<BrandRadius, string> = {
  sharp: "0",
  soft: "6px",
  rounded: "12px",
  pill: "9999px",
};

const SAMPLE_BUTTON_PAD: Record<BrandDensity, string> = {
  compact: "6px 12px",
  balanced: "8px 16px",
  spacious: "12px 24px",
};

const SAMPLE_CARD_PAD: Record<BrandDensity, string> = {
  compact: "16px",
  balanced: "24px",
  spacious: "32px",
};

const SAMPLE_INPUT_PAD: Record<BrandDensity, string> = {
  compact: "6px 12px",
  balanced: "8px 16px",
  spacious: "12px 16px",
};

const SAMPLE_SURFACE_BG: Record<BrandSurface, string> = {
  white: "rgba(255, 255, 255, 0.96)",
  muted: "rgba(248, 250, 252, 0.96)",
};

const SAMPLE_TYPOGRAPHY: Record<BrandTypography, { fontSize: string; fontWeight: number }> = {
  clean: { fontSize: "16px", fontWeight: 500 },
  bold: { fontSize: "18px", fontWeight: 600 },
  soft: { fontSize: "14px", fontWeight: 400 },
};

export type BrandCategorySampleMode = "sample" | "preview";

export type BrandCategorySampleProps = {
  action: BrandApplyAction;
  draft: BrandConfig;
  mode: BrandCategorySampleMode;
  categoryCount?: number;
};

const CATEGORY_PLURAL_LABELS: Record<BrandApplyAction, string> = {
  button: "buttons",
  card: "cards",
  heading: "headings",
  text: "text blocks",
  table: "tables",
  form: "forms",
  badge: "badges",
};

function sampleLeadCopy(action: BrandApplyAction, mode: BrandCategorySampleMode, count?: number): string {
  const plural = CATEGORY_PLURAL_LABELS[action];
  if (mode === "preview") {
    const countSuffix = count != null && count > 0 ? ` (${count})` : "";
    return `All ${plural} on this page${countSuffix} with these settings.`;
  }
  return `Example styling for ${plural} in your project.`;
}

export function BrandCategorySample({
  action,
  draft,
  mode,
  categoryCount,
}: BrandCategorySampleProps): ReactElement {
  const palette = SAMPLE_COLORS[draft.color];
  const radiusPx = SAMPLE_RADIUS_PX[draft.radius];
  const headingType = SAMPLE_TYPOGRAPHY[draft.typography];
  const title = mode === "preview" ? "Preview" : "Sample";

  return (
    <div className="nuvio-brand-preview">
      <p className="nuvio-brand-field-label">{title}</p>
      <p className="nuvio-brand-preview-lead">{sampleLeadCopy(action, mode, categoryCount)}</p>
      <div className="nuvio-brand-preview-canvas">
        <div className="nuvio-brand-preview-samples">
          {action === "button" ? (
            <span
              className="nuvio-brand-preview-button"
              style={{
                backgroundColor:
                  draft.buttonVariant === "outline" ? "transparent" : palette.bg,
                color: draft.buttonVariant === "outline" ? palette.text : "#ffffff",
                border:
                  draft.buttonVariant === "outline" ? `1px solid ${palette.text}` : "1px solid transparent",
                borderRadius: radiusPx,
                padding: SAMPLE_BUTTON_PAD[draft.density],
              }}
              title={draft.buttonHover === "darken" ? "Hover darkens fill" : undefined}
            >
              Sample button
            </span>
          ) : null}
          {action === "card" ? (
            <div
              className="nuvio-brand-preview-card"
              style={{
                backgroundColor: SAMPLE_SURFACE_BG[draft.surface],
                border: draft.color === "none" ? "1px solid transparent" : `1px solid ${palette.border}`,
                borderRadius: radiusPx,
                padding: SAMPLE_CARD_PAD[draft.density],
                boxShadow:
                  draft.cardShadow === "sm"
                    ? "0 1px 2px rgba(15, 23, 42, 0.08)"
                    : draft.cardShadow === "md"
                      ? "0 4px 6px rgba(15, 23, 42, 0.12)"
                      : "none",
              }}
              title={draft.cardHover === "border" ? "Hover darkens border" : undefined}
            >
              <span
                className="nuvio-brand-preview-heading"
                style={{ color: palette.text, fontSize: "15px", fontWeight: 600 }}
              >
                Card title
              </span>
              <span className="nuvio-brand-preview-body">Card content uses your border and padding.</span>
            </div>
          ) : null}
          {action === "heading" ? (
            <span
              className="nuvio-brand-preview-heading"
              style={{
                color: palette.text,
                fontSize: headingType.fontSize,
                fontWeight: headingType.fontWeight,
              }}
            >
              Sample heading
            </span>
          ) : null}
          {action === "text" ? (
            <span
              className="nuvio-brand-preview-body nuvio-brand-sample-text"
              style={{ color: palette.text, fontSize: "14px", fontWeight: 400 }}
            >
              Sample body text at a fixed readable size.
            </span>
          ) : null}
          {action === "table" ? (
            <div
              className="nuvio-brand-sample-table"
              style={{
                border: `1px solid ${palette.border}`,
                borderRadius: radiusPx,
              }}
            >
              <div className="nuvio-brand-sample-table-row nuvio-brand-sample-table-row--head">
                <span>Product</span>
                <span>Status</span>
              </div>
              <div className="nuvio-brand-sample-table-row">
                <span>Sample row</span>
                <span>Active</span>
              </div>
            </div>
          ) : null}
          {action === "form" ? (
            <div className="nuvio-brand-sample-form">
              <span className="nuvio-brand-sample-form-label">Email</span>
              <span
                className="nuvio-brand-sample-form-input"
                style={{
                  backgroundColor: SAMPLE_SURFACE_BG[draft.surface],
                  border: `1px solid ${palette.border}`,
                  borderRadius: radiusPx,
                  padding: SAMPLE_INPUT_PAD[draft.density],
                }}
              >
                you@example.com
              </span>
            </div>
          ) : null}
          {action === "badge" ? (
            <span
              className="nuvio-brand-sample-badge"
              style={{
                backgroundColor: palette.badgeBg,
                color: palette.badgeText,
                borderRadius: SAMPLE_RADIUS_PX.pill,
              }}
            >
              Sample badge
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
