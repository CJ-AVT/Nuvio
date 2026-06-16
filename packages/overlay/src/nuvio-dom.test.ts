import { describe, expect, it } from "vitest";
import { hostIsInsideAppLink } from "./nuvio-dom.js";

describe("hostIsInsideAppLink", () => {
  it("returns true for hosts inside a real href link", () => {
    document.body.innerHTML =
      '<a href="/form-elements"><span data-nuvio-id="nav.form-elements">Form Elements</span></a>';
    const host = document.querySelector(
      '[data-nuvio-id="nav.form-elements"]',
    ) as HTMLElement;
    expect(hostIsInsideAppLink(host)).toBe(true);
  });

  it("returns true when the host is the anchor", () => {
    document.body.innerHTML =
      '<a href="/basic-tables" data-nuvio-id="nav.basic-tables">Basic Tables</a>';
    const host = document.querySelector(
      '[data-nuvio-id="nav.basic-tables"]',
    ) as HTMLElement;
    expect(hostIsInsideAppLink(host)).toBe(true);
  });

  it("returns false for hosts outside links", () => {
    document.body.innerHTML =
      '<button type="button"><span data-nuvio-id="nav.forms-toggle">Forms</span></button>';
    const host = document.querySelector(
      '[data-nuvio-id="nav.forms-toggle"]',
    ) as HTMLElement;
    expect(hostIsInsideAppLink(host)).toBe(false);
  });

  it("returns false for placeholder or javascript hrefs", () => {
    document.body.innerHTML =
      '<a href="#"><span data-nuvio-id="nav.hash">Hash</span></a>';
    const hashHost = document.querySelector(
      '[data-nuvio-id="nav.hash"]',
    ) as HTMLElement;
    expect(hostIsInsideAppLink(hashHost)).toBe(false);

    document.body.innerHTML =
      '<a href="javascript:void(0)"><span data-nuvio-id="nav.js">JS</span></a>';
    const jsHost = document.querySelector(
      '[data-nuvio-id="nav.js"]',
    ) as HTMLElement;
    expect(hostIsInsideAppLink(jsHost)).toBe(false);
  });
});
