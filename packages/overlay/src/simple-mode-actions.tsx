import type { ReactElement } from "react";

export const RTE_PREVIEW_ON_PAGE_LABEL = "Preview on page";

export type PreviewOrigin = "brand" | "panel" | null;

export type SimpleModeActionBarProps = {
  previewLabel: string;
  applyLabel: string;
  previewBusy: boolean;
  previewDisabled: boolean;
  applyDisabled: boolean;
  undoDisabled: boolean;
  hasStagedOps: boolean;
  previewReady: boolean;
  humanPreviewBlock: string | null;
  structuralPreviewActive: boolean;
  brandPreviewSummary: string | null;
  brandApplyReady: boolean;
  brandBulkApplyReady?: boolean;
  brandBulkFlowActive?: boolean;
  brandPagePreviewActive?: boolean;
  onBrandPagePreview?: () => void;
  onPreview: () => void;
  onApply: () => void;
  onUndo: () => void;
};

export function SimpleModeActionBar({
  previewLabel,
  applyLabel,
  previewBusy,
  previewDisabled,
  applyDisabled,
  undoDisabled,
  hasStagedOps,
  previewReady,
  humanPreviewBlock,
  structuralPreviewActive,
  brandPreviewSummary,
  brandApplyReady,
  brandBulkApplyReady = false,
  brandBulkFlowActive = false,
  brandPagePreviewActive = false,
  onBrandPagePreview,
  onPreview,
  onApply,
  onUndo,
}: SimpleModeActionBarProps): ReactElement {
  const pendingLabel = brandPagePreviewActive
    ? "Brand preview active on page"
    : brandBulkApplyReady
    ? "Brand bulk ready to apply"
    : brandApplyReady
    ? "Brand style ready to apply"
    : hasStagedOps
      ? previewReady
        ? "Changes to apply"
        : "1 pending change"
      : "No pending changes";

  const previewBoxBody =
    (brandBulkApplyReady || brandApplyReady) && brandPreviewSummary
      ? brandPreviewSummary
      : !structuralPreviewActive && previewReady && humanPreviewBlock
        ? humanPreviewBlock
        : null;

  return (
    <section className="rte-card rte-card--actions rte-stack-2">
      {previewBusy ? (
        <p className="rte-banner rte-banner--info rte-text-2xs">Validating your changes…</p>
      ) : brandPagePreviewActive ? (
        <p className="rte-banner rte-banner--info rte-text-2xs">
          Brand recipe is painted on matching elements. Cancel to revert.
        </p>
      ) : (
        <p className="rte-pending-label">{pendingLabel}</p>
      )}
      {previewBoxBody ? (
        <div className="rte-preview-box rte-preview-box--compact">
          <p className="rte-preview-box-body">{previewBoxBody}</p>
        </div>
      ) : null}
      <div className="rte-action-stack">
        {brandBulkApplyReady && onBrandPagePreview && !brandBulkFlowActive ? (
          <button
            type="button"
            disabled={brandPagePreviewActive || previewBusy}
            className="rte-button rte-button--block"
            onClick={onBrandPagePreview}
          >
            {RTE_PREVIEW_ON_PAGE_LABEL}
          </button>
        ) : null}
        {!brandBulkFlowActive ? (
          <button
            type="button"
            disabled={previewDisabled}
            className="rte-button rte-button--block"
            onClick={onPreview}
          >
            {previewLabel}
          </button>
        ) : null}
        <button
          type="button"
          disabled={applyDisabled}
          className="rte-button rte-button-primary rte-button--block"
          onClick={onApply}
        >
          {applyLabel}
        </button>
        <button
          type="button"
          disabled={undoDisabled}
          className="rte-button rte-button-ghost rte-button--block"
          onClick={onUndo}
        >
          Undo
        </button>
      </div>
    </section>
  );
}
