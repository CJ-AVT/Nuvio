import type { ReactElement } from "react";

export type EditorPanelTab = "edit" | "brand";

export type EditorPanelTabsProps = {
  active: EditorPanelTab;
  onChange: (tab: EditorPanelTab) => void;
};

export function EditorPanelTabs({ active, onChange }: EditorPanelTabsProps): ReactElement {
  return (
    <div className="nuvio-editor-tabs" role="tablist" aria-label="Editor sections">
      <button
        type="button"
        role="tab"
        aria-selected={active === "edit"}
        className={`nuvio-editor-tab ${active === "edit" ? "nuvio-editor-tab--active" : ""}`}
        onClick={() => onChange("edit")}
      >
        <span className="nuvio-editor-tab-label">Edit</span>
        <span className="nuvio-editor-tab-hint">Element</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === "brand"}
        className={`nuvio-editor-tab ${active === "brand" ? "nuvio-editor-tab--active" : ""}`}
        onClick={() => onChange("brand")}
      >
        <span className="nuvio-editor-tab-label">Brand Kit</span>
        <span className="nuvio-editor-tab-hint">Project</span>
      </button>
    </div>
  );
}
