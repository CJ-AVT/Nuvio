import type { ReactElement } from "react";
import { GUIDE_CONTENT, type GuideContent } from "./selection-guides.js";
import type { OnboardingGuideId } from "./onboarding-storage.js";

export type OnboardingGuideProps = {
  guideId: OnboardingGuideId;
  onDismiss: () => void;
  /** Welcome uses a slightly larger card; contextual hints use compact banner. */
  variant?: "welcome" | "contextual";
};

function GuideBody({ content }: { content: GuideContent }): ReactElement {
  return (
    <>
      <p className="rte-font-medium rte-text-xs">{content.title}</p>
      <p className="rte-text-2xs rte-leading-snug rte-text-muted">{content.body}</p>
    </>
  );
}

export function OnboardingGuide({
  guideId,
  onDismiss,
  variant = "contextual",
}: OnboardingGuideProps): ReactElement {
  const content = GUIDE_CONTENT[guideId];

  if (variant === "welcome") {
    return (
      <section className="rte-card rte-stack-2 rte-onboarding-welcome">
        <GuideBody content={content} />
        <ol className="rte-onboarding-steps rte-text-2xs rte-text-muted">
          <li>Turn on Make Editable</li>
          <li>Click an element on the page</li>
          <li>Confirm the name, then edit and Apply to Code</li>
        </ol>
        <button type="button" className="rte-button rte-button-primary" onClick={onDismiss}>
          Got it
        </button>
      </section>
    );
  }

  return (
    <div className="rte-banner rte-banner--info rte-stack-2 rte-onboarding-contextual">
      <GuideBody content={content} />
      <button type="button" className="rte-button" onClick={onDismiss}>
        Got it
      </button>
    </div>
  );
}
