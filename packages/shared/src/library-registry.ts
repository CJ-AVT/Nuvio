import type { IndexWireEntry, LibraryId } from "./protocol.js";

export type { LibraryId };
export const LIBRARY_IDS = ["shadcn", "tailadmin", "daisyui"] as const satisfies readonly LibraryId[];

/** shadcn/ui compound exports (PascalCase JSX tags). */
export const SHADCN_COMPOUND_TAGS = new Set([
  "Button",
  "Card",
  "CardHeader",
  "CardTitle",
  "CardDescription",
  "CardContent",
  "CardFooter",
  "Input",
  "Label",
  "Badge",
  "Table",
  "TableHeader",
  "TableBody",
  "TableRow",
  "TableCell",
  "TableHead",
  "Dialog",
  "DialogTitle",
  "DialogContent",
  "DialogHeader",
]);

const SHADCN_TAG_SEGMENTS: Record<string, string> = {
  Button: "button",
  Card: "card",
  CardHeader: "header",
  CardTitle: "title",
  CardDescription: "description",
  CardContent: "content",
  CardFooter: "footer",
  Input: "input",
  Label: "label",
  Badge: "badge",
  Table: "table",
  TableHeader: "header",
  TableBody: "body",
  TableRow: "row",
  TableCell: "cell",
  TableHead: "header",
  Dialog: "dialog",
  DialogTitle: "title",
  DialogContent: "content",
  DialogHeader: "header",
};

const DAISYUI_CLASS_HINTS = new Set(["btn", "card", "table", "navbar", "badge", "input"]);

export function librarySegmentForTag(tagName: string, libraryId: LibraryId): string | undefined {
  if (libraryId === "shadcn") {
    return SHADCN_TAG_SEGMENTS[tagName];
  }
  if (libraryId === "daisyui") {
    const lower = tagName.toLowerCase();
    if (DAISYUI_CLASS_HINTS.has(lower)) {
      return lower;
    }
  }
  return undefined;
}

export function isShadcnCompoundTag(tagName: string): boolean {
  return SHADCN_COMPOUND_TAGS.has(tagName);
}

/** Infer library from absolute/relative source file path. */
export function inferLibraryFromFilePath(filePath: string): LibraryId | undefined {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  if (normalized.includes("/components/ui/")) {
    return "shadcn";
  }
  if (
    normalized.includes("/layout/appsidebar") ||
    normalized.includes("/components/ecommerce/") ||
    normalized.includes("tailadmin")
  ) {
    return "tailadmin";
  }
  return undefined;
}

export function resolveEntryLibraryHint(
  filePath: string,
  tagName: string,
  detectedLibraries: readonly LibraryId[],
): LibraryId | undefined {
  const fromPath = inferLibraryFromFilePath(filePath);
  if (fromPath) {
    return fromPath;
  }
  if (detectedLibraries.includes("shadcn") && isShadcnCompoundTag(tagName)) {
    return "shadcn";
  }
  if (detectedLibraries.includes("daisyui")) {
    const lower = tagName.toLowerCase();
    if (DAISYUI_CLASS_HINTS.has(lower)) {
      return "daisyui";
    }
  }
  if (detectedLibraries.includes("tailadmin")) {
    return "tailadmin";
  }
  return undefined;
}

export function detectShadcnComponentMode(tagName: string | undefined): "card" | "button" | "table" | "form" | null {
  if (!tagName) {
    return null;
  }
  if (tagName === "Button") {
    return "button";
  }
  if (tagName === "Card" || tagName.startsWith("Card")) {
    return "card";
  }
  if (tagName.startsWith("Table")) {
    return "table";
  }
  if (tagName === "Input" || tagName === "Label") {
    return "form";
  }
  return null;
}

export function libraryGuidanceForEntry(entry: IndexWireEntry): string | undefined {
  if (entry.libraryHint !== "shadcn") {
    return undefined;
  }
  const tag = entry.tagName ?? "";
  if (isShadcnCompoundTag(tag) && entry.riskLevel === "caution" && !entry.hasLiteralClassName) {
    return "shadcn component — add className on the component call site, or tag a native child inside CardContent.";
  }
  if (tag.startsWith("Dialog") && entry.riskLevel === "unsupported") {
    return "Dialog portal content may need a tagged host inside DialogContent.";
  }
  return undefined;
}

export function formatLibraryList(libraries: readonly LibraryId[]): string {
  if (libraries.length === 0) {
    return "none detected";
  }
  return libraries.join(", ");
}
