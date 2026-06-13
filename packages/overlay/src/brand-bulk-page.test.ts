import { resolve } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  pccHostsForBrandAction,
} from "@nuvio/shared";
import { loadPccManifestFromFile } from "@nuvio/shared/load-pcc-manifest";
import { listVisibleBrandBulkTargets } from "./brand-bulk-page.js";

const dogfoodRoot = resolve(import.meta.dirname, "../../../apps/tailadmin-dogfood");

describe("listVisibleBrandBulkTargets with PCC", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("counts all dashboard card hosts when present in the DOM", async () => {
    const loaded = loadPccManifestFromFile(
      resolve(dogfoodRoot, "nuvio/pages/dashboard.pcc.yaml"),
    );
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) {
      return;
    }

    const pccHosts = pccHostsForBrandAction(loaded.manifest, "card");
    expect(pccHosts).toHaveLength(7);

    for (const hostId of pccHosts ?? []) {
      const el = document.createElement("div");
      el.setAttribute("data-nuvio-id", hostId);
      el.className = "rounded-xl border p-4";
      document.body.appendChild(el);
    }

    const entries = (pccHosts ?? []).map((id) => ({
      id,
      file: "src/App.tsx",
      line: 1,
      column: 1,
      hasLiteralClassName: true,
      classNameMode: "literal-only" as const,
    }));

    const knownIds = new Set(entries.map((entry) => entry.id));
    const targets = listVisibleBrandBulkTargets(
      entries,
      "card",
      knownIds,
      [],
      loaded.manifest,
    );
    expect(targets).toHaveLength(7);
  });
});
