import type { ReactElement } from "react";

export type EditorPanelTab = "edit" | "tag" | "brand";

export type EditorPanelTabsProps = {
  active: EditorPanelTab;
  onChange: (tab: EditorPanelTab) => void;
};

export function EditorPanelTabs({ active, onChange }: EditorPanelTabsProps): ReactElement {
  return (
    <div className="rte-editor-tabs" role="tablist" aria-label="Editor sections">
      <button
        type="button"
        role="tab"
        aria-selected={active === "edit"}
        className={`rte-editor-tab ${active === "edit" ? "rte-editor-tab--active" : ""}`}
        onClick={() => onChange("edit")}
      >
        <span className="rte-editor-tab-label">Edit</span>
        <span className="rte-editor-tab-hint">Element</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === "tag"}
        className={`rte-editor-tab ${active === "tag" ? "rte-editor-tab--active" : ""}`}
        onClick={() => onChange("tag")}
      >
        <span className="rte-editor-tab-label">Make Editable</span>
        <span className="rte-editor-tab-hint">Click page</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === "brand"}
        className={`rte-editor-tab ${active === "brand" ? "rte-editor-tab--active" : ""}`}
        onClick={() => onChange("brand")}
      >
        <span className="rte-editor-tab-label">Brand Kit</span>
        <span className="rte-editor-tab-hint">Project</span>
      </button>
    </div>
  );
}
