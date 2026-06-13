import type { ReactElement } from "react";

export type BrandKitFirstRunChecklistProps = {
  onDismiss: () => void;
};

export function BrandKitFirstRunChecklist({ onDismiss }: BrandKitFirstRunChecklistProps): ReactElement {
  return (
    <section className="nuvio-card nuvio-stack-2 nuvio-brand-first-run">
      <p className="nuvio-font-medium nuvio-text-xs">Brand Kit checklist</p>
      <ol className="nuvio-brand-first-run-steps nuvio-text-2xs nuvio-text-muted">
        <li>Select a component on the page (or pick a category below)</li>
        <li>Adjust branding presets and Save Brand</li>
        <li>Validate all for that category from the action bar</li>
        <li>Apply to Code when you are ready</li>
      </ol>
      <button type="button" className="nuvio-button nuvio-button-primary" onClick={onDismiss}>
        Got it
      </button>
    </section>
  );
}
