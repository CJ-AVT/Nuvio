import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BRAND_APPLY_ACTIONS,
  BRAND_BUTTON_HOVERS,
  BRAND_BUTTON_VARIANTS,
  BRAND_BUTTON_HOVER_FIELD_LABEL,
  BRAND_BUTTON_VARIANT_FIELD_LABEL,
  BRAND_CARD_HOVERS,
  BRAND_CARD_SHADOWS,
  BRAND_CARD_HOVER_FIELD_LABEL,
  BRAND_CARD_SHADOW_FIELD_LABEL,
  BRAND_DENSITY,
  BRAND_RADIUS,
  BRAND_SURFACES,
  BRAND_SURFACE_FIELD_LABEL,
  BRAND_TYPOGRAPHY,
  BRAND_DENSITY_FIELD_LABEL,
  BRAND_RADIUS_FIELD_LABEL,
  brandConfigsEqual,
  brandColorsForAction,
  brandPresetDimensionsForAction,
  buildBrandValidateSummary,
  buildBrandBulkTargetOps,
  DEFAULT_BRAND_CONFIG,
  getBrandColorLabel,
  getBrandColorSlotLabel,
  getBrandButtonHoverLabel,
  getBrandButtonVariantLabel,
  getBrandCardHoverLabel,
  getBrandCardShadowLabel,
  getBrandDensityLabel,
  getBrandRadiusLabel,
  getBrandSurfaceLabel,
  getBrandTypographyFieldLabel,
  getBrandTypographyLabel,
  inferBrandPresetsFromTokens,
  resolveBrandCategoryForEntry,
  type BrandApplyAction,
  type BrandButtonHover,
  type BrandButtonVariant,
  type BrandCardHover,
  type BrandCardShadow,
  type BrandColor,
  type BrandConfig,
  type BrandDensity,
  type BrandPresetDimension,
  type BrandRadius,
  type BrandSurface,
  type BrandTypography,
  type Breakpoint,
  type DuplicateIdError,
  type IndexWireEntry,
  type PatchOp,
  type PccManifest,
} from "@nuvio/shared";
import { BrandCategorySample } from "./brand-category-sample.js";
import { BrandKitFirstRunChecklist } from "./brand-kit-first-run.js";
import {
  dismissBrandKitFirstRun,
  isBrandKitFirstRunDismissed,
} from "./brand-kit-onboarding-storage.js";
import { fetchBrandConfig, saveBrandConfig } from "./brand-kit-api.js";
import {
  brandPresetContextKey,
  buildBrandPageBaselineDraft,
  resolveBrandPresetCategory,
  shouldMirrorSelectionIntoDraft,
  shouldSyncDraftFromPageInference,
} from "./brand-preset-sync.js";
import { fetchPagePcc } from "./pcc-api.js";
import { listVisibleBrandBulkTargets } from "./brand-bulk-page.js";
import { useSpaPathname } from "./spa-pathname.js";
import {
  isBrandBulkCategoryLocked,
  isBrandBulkCategoryValidationReady,
  isBrandBulkValidateDisabled,
  type BrandBulkAppliedByAction,
  type BrandBulkProgress,
} from "./brand-bulk-session.js";
import { escapeAttrSelector } from "./nuvio-dom.js";
import {
  flattenTokensAtBreakpoint,
  readBreakpointForCardInference,
} from "./tailwind-token-read.js";
import {
  captureBrandKitOpened,
  captureBrandPresetChanged,
  captureBrandSaved,
  captureBrandStyleFailed,
  captureBrandStylePreviewed,
} from "./brand-kit-telemetry.js";

const PREVIEW_COLORS: Record<
  BrandColor,
  { bg: string; text: string; border: string; swatch: string }
> = {
  none: { bg: "transparent", text: "#6b7280", border: "transparent", swatch: "transparent" },
  neutral: { bg: "#4b5563", text: "#374151", border: "#e5e7eb", swatch: "#9ca3af" },
  blue: { bg: "#2563eb", text: "#2563eb", border: "#93c5fd", swatch: "#3b82f6" },
  purple: { bg: "#9333ea", text: "#9333ea", border: "#d8b4fe", swatch: "#a855f7" },
  green: { bg: "#16a34a", text: "#16a34a", border: "#86efac", swatch: "#22c55e" },
  slate: { bg: "#334155", text: "#334155", border: "#cbd5e1", swatch: "#64748b" },
  rose: { bg: "#e11d48", text: "#e11d48", border: "#fda4af", swatch: "#f43f5e" },
};

