import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DEFAULT_BRAND_CONFIG } from "@nuvio/shared";
import { BrandCategorySample } from "./brand-category-sample.js";

describe("BrandCategorySample", () => {
  it("labels discovery mode as Sample", () => {
    const html = renderToStaticMarkup(
      <BrandCategorySample action="card" draft={DEFAULT_BRAND_CONFIG} mode="sample" />,
    );
    expect(html).toContain("Sample");
    expect(html).toContain("Example styling for cards in your project.");
    expect(html).not.toContain("Preview");
  });

  it("labels change mode as Preview with page scope copy", () => {
    const html = renderToStaticMarkup(
      <BrandCategorySample
        action="button"
        draft={DEFAULT_BRAND_CONFIG}
        mode="preview"
        categoryCount={2}
      />,
    );
    expect(html).toContain("Preview");
    expect(html).toContain("All buttons on this page (2) with these settings.");
    expect(html).not.toContain("Sample</p>");
  });
});
