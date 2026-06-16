import { describe, expect, it } from "vitest";
import { injectJsxLocAttributes, parseRteLocValue } from "./jsx-loc-transform.js";

describe("jsx-loc-transform", () => {
  it("injects data-rte-loc on untagged JSX elements", () => {
    const file = "/proj/src/App.tsx";
    const code = `export function App() {
  return <h1>Welcome</h1>;
}
`;
    const { code: next, changed } = injectJsxLocAttributes(code, file, "/proj");
    expect(changed).toBe(true);
    expect(next).toContain('data-rte-loc="src/App.tsx:2:');
    expect(next).not.toContain("data-rte-id");
  });

  it("skips elements that already have data-rte-id", () => {
    const file = "/proj/src/App.tsx";
    const code = `export const _ = () => <h1 data-rte-id="page.title">Hi</h1>;`;
    const { changed } = injectJsxLocAttributes(code, file, "/proj");
    expect(changed).toBe(false);
  });

  it("parses loc attribute values", () => {
    expect(parseRteLocValue("src/App.tsx:4:9")).toEqual({
      file: "src/App.tsx",
      line: 4,
      column: 9,
    });
    expect(parseRteLocValue("bad")).toBeNull();
  });
});
