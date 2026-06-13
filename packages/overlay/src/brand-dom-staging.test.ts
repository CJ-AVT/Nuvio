import { beforeEach, describe, expect, it } from "vitest";
import {
  applyBrandPatchOpsToClassName,
  isBrandDomStagingActive,
  revertBrandDomStaging,
  stageBrandHostsOnPage,
} from "./brand-dom-staging.js";

describe("applyBrandPatchOpsToClassName", () => {
  it("merges brand fragments with tailwind-merge semantics", () => {
    const merged = applyBrandPatchOpsToClassName("bg-white border border-rose-300 rounded-md p-4", [
      { kind: "mergeTailwindClassName", classNameFragment: "border border-purple-300 rounded-xl p-6" },
    ]);
    expect(merged).toContain("border-purple-300");
    expect(merged).toContain("rounded-xl");
    expect(merged).toContain("p-6");
    expect(merged).not.toContain("border-rose-300");
    expect(merged).not.toContain("p-4");
  });
});

describe("stageBrandHostsOnPage", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    revertBrandDomStaging();
  });

  it("paints validated hosts and reverts on cancel", () => {
    const card = document.createElement("div");
    card.setAttribute("data-nuvio-id", "metric.orders.card");
    card.className = "bg-white border border-rose-300 rounded-md p-4";
    document.body.appendChild(card);

    const painted = stageBrandHostsOnPage([
      {
        hostId: "metric.orders.card",
        ops: [
          {
            kind: "mergeTailwindClassName",
            classNameFragment: "bg-white border border-purple-300 rounded-xl p-6",
          },
        ],
      },
    ]);

    expect(painted).toBe(1);
    expect(isBrandDomStagingActive()).toBe(true);
    expect(card.className).toContain("border-purple-300");
    expect(card.className).toContain("p-6");

    revertBrandDomStaging();
    expect(isBrandDomStagingActive()).toBe(false);
    expect(card.className).toBe("bg-white border border-rose-300 rounded-md p-4");
  });

  it("replaces prior staging when run again", () => {
    const button = document.createElement("button");
    button.setAttribute("data-nuvio-id", "filter.btn");
    button.className = "bg-rose-600 rounded-md px-4 py-2";
    document.body.appendChild(button);

    stageBrandHostsOnPage([
      {
        hostId: "filter.btn",
        ops: [{ kind: "mergeTailwindClassName", classNameFragment: "bg-purple-600 rounded-md px-4 py-2" }],
      },
    ]);
    expect(button.className).toContain("bg-purple-600");

    stageBrandHostsOnPage([
      {
        hostId: "filter.btn",
        ops: [{ kind: "mergeTailwindClassName", classNameFragment: "bg-green-600 rounded-md px-4 py-2" }],
      },
    ]);
    expect(button.className).toContain("bg-green-600");
    expect(button.className).not.toContain("bg-purple-600");
  });
});
