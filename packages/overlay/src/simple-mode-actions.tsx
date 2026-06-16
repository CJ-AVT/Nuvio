import type { ReactElement } from "react";

export const NUVO_PREVIEW_ON_PAGE_LABEL = "Preview on page";

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
    <section className="nuvio-card nuvio-card--actions nuvio-stack-2">
      {previewBusy ? (
        <p className="nuvio-banner nuvio-banner--info nuvio-text-2xs">Validating your changes…</p>
      ) : brandPagePreviewActive ? (
        <p className="nuvio-banner nuvio-banner--info nuvio-text-2xs">
          Brand recipe is painted on matching elements. Cancel to revert.
        </p>
      ) : (
        <p className="nuvio-pending-label">{pendingLabel}</p>
      )}
      {previewBoxBody ? (
        <div className="nuvio-preview-box nuvio-preview-box--compact">
          <p className="nuvio-preview-box-body">{previewBoxBody}</p>
        </div>
      ) : null}
      <div className="nuvio-action-stack">
        {brandBulkApplyReady && onBrandPagePreview && !brandBulkFlowActive ? (
          <button
            type="button"
            disabled={brandPagePreviewActive || previewBusy}
            className="nuvio-button nuvio-button--block"
            onClick={onBrandPagePreview}
          >
            {NUVO_PREVIEW_ON_PAGE_LABEL}
          </button>
        ) : null}
        {!brandBulkFlowActive ? (
          <button
            type="button"
            disabled={previewDisabled}
            className="nuvio-button nuvio-button--block"
            onClick={onPreview}
          >
            {previewLabel}
          </button>
        ) : null}
        <button
          type="button"
          disabled={applyDisabled}
          className="nuvio-button nuvio-button-primary nuvio-button--block"
          onClick={onApply}
        >
          {applyLabel}
        </button>
        <button
          type="button"
          disabled={undoDisabled}
          className="nuvio-button nuvio-button-ghost nuvio-button--block"
          onClick={onUndo}
        >
          Undo
        </button>
      </div>
    </section>
  );
}
