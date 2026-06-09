import { librarySegmentForTag } from "./library-registry.js";
import type { LibraryId } from "./protocol.js";

/** Segmented id: `page.title`, `metric.orders.card` */
export const NUVIO_ID_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;

export function isValidNuvioId(id: string): boolean {
  return NUVIO_ID_PATTERN.test(id);
}

const NATIVE_TAG_SEGMENT: Record<string, string> = {
  h1: "title",
  h2: "title",
  h3: "title",
  h4: "title",
  h5: "title",
  h6: "title",
  p: "text",
  span: "label",
  button: "button",
  a: "link",
  label: "label",
  td: "cell",
  th: "header",
  li: "item",
  img: "image",
  input: "input",
  div: "block",
  section: "section",
  article: "article",
  header: "header",
  footer: "footer",
  nav: "nav",
  main: "main",
};

function uniqueId(base: string, existing: ReadonlySet<string>): string {
  if (!existing.has(base)) {
    return base;
  }
  for (let i = 2; i < 100; i++) {
    const candidate = `${base}${i}`;
    if (!existing.has(candidate)) {
      return candidate;
    }
  }
  return `${base}.copy`;
}

/**
 * Suggest a segmented nuvio id from element tag and optional library context.
 * Does not use element text or file paths.
 */
export function suggestNuvioId(options: {
  tagName: string;
  existingIds: ReadonlySet<string>;
  parentPrefix?: string;
  libraryHint?: LibraryId;
  componentName?: string;
}): string {
  const tag = options.tagName;
  const librarySegment = options.libraryHint
    ? librarySegmentForTag(tag, options.libraryHint)
    : undefined;
  const nativeSegment = NATIVE_TAG_SEGMENT[tag.toLowerCase()];
  const segment = librarySegment ?? nativeSegment ?? "element";
  const prefix = options.parentPrefix?.trim();
  const base = prefix ? `${prefix}.${segment}` : `page.${segment}`;
  return uniqueId(base, options.existingIds);
}