const BULK_ACTION_LABELS: Record<BrandApplyAction, string> = {
  button: "Buttons",
  card: "Cards",
  heading: "Headings",
  text: "Text",
  table: "Tables",
  form: "Forms",
  badge: "Badges",
};

const CATEGORY_SELECTOR_LABELS: Record<BrandApplyAction, string> = {
  button: "Button",
  card: "Card",
  heading: "Heading",
  text: "Text",
  table: "Table",
  form: "Form",
  badge: "Badge",
};

function pickDefaultActiveCategory(
  bulkTargetsByAction: Record<BrandApplyAction, readonly unknown[]>,
): BrandApplyAction {
  for (const action of BRAND_APPLY_ACTIONS) {
    if ((bulkTargetsByAction[action]?.length ?? 0) > 0) {
      return action;
    }
  }
  return "button";
}

function readHostClassTokens(
  hostId: string,
  activeBreakpoint: Breakpoint,
  inferenceCategory: BrandApplyAction,
): { tokens: readonly string[]; readBreakpoint: Breakpoint } {
  if (typeof document === "undefined") {
    return { tokens: [], readBreakpoint: activeBreakpoint };
  }
  const el = document.querySelector(`[data-nuvio-id="${escapeAttrSelector(hostId)}"]`);
  if (!(el instanceof HTMLElement)) {
    return { tokens: [], readBreakpoint: activeBreakpoint };
  }
  const readBreakpoint =
    inferenceCategory === "card"
      ? readBreakpointForCardInference(el.className, activeBreakpoint)
      : activeBreakpoint;
  return {
    tokens: flattenTokensAtBreakpoint(el.className, readBreakpoint),
    readBreakpoint,
  };
}

function resolveBrandInferenceHostId(
  selectedId: string | null,
  selectionCategory: BrandApplyAction | null,
  inferenceCategory: BrandApplyAction,
  targets: readonly { hostId: string }[],
): string | null {
  if (selectedId && selectionCategory === inferenceCategory) {
    return selectedId;
  }
  return targets[0]?.hostId ?? null;
}

export type BrandKitPanelProps = {
  channelReady: boolean;
  selectedId: string | null;
  selectedEntry?: IndexWireEntry | null;
  selectionMissing: boolean;
  styleHostId: string | null;
  developerDetails: boolean;
  embeddedInTab?: boolean;
  activeBreakpoint?: Breakpoint;
  styleResyncVersion?: number;
  indexEntries?: readonly IndexWireEntry[];
  knownIds?: ReadonlySet<string>;
  duplicateErrors?: readonly DuplicateIdError[];
  brandBulkProgress?: BrandBulkProgress | null;
  brandBulkAppliedByAction?: BrandBulkAppliedByAction;
  brandBulkApplyReady?: boolean;
  brandBulkValidatedAction?: BrandApplyAction | null;
  brandBulkValidatedConfig?: BrandConfig | null;
  onRequestBrandBulkPreview?: (
    action: BrandApplyAction,
    brandConfig: BrandConfig,
    targets: Array<{ hostId: string; ops: PatchOp[] }>,
    summaryLabel: string,
  ) => void;
  /** Clears bulk-apply locks after a successful brand save. */
  onBrandSaved?: () => void;
  /** Clears stale bulk validate/apply when presets change after validate. */
  onBrandDraftChange?: (draft: BrandConfig) => void;
};

type PresetChipGroupProps<T extends string> = {
  label: string;
  value: T;
  options: readonly T[];
  getLabel: (value: T) => string;
  onChange: (value: T) => void;
};

