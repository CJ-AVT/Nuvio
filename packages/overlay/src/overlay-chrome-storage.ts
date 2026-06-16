export const OVERLAY_CHROME_STORAGE_KEY = "rte:overlay-chrome:v2";

/** Default inset from viewport edges (chip + docked editor). */
export const OVERLAY_CHROME_MARGIN = 24;

export type ChipCorner = "bottom-right" | "bottom-left" | "top-right" | "top-left";

export type Point = { x: number; y: number };

export type OverlayChromePersist = {
  panel: {
    collapsed: boolean;
    /** When set, panel is floating at x/y (viewport px). When null, docked left. */
    position: { x: number; y: number } | null;
  };
  chip: {
    collapsed: boolean;
    corner: ChipCorner;
    /** Last dragged/floating top-left position; when set, overrides corner anchor. */
    position: Point | null;
  };
};

export const DEFAULT_OVERLAY_CHROME: OverlayChromePersist = {
  panel: { collapsed: false, position: null },
  chip: { collapsed: false, corner: "bottom-right", position: null },
};

const CHIP_CORNERS: readonly ChipCorner[] = [
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
];

function isChipCorner(v: unknown): v is ChipCorner {
  return typeof v === "string" && (CHIP_CORNERS as readonly string[]).includes(v);
}

function isPoint(v: unknown): v is Point {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as Point).x === "number" &&
    typeof (v as Point).y === "number" &&
    Number.isFinite((v as Point).x) &&
    Number.isFinite((v as Point).y)
  );
}

export function parseOverlayChromePersist(raw: string | null): OverlayChromePersist {
  if (!raw) {
    return DEFAULT_OVERLAY_CHROME;
  }
  try {
    const data = JSON.parse(raw) as Partial<OverlayChromePersist>;
    const panel = data.panel;
    const chip = data.chip;
    return {
      panel: {
        collapsed: panel?.collapsed === true,
        position: isPoint(panel?.position) ? panel.position : null,
      },
      chip: {
        collapsed: chip?.collapsed === true,
        corner: isChipCorner(chip?.corner) ? chip.corner : DEFAULT_OVERLAY_CHROME.chip.corner,
        position: isPoint(chip?.position) ? chip.position : null,
      },
    };
  } catch {
    return DEFAULT_OVERLAY_CHROME;
  }
}

export function loadOverlayChromePersist(): OverlayChromePersist {
  if (typeof localStorage === "undefined") {
    return DEFAULT_OVERLAY_CHROME;
  }
  return parseOverlayChromePersist(localStorage.getItem(OVERLAY_CHROME_STORAGE_KEY));
}

export function saveOverlayChromePersist(state: OverlayChromePersist): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(OVERLAY_CHROME_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

export function clampToViewport(
  x: number,
  y: number,
  width: number,
  height: number,
  margin = OVERLAY_CHROME_MARGIN,
): Point {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1080;
  const maxX = Math.max(margin, vw - width - margin);
  const maxY = Math.max(margin, vh - height - margin);
  return {
    x: Math.max(margin, Math.min(x, maxX)),
    y: Math.max(margin, Math.min(y, maxY)),
  };
}

export function isPointOffscreen(
  point: Point,
  width: number,
  height: number,
  margin = OVERLAY_CHROME_MARGIN,
): boolean {
  const clamped = clampToViewport(point.x, point.y, width, height, margin);
  return clamped.x !== point.x || clamped.y !== point.y;
}

/** Snap chip to the quadrant nearest the element center. */
export function snapToNearestCorner(centerX: number, centerY: number): ChipCorner {
  const midX = (typeof window !== "undefined" ? window.innerWidth : 1920) / 2;
  const midY = (typeof window !== "undefined" ? window.innerHeight : 1080) / 2;
  const right = centerX >= midX;
  const bottom = centerY >= midY;
  if (bottom && right) {
    return "bottom-right";
  }
  if (bottom && !right) {
    return "bottom-left";
  }
  if (!bottom && right) {
    return "top-right";
  }
  return "top-left";
}

export function cornerAnchorPosition(
  corner: ChipCorner,
  width: number,
  height: number,
  margin = OVERLAY_CHROME_MARGIN,
): Point {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1080;
  switch (corner) {
    case "bottom-right":
      return { x: vw - width - margin, y: vh - height - margin };
    case "bottom-left":
      return { x: margin, y: vh - height - margin };
    case "top-right":
      return { x: vw - width - margin, y: margin };
    case "top-left":
      return { x: margin, y: margin };
  }
}
