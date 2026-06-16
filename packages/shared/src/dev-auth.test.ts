import { describe, expect, it } from "vitest";
import {
  bearerTokenFromHeader,
  devTokenFromUpgradeUrl,
  isAllowedRteOrigin,
  isValidDevToken,
  RTE_DEV_TOKEN_QUERY,
} from "./dev-auth.js";

describe("isAllowedRteOrigin", () => {
  it("rejects missing origin", () => {
    expect(isAllowedRteOrigin(undefined)).toBe(false);
    expect(isAllowedRteOrigin("")).toBe(false);
  });

  it("allows localhost and 127.0.0.1", () => {
    expect(isAllowedRteOrigin("http://localhost:5173")).toBe(true);
    expect(isAllowedRteOrigin("http://127.0.0.1:5173")).toBe(true);
  });

  it("rejects remote origins", () => {
    expect(isAllowedRteOrigin("http://evil.example")).toBe(false);
  });
});

describe("devTokenFromUpgradeUrl", () => {
  it("reads token query param", () => {
    expect(
      devTokenFromUpgradeUrl(`/__rte/ws?${RTE_DEV_TOKEN_QUERY}=abc-123`),
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
