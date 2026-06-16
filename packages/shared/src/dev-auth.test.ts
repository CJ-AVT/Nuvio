import { describe, expect, it } from "vitest";
import {
  bearerTokenFromHeader,
  devTokenFromUpgradeUrl,
  isAllowedNuvioOrigin,
  isValidDevToken,
  NUVIO_DEV_TOKEN_QUERY,
} from "./dev-auth.js";

describe("isAllowedNuvioOrigin", () => {
  it("rejects missing origin", () => {
    expect(isAllowedNuvioOrigin(undefined)).toBe(false);
    expect(isAllowedNuvioOrigin("")).toBe(false);
  });

  it("allows localhost and 127.0.0.1", () => {
    expect(isAllowedNuvioOrigin("http://localhost:5173")).toBe(true);
    expect(isAllowedNuvioOrigin("http://127.0.0.1:5173")).toBe(true);
  });

  it("rejects remote origins", () => {
    expect(isAllowedNuvioOrigin("http://evil.example")).toBe(false);
  });
});

describe("devTokenFromUpgradeUrl", () => {
  it("reads token query param", () => {
    expect(
      devTokenFromUpgradeUrl(`/__nuvio/ws?${NUVIO_DEV_TOKEN_QUERY}=abc-123`),
    ).toBe("abc-123");
  });
});

describe("bearerTokenFromHeader", () => {
  it("parses Bearer token", () => {
    expect(bearerTokenFromHeader("Bearer secret")).toBe("secret");
  });
});

describe("isValidDevToken", () => {
  it("matches exact token", () => {
    expect(isValidDevToken("a", "a")).toBe(true);
    expect(isValidDevToken("a", "b")).toBe(false);
    expect(isValidDevToken(null, "a")).toBe(false);
  });
});
