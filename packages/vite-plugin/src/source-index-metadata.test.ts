import { describe, expect, it } from "vitest";
import { extractIdsFromSource } from "./source-index.js";

describe("source index v2 metadata", () => {
  it("marks literal className as safe", () => {
    const code = `
      function Hero() {
        return <h1 data-nuvio-id="hero.title" className="text-2xl font-bold">Hi</h1>;
      }
    `;
    const hits = extractIdsFromSource("/proj/Hero.tsx", code);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.hasLiteralClassName).toBe(true);
    expect(hits[0]?.classNameValue).toBe("text-2xl font-bold");
    expect(hits[0]?.componentName).toBe("Hero");
    expect(hits[0]?.tagName).toBe("h1");
    expect(hits[0]?.riskLevel).toBe("safe");
    expect(hits[0]?.textEditable).toBe(true);
  });

  it("flags computed className as unsupported", () => {
    const code = `
      function Card() {
        const cn = "p-4";
        return <div data-nuvio-id="card.root" className={cn}>x</div>;
      }
    `;
    const hits = extractIdsFromSource("/proj/Card.tsx", code);
    expect(hits[0]?.hasLiteralClassName).toBe(false);
    expect(hits[0]?.riskLevel).toBe("unsupported");
    expect(hits[0]?.unsupportedReasons?.some((r) => r.includes("string literal"))).toBe(true);
  });

  it("cn-basic: treats simple cn() string lists as patchable", () => {
    const code = `
      import { cn } from "./u";
      function Card() {
        return <div data-nuvio-id="card.root" className={cn("p-4", "rounded-xl")}>x</div>;
      }
    `;
    const hits = extractIdsFromSource("/proj/Card.tsx", code, { classNameMode: "cn-basic" });
    expect(hits[0]?.hasLiteralClassName).toBe(true);
    expect(hits[0]?.classNameValue).toContain("p-4");
    expect(hits[0]?.riskLevel).not.toBe("unsupported");
  });

  it("flags elements inside .map() as caution", () => {
    const code = `
      function List() {
        return items.map((item) => (
          <p key={item.id} data-nuvio-id="list.item">{item.label}</p>
        ));
      }
    `;
    const hits = extractIdsFromSource("/proj/List.tsx", code);
    expect(hits[0]?.insideMap).toBe(true);
    expect(hits[0]?.riskLevel).toBe("caution");
    expect(hits[0]?.unsupportedReasons?.some((r) => r.includes(".map()"))).toBe(true);
  });

  it("marks container elements as non-text-editable", () => {
    const code = `
      function Card() {
        return (
          <div data-nuvio-id="card.root" className="rounded-lg">
            <span>Title</span>
          </div>
        );
      }
    `;
    const hits = extractIdsFromSource("/proj/Card.tsx", code);
    expect(hits[0]?.textEditable).toBe(false);
    expect(hits[0]?.unsupportedReasons?.some((r) => r.includes("leaf elements"))).toBe(true);
  });

  it("index v3: emits textTargets for container with child ids", () => {
    const code = `
      function Metrics() {
        return (
          <div data-nuvio-id="metric.orders.card" className="rounded-xl p-4">
            <h3 data-nuvio-id="metric.orders.label" className="text-sm text-gray-500">Orders</h3>
            <p data-nuvio-id="metric.orders.value" className="text-3xl font-bold">5,359</p>
          </div>
        );
      }
    `;
    const hits = extractIdsFromSource("/proj/Metrics.tsx", code);
    const card = hits.find((h) => h.id === "metric.orders.card");
    expect(card?.textEditable).toBe(false);
    expect(card?.textTargets).toHaveLength(2);
    expect(card?.textTargets?.map((t) => t.nuvioId)).toEqual([
      "metric.orders.label",
      "metric.orders.value",
    ]);
    expect(card?.primaryTextTargetKey).toBe("metric.orders.label");
    expect(card?.patchHostId).toBe("metric.orders.card");
    expect(card?.hierarchyRole).toBe("card");
    expect(card?.styleTargets?.some((t) => t.nuvioId === "metric.orders.card")).toBe(true);
    expect(card?.styleTargets?.some((t) => t.nuvioId === "metric.orders.value")).toBe(true);
    expect(card?.childTargetIds).toContain("metric.orders.label");
    expect(card?.childTargetIds).toContain("metric.orders.value");
  });

  it("index v3: emits textTargets for container without child ids", () => {
    const code = `
      function Card() {
        return (
          <div data-nuvio-id="card.root" className="p-4">
            <span className="text-sm">Orders</span>
            <p className="text-3xl">5,359</p>
          </div>
        );
      }
    `;
    const hits = extractIdsFromSource("/proj/Card.tsx", code);
    const card = hits.find((h) => h.id === "card.root");
    expect(card?.textTargets?.length).toBeGreaterThanOrEqual(2);
    expect(card?.textTargets?.every((t) => t.key.startsWith("loc:"))).toBe(true);
    expect(card?.textTargets?.some((t) => t.textPreview === "Orders")).toBe(true);
    expect(card?.textTargets?.some((t) => t.textPreview === "5,359")).toBe(true);
    expect(card?.primaryTextTargetKey).toMatch(/^loc:/);
    expect(card?.styleTargets?.[0]?.nuvioId).toBe("card.root");
  });

  it("index v3: leaf host includes self in textTargets", () => {
    const code = `
      function Hero() {
        return <h1 data-nuvio-id="hero.title" className="text-2xl">Welcome</h1>;
      }
    `;
    const hits = extractIdsFromSource("/proj/Hero.tsx", code);
    expect(hits[0]?.textTargets).toHaveLength(1);
    expect(hits[0]?.textTargets?.[0]?.nuvioId).toBe("hero.title");
    expect(hits[0]?.primaryTextTargetKey).toBe("hero.title");
    expect(hits[0]?.hierarchyRole).toBe("text");
  });

  it("index v3: sets parentHostId for nested instrumented hosts", () => {
    const code = `
      function Layout() {
        return (
          <div data-nuvio-id="dashboard.section" className="grid gap-4">
            <div data-nuvio-id="metric.orders.card" className="rounded-xl p-4">
              <h3 data-nuvio-id="metric.orders.label">Orders</h3>
            </div>
          </div>
        );
      }
    `;
    const hits = extractIdsFromSource("/proj/Layout.tsx", code);
    const card = hits.find((h) => h.id === "metric.orders.card");
    expect(card?.parentHostId).toBe("dashboard.section");
  });
});
