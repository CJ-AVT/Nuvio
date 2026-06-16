import { describe, expect, it } from "vitest";
import {
  inferLibraryFromFilePath,
  librarySegmentForTag,
  resolveEntryLibraryHint,
} from "./library-registry.js";
import { suggestNuvioId } from "./suggest-nuvio-id.js";

describe("library-registry", () => {
  it("detects shadcn from components/ui path", () => {
    expect(inferLibraryFromFilePath("/app/src/components/ui/button.tsx")).toBe("shadcn");
  });

  it("detects tailadmin from ecommerce path", () => {
    expect(inferLibraryFromFilePath("/app/src/components/ecommerce/Card.tsx")).toBe("tailadmin");
  });

  it("maps shadcn CardTitle to title segment", () => {
    expect(librarySegmentForTag("CardTitle", "shadcn")).toBe("title");
  });

  it("suggests library-aware ids for shadcn Button", () => {
    expect(
      suggestNuvioId({
        tagName: "Button",
        existingIds: new Set(),
        libraryHint: "shadcn",
      }),
    ).toBe("page.button");
  });

  it("resolves shadcn hint from compound tag when project uses shadcn", () => {
    expect(
      resolveEntryLibraryHint("/app/src/pages/Dashboard.tsx", "CardTitle", ["shadcn"]),
    ).toBe("shadcn");
  });
});
