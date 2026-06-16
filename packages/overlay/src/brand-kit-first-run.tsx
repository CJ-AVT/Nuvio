import type { ReactElement } from "react";

export type BrandKitFirstRunChecklistProps = {
  onDismiss: () => void;
};

export function BrandKitFirstRunChecklist({ onDismiss }: BrandKitFirstRunChecklistProps): ReactElement {
  return (
    <section className="rte-card rte-stack-2 rte-brand-first-run">
      <p className="rte-font-medium rte-text-xs">Brand Kit checklist</p>
      <ol className="rte-brand-first-run-steps rte-text-2xs rte-text-muted">
        <li>Select a component on the page (or pick a category below)</li>
        <li>Adjust branding presets and Save Brand</li>
        <li>Validate, then Apply in the Apply Brand section</li>
      </ol>
      <button type="button" className="rte-button rte-button-primary" onClick={onDismiss}>
        Got it
      </button>
    </section>
  );
}
