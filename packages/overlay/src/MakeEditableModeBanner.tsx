import type { ReactElement } from "react";

export type MakeEditableModeBannerProps = {
  indexedCount: number;
};

export function MakeEditableModeBanner({
  indexedCount,
}: MakeEditableModeBannerProps): ReactElement {
  return (
    <section className="rte-card rte-stack-2 rte-make-editable-banner">
      <p className="rte-font-medium rte-text-xs">Make Editable is on</p>
      <p className="rte-text-2xs rte-leading-snug rte-text-muted">
        Click any element on the page, confirm the suggested name, and rte saves it in your
        source file.
      </p>
      {indexedCount === 0 ? (
        <p className="rte-text-2xs rte-text-muted">
          No editable areas yet — click something on the page to get started.
        </p>
      ) : null}
    </section>
  );
}
