import { describe, expect, it } from "vitest";
import { injectJsxLocAttributes, parseNuvioLocValue } from "./jsx-loc-transform.js";

describe("jsx-loc-transform", () => {
  it("injects data-nuvio-loc on untagged JSX elements", () => {
    const file = "/proj/src/App.tsx";
    const code = `export function App() {
  return <h1>Welcome</h1>;
}
`;
    const { code: next, changed } = injectJsxLocAttributes(code, file, "/proj");
    expect(changed).toBe(true);
    expect(next).toContain('data-nuvio-loc="src/App.tsx:2:');
    expect(next).not.toContain("data-nuvio-id");
  });

  it("skips elements that already have data-nuvio-id", () => {
    const file = "/proj/src/App.tsx";
    const code = `export const _ = () => <h1 data-nuvio-id="page.title">Hi</h1>;`;
    const { changed } = injectJsxLocAttributes(code, file, "/proj");
    expect(changed).toBe(false);
  });

  it("parses loc attribute values", () => {
    expect(parseNuvioLocValue("src/App.tsx:4:9")).toEqual({
      file: "src/App.tsx",
      line: 4,
      column: 9,
    });
    expect(parseNuvioLocValue("bad")).toBeNull();
  });
});
