import { validateTailwindFragment } from "@nuvio/ast-engine";
import {
  BRAND_APPLY_ACTIONS,
  BRAND_BUTTON_HOVERS,
  BRAND_BUTTON_VARIANTS,
  BRAND_CARD_HOVERS,
  BRAND_CARD_SHADOWS,
  BRAND_DENSITY,
  BRAND_RADIUS,
  BRAND_SURFACES,
  BRAND_TYPOGRAPHY,
  brandColorsForAction,
  buildBrandClassFragment,
  DEFAULT_BRAND_CONFIG,
} from "@nuvio/shared";

export function validateBrandClassFragment(fragment: string): void {
  validateTailwindFragment(fragment);
}

/** Assert every preset × action combination passes the AST allowlist. */
export function assertAllBrandRecipesAllowlisted(): void {
  for (const surface of BRAND_SURFACES) {
    for (const buttonVariant of BRAND_BUTTON_VARIANTS) {
      for (const buttonHover of BRAND_BUTTON_HOVERS) {
        for (const cardShadow of BRAND_CARD_SHADOWS) {
            for (const cardHover of BRAND_CARD_HOVERS) {
              for (const radius of BRAND_RADIUS) {
                for (const density of BRAND_DENSITY) {
                  for (const typography of BRAND_TYPOGRAPHY) {
                    for (const action of BRAND_APPLY_ACTIONS) {
                      for (const color of brandColorsForAction(action)) {
                        const config = {
                          ...DEFAULT_BRAND_CONFIG,
                          color,
                          surface,
                          buttonVariant,
                          buttonHover,
                          cardShadow,
                          cardHover,
                          radius,
                          density,
                          typography,
                        };
                        validateBrandClassFragment(buildBrandClassFragment(action, config));
                        if (action === "form") {
                          validateBrandClassFragment(
                            buildBrandClassFragment(action, config, { tagName: "label", hostId: "demo.label" }),
                          );
                          validateBrandClassFragment(
                            buildBrandClassFragment(action, config, { tagName: "input", hostId: "demo.input" }),
                          );
                        }
                      }
                    }
                  }
                }
              }
            }
        }
      }
    }
  }
}
