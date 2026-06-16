import type { ReactElement } from "react";
import type { UntaggedLocTarget } from "./nuvio-loc-dom.js";
import { isValidNuvioId } from "./suggest-nuvio-id.js";

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
  const idOk = isValidNuvioId(suggestedId.trim());

  return (
    <div className="nuvio-make-editable">
      <p className="nuvio-make-editable-lead">
        This <strong>{target.tagName}</strong> element is not editable yet.
      </p>
      <p className="nuvio-make-editable-hint">
        nuvio will add a <code>data-nuvio-id</code> in your source file so you can edit it
        visually.
      </p>
      <label className="nuvio-field-label" htmlFor="nuvio-suggested-id">
        Editable id
      </label>
      <input
        id="nuvio-suggested-id"
        className="nuvio-input"
        value={suggestedId}
        onChange={(e) => onSuggestedIdChange(e.target.value)}
        disabled={busy}
        spellCheck={false}
      />
      {!idOk ? (
        <p className="nuvio-field-error">Use lowercase segments like page.title or hero.button</p>
      ) : null}
      {error ? <p className="nuvio-field-error">{error}</p> : null}
      <div className="nuvio-make-editable-actions">
        <button
          type="button"
          className="nuvio-button nuvio-button-primary"
          disabled={busy || !idOk}
          onClick={onConfirm}
        >
          {busy ? "Tagging…" : "Make Editable"}
        </button>
        <button
          type="button"
          className="nuvio-button nuvio-button-secondary"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