function PresetChipGroup<T extends string>({
  label,
  value,
  options,
  getLabel,
  onChange,
}: PresetChipGroupProps<T>): ReactElement {
  return (
    <div className="nuvio-brand-field">
      <p className="nuvio-brand-field-label">{label}</p>
      <div className="nuvio-brand-chip-row">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`nuvio-brand-chip ${value === option ? "nuvio-brand-chip--active" : ""}`}
            onClick={() => onChange(option)}
          >
            {getLabel(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorPresetGroup({
  label,
  value,
  colors,
  onChange,
}: {
  label: string;
  value: BrandColor;
  colors: readonly BrandColor[];
  onChange: (color: BrandColor) => void;
}): ReactElement {
  return (
    <div className="nuvio-brand-field">
      <p className="nuvio-brand-field-label">{label}</p>
      <div className="nuvio-brand-color-row">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            title={getBrandColorLabel(color)}
            aria-label={getBrandColorLabel(color)}
            className={`nuvio-brand-color-swatch ${value === color ? "nuvio-brand-color-swatch--active" : ""}`}
            onClick={() => onChange(color)}
          >
            <span
              className={`nuvio-brand-color-swatch-dot ${color === "none" ? "nuvio-brand-color-swatch-dot--none" : ""}`}
              style={
                color === "none"
                  ? undefined
                  : { backgroundColor: PREVIEW_COLORS[color].swatch }
              }
            />
            <span className="nuvio-brand-color-swatch-label">{getBrandColorLabel(color)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function BrandKitPanel({
  channelReady,
  selectedId,
  selectedEntry = null,
  selectionMissing,
  styleHostId,
  developerDetails,
  embeddedInTab = false,
  activeBreakpoint = "xl",
  styleResyncVersion = 0,
  indexEntries = [],
  knownIds = new Set<string>(),
  duplicateErrors = [],
  brandBulkProgress = null,
  brandBulkAppliedByAction = {},
  brandBulkApplyReady = false,
  brandBulkValidatedAction = null,
  brandBulkValidatedConfig = null,
  onRequestBrandBulkPreview,
  onBrandSaved,
  onBrandDraftChange,
}: BrandKitPanelProps): ReactElement {
  const [saved, setSaved] = useState<BrandConfig>(DEFAULT_BRAND_CONFIG);
  const [draft, setDraft] = useState<BrandConfig>(DEFAULT_BRAND_CONFIG);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [applyError, setApplyError] = useState<string | null>(null);
  const [openedTracked, setOpenedTracked] = useState(false);
  const [pagePcc, setPagePcc] = useState<PccManifest | null>(null);
  const [activeCategory, setActiveCategory] = useState<BrandApplyAction>("button");
  const [manualCategory, setManualCategory] = useState<BrandApplyAction | null>(null);
  const [pageBaselineDraft, setPageBaselineDraft] = useState<BrandConfig>(DEFAULT_BRAND_CONFIG);
  const [showFirstRunChecklist, setShowFirstRunChecklist] = useState(
    () => !isBrandKitFirstRunDismissed(),
  );
  const lastPresetSyncKeyRef = useRef<string | null>(null);
  const userEditedPresetsRef = useRef(false);
  const pathname = useSpaPathname();

  const dirty = !brandConfigsEqual(draft, saved);

  useEffect(() => {
    if (!channelReady) {
      return;
    }
    let cancelled = false;
    void fetchPagePcc(pathname)
      .then((manifest) => {
        if (!cancelled) {
          setPagePcc(manifest);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPagePcc(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [channelReady, pathname]);

  useEffect(() => {
    if (!channelReady || loadState !== "idle") {
      return;
    }
    setLoadState("loading");
    void fetchBrandConfig()
      .then((config) => {
        setSaved(config);
        setDraft(config);
        setLoadState("ready");
      })
      .catch(() => {
        setSaved(DEFAULT_BRAND_CONFIG);
        setDraft(DEFAULT_BRAND_CONFIG);
        setLoadState("error");
      });
  }, [channelReady, loadState]);

  const selectionCategory = useMemo(() => {
    if (!selectedEntry || selectionMissing) {
      return null;
    }
    return resolveBrandCategoryForEntry(selectedEntry);
  }, [selectedEntry, selectionMissing]);

  useEffect(() => {
    setManualCategory(null);
  }, [selectedId]);

  const bulkTargetsByAction = useMemo(() => {
    return Object.fromEntries(
      BRAND_APPLY_ACTIONS.map((action) => [
        action,
        listVisibleBrandBulkTargets(indexEntries, action, knownIds, duplicateErrors, pagePcc),
      ]),
    ) as Record<BrandApplyAction, ReturnType<typeof listVisibleBrandBulkTargets>>;
  }, [duplicateErrors, indexEntries, knownIds, pagePcc]);

  const hasBrandableHostsOnPage = useMemo(
    () => BRAND_APPLY_ACTIONS.some((action) => (bulkTargetsByAction[action]?.length ?? 0) > 0),
    [bulkTargetsByAction],
  );

  const dismissFirstRunChecklist = useCallback(() => {
    dismissBrandKitFirstRun();
    setShowFirstRunChecklist(false);
  }, []);

  const trackOpened = useCallback(() => {
    if (!openedTracked) {
      captureBrandKitOpened();
      setOpenedTracked(true);
    }
  }, [openedTracked]);

  useEffect(() => {
    if (manualCategory) {
      setActiveCategory(manualCategory);
      return;
    }
    if (selectionCategory) {
      setActiveCategory(selectionCategory);
      return;
    }
    setActiveCategory((prev) => {
      if ((bulkTargetsByAction[prev]?.length ?? 0) > 0) {
        return prev;
      }
      return pickDefaultActiveCategory(bulkTargetsByAction);
    });
  }, [bulkTargetsByAction, manualCategory, pathname, selectionCategory]);

  const inferenceCategory = useMemo(
    () => resolveBrandPresetCategory(selectionCategory, activeCategory, manualCategory),
    [activeCategory, manualCategory, selectionCategory],
  );

  const brandKitUnlocked = manualCategory !== null || Boolean(selectedId && !selectionMissing && selectionCategory);
  const nonBrandableSelection = Boolean(
    selectedId && !selectionMissing && selectedEntry && !selectionCategory && !manualCategory,
  );
  const hasPageSelection = Boolean(selectedId && !selectionMissing);
  const draftChangedFromPage = !brandConfigsEqual(draft, pageBaselineDraft);
  const showCategorySample = brandKitUnlocked && !hasPageSelection;
  const showChangePreview = brandKitUnlocked && hasPageSelection && draftChangedFromPage;
  const showOnPageHint = brandKitUnlocked && hasPageSelection && !draftChangedFromPage;

  const presetDimensions = useMemo(
    () => brandPresetDimensionsForAction(activeCategory),
    [activeCategory],
  );

  const activeCategoryCount = bulkTargetsByAction[activeCategory]?.length ?? 0;
  const activeCategoryLocked = isBrandBulkCategoryLocked(
    activeCategory,
    draft,
    brandBulkAppliedByAction,
  );
  const bulkValidating = brandBulkProgress?.phase === "validating";
  const isCategoryValidateDisabled = (action: BrandApplyAction): boolean =>
    isBrandBulkValidateDisabled(
      action,
      draft,
      brandBulkAppliedByAction,
      brandBulkValidatedAction,
      brandBulkValidatedConfig,
      brandBulkApplyReady,
      bulkValidating,
    );

  useEffect(() => {
    lastPresetSyncKeyRef.current = null;
    userEditedPresetsRef.current = false;
  }, [inferenceCategory, selectedId]);

  useEffect(() => {
    if (loadState === "ready") {
      lastPresetSyncKeyRef.current = null;
      userEditedPresetsRef.current = false;
    }
  }, [loadState]);

  useEffect(() => {
    if (loadState !== "ready" || !brandKitUnlocked) {
      return;
    }
    const targets = bulkTargetsByAction[inferenceCategory] ?? [];
    const hostId = resolveBrandInferenceHostId(
      selectedId,
      selectionCategory,
      inferenceCategory,
      targets,
    );
    if (!hostId) {
      return;
    }
    const { tokens: classTokens, readBreakpoint } = readHostClassTokens(
      hostId,
      activeBreakpoint,
      inferenceCategory,
    );
    if (classTokens.length === 0) {
      return;
    }
    const contextKey = brandPresetContextKey(
      hostId,
      inferenceCategory,
      readBreakpoint,
      styleResyncVersion,
    );
    const contextChanged = shouldSyncDraftFromPageInference(
      contextKey,
      lastPresetSyncKeyRef.current,
    );
    const selectionHostActive = Boolean(
      selectedId && hostId === selectedId && selectionCategory === inferenceCategory,
    );
    const inferred = inferBrandPresetsFromTokens(classTokens, inferenceCategory);
    const inferrableDimensions = brandPresetDimensionsForAction(inferenceCategory);
    const pageDraft = buildBrandPageBaselineDraft(saved, inferred, inferrableDimensions);

    setPageBaselineDraft(pageDraft);

    if (contextChanged) {
      userEditedPresetsRef.current = false;
    }

    if (
      shouldMirrorSelectionIntoDraft(
        selectionHostActive,
        userEditedPresetsRef.current,
        contextChanged,
      )
    ) {
      setDraft(pageDraft);
    }

    lastPresetSyncKeyRef.current = contextKey;
  }, [
    activeBreakpoint,
    brandKitUnlocked,
    bulkTargetsByAction,
    inferenceCategory,
    loadState,
    saved,
    selectedId,
    selectionCategory,
    styleResyncVersion,
  ]);

  const updateDraft = useCallback(
    (patch: Partial<BrandConfig>, category: BrandPresetDimension) => {
      trackOpened();
      captureBrandPresetChanged(category);
      userEditedPresetsRef.current = true;
      setDraft((prev) => {
        const next = { ...prev, ...patch };
        onBrandDraftChange?.(next);
        return next;
      });
      setSaveState("idle");
    },
    [onBrandDraftChange, trackOpened],
  );

  const onSaveBrand = useCallback(async () => {
    if (!channelReady) {
      return;
    }
    setSaveState("saving");
    try {
      const written = await saveBrandConfig(draft);
      setSaved(written);
      setDraft(written);
      userEditedPresetsRef.current = true;
      setSaveState("saved");
      captureBrandSaved();
      onBrandSaved?.();
    } catch {
      setSaveState("error");
      captureBrandStyleFailed("brand_save_failed");
    }
  }, [channelReady, draft, onBrandSaved]);

  const onBulkApplyAction = useCallback(
    (action: BrandApplyAction) => {
      trackOpened();
      setApplyError(null);
      if (!channelReady) {
        const msg = "Dev channel is not connected yet.";
        setApplyError(msg);
        captureBrandStyleFailed("channel_not_ready");
        return;
      }
      const targets = bulkTargetsByAction[action] ?? [];
      if (targets.length === 0) {
        setApplyError(`No ${BULK_ACTION_LABELS[action].toLowerCase()} found on this page.`);
        return;
      }
      const opsTargets = buildBrandBulkTargetOps(action, draft, targets, indexEntries);
      const summary = buildBrandValidateSummary(action, draft, targets.length);
      captureBrandStylePreviewed(action, dirty);
      onRequestBrandBulkPreview?.(action, draft, opsTargets, summary);
    },
    [
      bulkTargetsByAction,
      channelReady,
      dirty,
      draft,
      indexEntries,
      onRequestBrandBulkPreview,
      trackOpened,
    ],
  );

  const dirtyLabel =
    saveState === "saving"
      ? "Saving brand…"
      : saveState === "error"
        ? "Could not save brand"
        : dirty
          ? "Unsaved brand changes"
          : saveState === "saved"
            ? "Brand saved"
            : "Brand saved";

  return (
    <section className={embeddedInTab ? "nuvio-brand-kit" : "nuvio-card nuvio-stack-2 nuvio-brand-kit"}>
      {!embeddedInTab ? <h3 className="nuvio-section-title">Brand Kit</h3> : null}
      {embeddedInTab && !brandKitUnlocked && !nonBrandableSelection ? (
        <p className="nuvio-brand-kit-lead">
          Select a component on the page to define or review its branding, then validate and
          apply from the action bar.
        </p>
      ) : null}
      {loadState === "loading" ? (
        <p className="nuvio-text-2xs nuvio-text-muted">Loading brand…</p>
      ) : null}
      {loadState === "error" ? (
        <p className="nuvio-text-2xs nuvio-text-warn">Using default brand — could not load saved brand.</p>
      ) : null}

      {!developerDetails && showFirstRunChecklist && hasBrandableHostsOnPage ? (
        <BrandKitFirstRunChecklist onDismiss={dismissFirstRunChecklist} />
      ) : null}

      {nonBrandableSelection ? (
        <p className="nuvio-banner nuvio-banner--info nuvio-brand-non-brandable">
          This element isn&apos;t brandable with Brand Kit — use the Edit tab to change it
          directly.
        </p>
      ) : null}

      {brandKitUnlocked ? (
        <>
      <div className="nuvio-brand-category">
        <p className="nuvio-brand-field-label">Category</p>
        <div className="nuvio-brand-category-row" role="tablist" aria-label="Brand categories">
          {BRAND_APPLY_ACTIONS.map((action) => {
            const count = bulkTargetsByAction[action]?.length ?? 0;
            const isActive = activeCategory === action;
            return (
              <button
                key={action}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`nuvio-brand-category-chip ${isActive ? "nuvio-brand-category-chip--active" : ""}`}
                disabled={count === 0}
                title={count === 0 ? `No ${BULK_ACTION_LABELS[action].toLowerCase()} on this page` : undefined}
                onClick={() => {
                  trackOpened();
                  setManualCategory(action);
                  setActiveCategory(action);
                  setApplyError(null);
                }}
              >
                {CATEGORY_SELECTOR_LABELS[action]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="nuvio-brand-presets">
        {presetDimensions.includes("surface") ? (
          <PresetChipGroup<BrandSurface>
            label={BRAND_SURFACE_FIELD_LABEL}
            value={draft.surface}
            options={BRAND_SURFACES}
            getLabel={getBrandSurfaceLabel}
            onChange={(surface) => updateDraft({ surface }, "surface")}
          />
        ) : null}
        {presetDimensions.includes("color") ? (
          <ColorPresetGroup
            label={getBrandColorSlotLabel(activeCategory)}
            value={draft.color}
            colors={brandColorsForAction(activeCategory)}
            onChange={(color) => updateDraft({ color }, "color")}
          />
        ) : null}
        {presetDimensions.includes("buttonVariant") ? (
          <PresetChipGroup<BrandButtonVariant>
            label={BRAND_BUTTON_VARIANT_FIELD_LABEL}
            value={draft.buttonVariant}
            options={BRAND_BUTTON_VARIANTS}
            getLabel={getBrandButtonVariantLabel}
            onChange={(buttonVariant) => updateDraft({ buttonVariant }, "buttonVariant")}
          />
        ) : null}
        {presetDimensions.includes("buttonHover") ? (
          <PresetChipGroup<BrandButtonHover>
            label={BRAND_BUTTON_HOVER_FIELD_LABEL}
            value={draft.buttonHover}
            options={BRAND_BUTTON_HOVERS}
            getLabel={getBrandButtonHoverLabel}
            onChange={(buttonHover) => updateDraft({ buttonHover }, "buttonHover")}
          />
        ) : null}
        {presetDimensions.includes("cardShadow") ? (
          <PresetChipGroup<BrandCardShadow>
            label={BRAND_CARD_SHADOW_FIELD_LABEL}
            value={draft.cardShadow}
            options={BRAND_CARD_SHADOWS}
            getLabel={getBrandCardShadowLabel}
            onChange={(cardShadow) => updateDraft({ cardShadow }, "cardShadow")}
          />
        ) : null}
        {presetDimensions.includes("cardHover") ? (
          <PresetChipGroup<BrandCardHover>
            label={BRAND_CARD_HOVER_FIELD_LABEL}
            value={draft.cardHover}
            options={BRAND_CARD_HOVERS}
            getLabel={getBrandCardHoverLabel}
            onChange={(cardHover) => updateDraft({ cardHover }, "cardHover")}
          />
        ) : null}
        {presetDimensions.includes("radius") || presetDimensions.includes("density") ? (
          <div className="nuvio-brand-presets-grid">
            {presetDimensions.includes("radius") ? (
              <PresetChipGroup<BrandRadius>
                label={BRAND_RADIUS_FIELD_LABEL}
                value={draft.radius}
                options={BRAND_RADIUS}
                getLabel={getBrandRadiusLabel}
                onChange={(radius) => updateDraft({ radius }, "radius")}
              />
            ) : null}
            {presetDimensions.includes("density") ? (
              <PresetChipGroup<BrandDensity>
                label={BRAND_DENSITY_FIELD_LABEL}
                value={draft.density}
                options={BRAND_DENSITY}
                getLabel={getBrandDensityLabel}
                onChange={(density) => updateDraft({ density }, "density")}
              />
            ) : null}
          </div>
        ) : null}
        {presetDimensions.includes("typography") ? (
          <PresetChipGroup<BrandTypography>
            label={getBrandTypographyFieldLabel(activeCategory)}
            value={draft.typography}
            options={BRAND_TYPOGRAPHY}
            getLabel={getBrandTypographyLabel}
            onChange={(typography) => updateDraft({ typography }, "typography")}
          />
        ) : null}
        {activeCategory === "text" ? (
          <p className="nuvio-brand-fixed-recipe-note">
            Body text keeps a fixed readable size and weight; choose the text color above.
          </p>
        ) : null}
      </div>

      {showOnPageHint ? (
        <p className="nuvio-brand-on-page-hint">Current branding is shown on your selection on the page.</p>
      ) : null}
      {showCategorySample ? (
        <BrandCategorySample action={activeCategory} draft={draft} mode="sample" />
      ) : null}
      {showChangePreview ? (
        <BrandCategorySample
          action={activeCategory}
          draft={draft}
          mode="preview"
          categoryCount={activeCategoryCount}
        />
      ) : null}

      <div className="nuvio-brand-save-bar">
        <button
          type="button"
          className="nuvio-button nuvio-button-primary nuvio-brand-save-btn"
          disabled={!channelReady || !dirty || saveState === "saving"}
          onClick={(e) => {
            e.preventDefault();
            void onSaveBrand();
          }}
        >
          Save Brand
        </button>
        <span
          className={`nuvio-brand-save-status ${dirty || saveState === "error" ? "nuvio-brand-save-status--warn" : ""}`}
        >
          {dirtyLabel}
        </span>
      </div>

      <div className="nuvio-brand-bulk">
        <p className="nuvio-brand-field-label">Validate on page</p>
        <p className="nuvio-brand-bulk-lead">
          Validate all {BULK_ACTION_LABELS[activeCategory].toLowerCase()} on this page, then apply
          from the action bar below.
        </p>
        {dirty ? (
          <p className="nuvio-brand-apply-note">
            Unsaved changes — bulk validate uses the current draft values.
          </p>
        ) : null}
        {brandBulkProgress?.phase === "validating" ? (
          <p className="nuvio-text-2xs nuvio-text-muted">
            Validating {Math.min(brandBulkProgress.current + 1, brandBulkProgress.total)} of{" "}
            {brandBulkProgress.total}…
          </p>
        ) : null}
        {brandBulkProgress?.phase === "ready" ? (
          <p className="nuvio-text-2xs nuvio-text-success">
            {brandBulkProgress.readyCount} of {brandBulkProgress.total} ready to apply
            {brandBulkProgress.failureCount > 0
              ? ` · ${brandBulkProgress.failureCount} skipped`
              : ""}
          </p>
        ) : null}
        {brandBulkProgress?.phase === "applying" ? (
          <p className="nuvio-text-2xs nuvio-text-muted">
            Applying {brandBulkProgress.current + 1} of {brandBulkProgress.total}…
          </p>
        ) : null}
        <button
          type="button"
          className="nuvio-button nuvio-button-primary nuvio-brand-bulk-primary"
          disabled={
            !channelReady ||
            activeCategoryCount === 0 ||
            isCategoryValidateDisabled(activeCategory)
          }
          title={
            isBrandBulkCategoryValidationReady(
              activeCategory,
              draft,
              brandBulkValidatedAction,
              brandBulkValidatedConfig,
              brandBulkApplyReady,
            )
              ? "Validated — use Apply to Code below, or change presets to validate again"
              : activeCategoryLocked
              ? "Already applied with this brand — change presets or save a new brand to validate again"
              : activeCategoryCount === 0
                ? `No ${BULK_ACTION_LABELS[activeCategory].toLowerCase()} on this page`
                : undefined
          }
          onClick={() => onBulkApplyAction(activeCategory)}
        >
          Validate all {BULK_ACTION_LABELS[activeCategory].toLowerCase()} ({activeCategoryCount})
        </button>
        {developerDetails ? (
          <div className="nuvio-brand-bulk-grid">
            {BRAND_APPLY_ACTIONS.map((action) => {
              const count = bulkTargetsByAction[action]?.length ?? 0;
              const validateDisabled = isCategoryValidateDisabled(action);
              return (
                <button
                  key={action}
                  type="button"
                  className="nuvio-brand-bulk-btn"
                  disabled={!channelReady || count === 0 || validateDisabled}
                  title={
                    isBrandBulkCategoryValidationReady(
                      action,
                      draft,
                      brandBulkValidatedAction,
                      brandBulkValidatedConfig,
                      brandBulkApplyReady,
                    )
                      ? "Validated — use Apply to Code below, or change presets to validate again"
                      : isBrandBulkCategoryLocked(action, draft, brandBulkAppliedByAction)
                        ? "Already applied with this brand — change presets or save a new brand to validate again"
                        : undefined
                  }
                  onClick={() => onBulkApplyAction(action)}
                >
                  Validate all {BULK_ACTION_LABELS[action].toLowerCase()} ({count})
                </button>
              );
            })}
          </div>
        ) : null}
        {applyError ? <p className="nuvio-text-2xs nuvio-text-error">{applyError}</p> : null}
      </div>
        </>
      ) : null}
    </section>
  );
}
