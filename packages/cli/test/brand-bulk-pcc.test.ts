import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  filterBrandBulkCandidates,
  pccHostsForBrandAction,
} from "@nuvio/shared";
import { loadPccManifestFromFile } from "@nuvio/shared/load-pcc-manifest";
import { scanProject } from "../src/project-scan.js";

describe("dashboard PCC bulk counts", () => {
  it("matches PCC card host count for tailadmin dogfood", () => {
    const dogfoodRoot = resolve(import.meta.dirname, "../../../apps/tailadmin-dogfood");
    const loaded = loadPccManifestFromFile(
      resolve(dogfoodRoot, "nuvio/pages/dashboard.pcc.yaml"),
    );
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) {
      return;
    }

    const scan = scanProject(dogfoodRoot);
    const knownIds = new Set(scan.index.entries.map((entry) => entry.id));
    const duplicateIds = new Set(scan.index.duplicateErrors.map((error) => error.id));
    const pccHosts = pccHostsForBrandAction(loaded.manifest, "card");
    expect(pccHosts).toHaveLength(7);

    const targets = filterBrandBulkCandidates(
      scan.index.entries,
      "card",
      knownIds,
      duplicateIds,
      { pccHosts },
    );
    expect(targets).toHaveLength(7);
    expect(targets.map((target) => target.hostId)).toEqual([...pccHosts!]);
  });
});
