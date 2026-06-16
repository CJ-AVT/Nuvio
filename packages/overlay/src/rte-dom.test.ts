import { describe, expect, it } from "vitest";
import { hostIsInsideAppLink } from "./rte-dom.js";

describe("hostIsInsideAppLink", () => {
  it("returns true for hosts inside a real href link", () => {
    document.body.innerHTML =
      '<a href="/form-elements"><span data-rte-id="nav.form-elements">Form Elements</span></a>';
    const host = document.querySelector(
      '[data-rte-id="nav.form-elements"]',
    ) as HTMLElement;
    expect(hostIsInsideAppLink(host)).toBe(true);
  });

  it("returns true when the host is the anchor", () => {
    document.body.innerHTML =
      '<a href="/basic-tables" data-rte-id="nav.basic-tables">Basic Tables</a>';
    const host = document.querySelector(
      '[data-rte-id="nav.basic-tables"]',
    ) as HTMLElement;
    expect(hostIsInsideAppLink(host)).toBe(true);
  });

  it("returns false for hosts outside links", () => {
    document.body.innerHTML =
      '<button type="button"><span data-rte-id="nav.forms-toggle">Forms</span></button>';
    const host = document.querySelector(
      '[data-rte-id="nav.forms-toggle"]',
    ) as HTMLElement;
    expect(hostIsInsideAppLink(host)).toBe(false);
  });

  it("returns false for placeholder or javascript hrefs", () => {
    document.body.innerHTML =
      '<a href="#"><span data-rte-id="nav.hash">Hash</span></a>';
    const hashHost = document.querySelector(
      '[data-rte-id="nav.hash"]',
    ) as HTMLElement;
    expect(hostIsInsideAppLink(hashHost)).toBe(false);

    document.body.innerHTML =
      '<a href="javascript:void(0)"><span data-rte-id="nav.js">JS</span></a>';
    const jsHost = document.querySelector(
      '[data-rte-id="nav.js"]',
    ) as HTMLElement;
    expect(hostIsInsideAppLink(jsHost)).toBe(false);
  });
});
