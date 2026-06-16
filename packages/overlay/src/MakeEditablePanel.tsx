import type { ReactElement } from "react";
import type { UntaggedLocTarget } from "./rte-loc-dom.js";
import { isValidRteId } from "./suggest-rte-id.js";

export type MakeEditablePanelProps = {
  target: UntaggedLocTarget;
  suggestedId: string;
  onSuggestedIdChange: (id: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
  error: string | null;
};

export function MakeEditablePanel({
  target,
  suggestedId,
  onSuggestedIdChange,
  onConfirm,
  onCancel,
  busy,
  error,
}: MakeEditablePanelProps): ReactElement {
  const idOk = isValidRteId(suggestedId.trim());

  return (
    <div className="rte-make-editable">
      <p className="rte-make-editable-lead">
        This <strong>{target.tagName}</strong> element is not editable yet.
      </p>
      <p className="rte-make-editable-hint">
        rte will add a <code>data-rte-id</code> in your source file so you can edit it
        visually.
      </p>
      <label className="rte-field-label" htmlFor="rte-suggested-id">
        Editable id
      </label>
      <input
        id="rte-suggested-id"
        className="rte-input"
        value={suggestedId}
        onChange={(e) => onSuggestedIdChange(e.target.value)}
        disabled={busy}
        spellCheck={false}
      />
      {!idOk ? (
        <p className="rte-field-error">Use lowercase segments like page.title or hero.button</p>
      ) : null}
      {error ? <p className="rte-field-error">{error}</p> : null}
      <div className="rte-make-editable-actions">
        <button
          type="button"
          className="rte-button rte-button-primary"
          disabled={busy || !idOk}
          onClick={onConfirm}
        >
          {busy ? "Tagging…" : "Make Editable"}
        </button>
        <button
          type="button"
          className="rte-button rte-button-secondary"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
