import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { clampToViewport, type Point } from "./overlay-chrome-storage.js";

export type UseChromeDragOptions = {
  shellRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  /** Current position; null means docked layout (no inline left/top). */
  position: Point | null;
  setPosition: (next: Point | null) => void;
  onDragEnd?: (position: Point) => void;
  margin?: number;
};

export type UseChromeDragResult = {
  dragging: boolean;
  onHeaderPointerDown: (e: React.PointerEvent) => void;
};

export function useChromeDrag({
  shellRef,
  enabled,
  position,
  setPosition,
  onDragEnd,
  margin = 16,
}: UseChromeDragOptions): UseChromeDragResult {
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef<Point>({ x: 0, y: 0 });
  const positionRef = useRef(position);
  positionRef.current = position;

  const onHeaderPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled || e.button !== 0) {
        return;
      }
      const shell = shellRef.current;
      if (!shell) {
        return;
      }
      e.preventDefault();
      const rect = shell.getBoundingClientRect();
      const startPos =
        positionRef.current ?? { x: rect.left, y: rect.top };
      if (positionRef.current === null) {
        setPosition(startPos);
      }
      offsetRef.current = {
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(true);
    },
    [enabled, shellRef, setPosition],
  );

  useEffect(() => {
    if (!dragging) {
      return;
    }
    const onMove = (e: PointerEvent) => {
      const shell = shellRef.current;
      if (!shell) {
        return;
      }
      const w = shell.offsetWidth;
      const h = shell.offsetHeight;
      const rawX = e.clientX - offsetRef.current.x;
      const rawY = e.clientY - offsetRef.current.y;
      const next = clampToViewport(rawX, rawY, w, h, margin);
      setPosition(next);
    };
    const onUp = () => {
      setDragging(false);
      const shell = shellRef.current;
      const pos = positionRef.current;
      if (shell && pos) {
        const w = shell.offsetWidth;
        const h = shell.offsetHeight;
        const clamped = clampToViewport(pos.x, pos.y, w, h, margin);
        setPosition(clamped);
        onDragEnd?.(clamped);
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, margin, onDragEnd, setPosition, shellRef]);

  return { dragging, onHeaderPointerDown };
}
