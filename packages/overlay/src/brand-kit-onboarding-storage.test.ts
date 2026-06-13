import { afterEach, describe, expect, it } from "vitest";
import {
  dismissBrandKitFirstRun,
  isBrandKitFirstRunDismissed,
  resetBrandKitFirstRunForTests,
} from "./brand-kit-onboarding-storage.js";

describe("brand-kit-onboarding-storage", () => {
  afterEach(() => {
    resetBrandKitFirstRunForTests();
  });

  it("starts visible until dismissed", () => {
    expect(isBrandKitFirstRunDismissed()).toBe(false);
    dismissBrandKitFirstRun();
    expect(isBrandKitFirstRunDismissed()).toBe(true);
  });
});
