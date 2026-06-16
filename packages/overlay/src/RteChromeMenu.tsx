import type { ReactElement } from "react";
import { useEffect, useId, useRef, useState } from "react";

export type RteChromeMenuProps = {
  developerDetails: boolean;
  onReset: () => void;
  onDeveloperDetailsChange: (enabled: boolean) => void;
};

export function RteChromeMenu({
  developerDetails,
  onReset,
  onDeveloperDetailsChange,
}: RteChromeMenuProps): ReactElement {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (root && !root.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  const closeAnd = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <div className="rte-chrome-menu" ref={rootRef}>
      <button
        type="button"
        className={`rte-button-icon rte-chrome-menu-trigger ${
          open ? "rte-chrome-menu-trigger--open" : ""
        }`}
        title="Editor options"
        aria-label="Editor options"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        ⋮
      </button>
      {open ? (
        <div id={menuId} className="rte-chrome-menu-list" role="menu">
          <button
            type="button"
            className="rte-chrome-menu-item"
            role="menuitem"
            onClick={() => closeAnd(onReset)}
          >
            Reset
          </button>
          <button
            type="button"
            className={`rte-chrome-menu-item ${
              developerDetails ? "rte-chrome-menu-item--checked" : ""
            }`}
            role="menuitemcheckbox"
            aria-checked={developerDetails}
            onClick={() => closeAnd(() => onDeveloperDetailsChange(!developerDetails))}
          >
            Developer details
          </button>
        </div>
      ) : null}
    </div>
  );
}
