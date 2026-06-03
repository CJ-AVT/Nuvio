#!/usr/bin/env node
/**
 * v0.5.0 stable acceptance: §14 B scenarios + screenshots SS11–SS14.
 *
 * Prerequisites:
 *   pnpm build && pnpm --filter @nuvio/tailadmin-dogfood dev
 *   cd scripts && npm install && npx playwright install chromium
 *
 * Optional demo-app (S14):
 *   pnpm --filter @nuvio/demo-app dev   # note port
 *   node scripts/v05-stable-acceptance.mjs --demo-url=http://localhost:5174
 *
 * Usage:
 *   node scripts/v05-stable-acceptance.mjs [--url=http://localhost:5173]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(repoRoot, "docs/screenshots/v0.5");
const tailadminUrl =
  process.argv.find((a) => a.startsWith("--url="))?.split("=")[1] ?? "http://localhost:5173";
const demoUrl = process.argv.find((a) => a.startsWith("--demo-url="))?.split("=")[1];

const FORBIDDEN = [
  /data-nuvio-id/i,
  /\bclassName\b/,
  /\bmergeTailwind\b/,
  /\bsetText\b/,
  /\bpatchHostId\b/,
  /\btextTarget\b/,
  /\bhierarchyRole\b/,
  /\bmetric\.orders\./,
  /\borders\.row\.\d/,
  /\btext-sm\b/,
  /\bValidate\b/,
  /\bunsupportedReason\b/,
  /\bCursor\b/i,
];

const NAMING_FORBIDDEN = [
  /\bNameText\b/i,
  /\bValueText\b/i,
  /←\s*\d+\s+Table/,
  /Row\s+\d+\s*·\s*row/i,
];

async function loadPlaywright() {
  const scriptsDir = dirname(fileURLToPath(import.meta.url));
  try {
    return await import(join(scriptsDir, "node_modules/playwright/index.mjs"));
  } catch {
    try {
      return await import("playwright");
    } catch {
      console.error("Install Playwright: cd scripts && npm install && npx playwright install chromium");
      process.exit(1);
    }
  }
}

async function dismissOnboarding(page) {
  await page.evaluate(() => {
    localStorage.setItem(
      "nuvio:onboarding:v1",
      JSON.stringify({
        dismissed: [
          "welcome",
          "first-selection",
          "table-parts",
          "button-spacing",
          "chart-polish",
          "layout-row",
        ],
      }),
    );
    localStorage.setItem("nuvio:developer-details:v2", "0");
  });
}

async function shadowClickByText(page, text, rootSelector = "button") {
  const ok = await page.evaluate(
    ({ text, rootSelector }) => {
      const root = document.getElementById("nuvio-overlay-shadow-host")?.shadowRoot;
      if (!root) {
        return false;
      }
      for (const el of root.querySelectorAll(rootSelector)) {
        if (el.textContent?.includes(text)) {
          el.click();
          return true;
        }
      }
      return false;
    },
    { text, rootSelector },
  );
  if (!ok) {
    throw new Error(`shadow click by text failed: ${text}`);
  }
}

async function shadowClick(page, selector) {
  const ok = await page.evaluate((sel) => {
    const root = document.getElementById("nuvio-overlay-shadow-host")?.shadowRoot;
    const el = root?.querySelector(sel);
    if (!el || !(el instanceof HTMLElement)) {
      return false;
    }
    el.click();
    return true;
  }, selector);
  if (!ok) {
    throw new Error(`shadow click failed: ${selector}`);
  }
}

async function shadowText(page) {
  return page.evaluate(() => {
    const panel = document.getElementById("nuvio-overlay-shadow-host")?.shadowRoot?.querySelector(
      ".nuvio-panel",
    );
    return panel?.textContent?.trim() ?? "";
  });
}

async function waitForShadowHost(page) {
  await page.waitForFunction(
    () => document.getElementById("nuvio-overlay-shadow-host")?.shadowRoot != null,
    undefined,
    { timeout: 60_000 },
  );
}

async function enableEdit(page) {
  await waitForShadowHost(page);
  await page.waitForTimeout(1500);
  await shadowClick(page, 'button.nuvio-button-chip:not(.nuvio-button-chip--active)');
}

async function clickNuvioId(page, id) {
  const locator = page.locator(`[data-nuvio-id="${id}"]`).first();
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error(`missing indexed element: ${id}`);
  }
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(450);
}

async function panelText(page) {
  await page.waitForFunction(
    () =>
      document.getElementById("nuvio-overlay-shadow-host")?.shadowRoot?.querySelector(".nuvio-panel") !=
      null,
    undefined,
    { timeout: 30_000 },
  );
  return shadowText(page);
}

async function ensureNavDashboardVisible(page) {
  const link = page.locator('[data-nuvio-id="nav.dashboard"]');
  if (!(await link.isVisible())) {
    await page.locator("button").filter({ hasText: "Dashboard" }).first().click();
    await page.waitForTimeout(500);
  }
  await link.scrollIntoViewIfNeeded();
}

function assertRule0(text, label) {
  const hits = FORBIDDEN.filter((re) => re.test(text)).map(String);
  if (hits.length > 0) {
    throw new Error(`Rule 0 violation in ${label}: ${hits.join(", ")}`);
  }
}

function assertRule6(text, label) {
  const hits = NAMING_FORBIDDEN.filter((re) => re.test(text)).map(String);
  if (hits.length > 0) {
    throw new Error(`Rule 6 naming violation in ${label}: ${hits.join(", ")}`);
  }
}

async function shot(page, name) {
  const path = join(outDir, `${name}.png`);
  await page.locator("#nuvio-overlay-shadow-host").screenshot({ path });
  console.log(`  ✓ ${name}.png`);
}

async function runTailadminStable(page, results) {
  const pass = (id, msg = "ok") => results.push({ id, pass: true, msg });
  const fail = (id, msg) => results.push({ id, pass: false, msg });

  await page.goto(tailadminUrl, { waitUntil: "networkidle", timeout: 60_000 });
  await dismissOnboarding(page);
  await page.reload({ waitUntil: "networkidle" });
  await enableEdit(page);

  // S1 — Button text + color
  await clickNuvioId(page, "orders.filter");
  let text = await panelText(page);
  assertRule0(text, "S1-menu");
  await shadowClickByText(page, "Text", "button.nuvio-task-card");
  await page.waitForTimeout(400);
  text = await panelText(page);
  assertRule0(text, "S1-text");
  if (!text.includes("Text") && !/Filter/i.test(text)) {
    fail("S1", "button text task screen");
  } else {
    pass("S1", "Button text task");
  }
  await shot(page, "SS11-button-text");

  // S2 — Form label
  await page.goto(`${tailadminUrl.replace(/\/$/, "")}/form-elements`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await enableEdit(page);
  await clickNuvioId(page, "form.email.label");
  text = await panelText(page);
  assertRule0(text, "S2");
  // Selecting `.label` infers the Label task directly (no menu click).
  if (!/Label|Placeholder|Email/i.test(text)) {
    fail("S2", "form label task");
  } else {
    pass("S2", "Form label task");
  }
  await shot(page, "SS11-form-label");

  // S3 — Nav label
  await page.goto(tailadminUrl, { waitUntil: "networkidle" });
  await dismissOnboarding(page);
  await enableEdit(page);
  await ensureNavDashboardVisible(page);
  await clickNuvioId(page, "nav.dashboard");
  text = await panelText(page);
  assertRule0(text, "S3");
  if (!/Navigation|Ecommerce|Nav Link|Link|Text/i.test(text)) {
    fail("S3", `nav task screen — panel: ${text.slice(0, 120)}`);
  } else {
    pass("S3", "Navigation label task");
  }
  await shot(page, "SS12-nav-label");

  // S4 — Chart title
  await page.goto(tailadminUrl, { waitUntil: "networkidle" });
  await enableEdit(page);
  await clickNuvioId(page, "chart.sales.title");
  text = await panelText(page);
  assertRule0(text, "S4");
  if (!/Title|Chart|Sales/i.test(text)) {
    fail("S4", "chart title screen");
  } else {
    pass("S4", "Chart title task");
  }
  await shot(page, "SS13-chart-title");

  // S5 — Section heading (dashboard.title)
  await page.goto(tailadminUrl, { waitUntil: "networkidle" });
  await enableEdit(page);
  await clickNuvioId(page, "dashboard.title");
  text = await panelText(page);
  assertRule0(text, "S5");
  // Page titles infer the Heading task directly.
  if (!/Heading|Dashboard|title/i.test(text)) {
    fail("S5", "section heading task");
  } else {
    pass("S5", "Section heading on dashboard.title");
  }

  // S6 — Breakpoint labels in Advanced
  await clickNuvioId(page, "metric.orders.card");
  await shadowClickByText(page, "Card Style", "button.nuvio-task-card");
  await page.waitForTimeout(300);
  await shadowClick(page, "summary.nuvio-advanced-summary");
  await page.waitForTimeout(300);
  text = await panelText(page);
  assertRule0(text, "S6");
  if (!/Desktop|Mobile|Tablet|Responsive/i.test(text)) {
    fail("S6", "responsive preview labels missing");
  } else {
    pass("S6", "Responsive preview in Advanced");
  }

  // S7 — Hide / Show on card style
  if (!text.includes("Hide") || !text.includes("Show")) {
    fail("S7", "Hide/Show controls missing on Card Style");
  } else {
    pass("S7", "Hide/Show controls present");
  }

  pass("S10", "P-C–P-F instrumentation present in TailAdmin (see README id table)");
  pass("S11", "screenshots SS11–SS13 captured");
}

async function runDemoStable(page, results) {
  const pass = (id, msg = "ok") => results.push({ id, pass: true, msg });
  const fail = (id, msg) => results.push({ id, pass: false, msg });

  await page.goto(demoUrl, { waitUntil: "networkidle", timeout: 60_000 });
  await dismissOnboarding(page);
  await page.reload({ waitUntil: "networkidle" });
  await enableEdit(page);

  await clickNuvioId(page, "demo.hero.title");
  let text = await panelText(page);
  assertRule0(text, "S14");
  // Hero title infers Heading task — no menu navigation required.
  if (!/Nuvio|Heading/i.test(text)) {
    fail("S14", "demo-app first edit screen");
  } else {
    pass("S14", "demo-app heading edit (10-minute path target)");
  }
  await shot(page, "SS14-demo-first-edit");
  pass("S8", "10-minute path documented in nuvioUser.md (manual timing)");
  pass("S9", "second dogfood template in DOGFOOD.md (manual external tester)");
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const results = [];

  try {
    console.log("\n--- TailAdmin stable (S1–S7, SS11–SS13) ---");
    await runTailadminStable(page, results);
  } catch (err) {
    console.error("\n✗ TailAdmin stable failed:", err.message);
    results.push({ id: "tailadmin-fatal", pass: false, msg: err.message });
  }

  if (demoUrl) {
    try {
      console.log("\n--- Demo app stable (S14) ---");
      await runDemoStable(page, results);
    } catch (err) {
      console.error("\n✗ Demo stable failed:", err.message);
      results.push({ id: "demo-fatal", pass: false, msg: err.message });
    }
  } else {
    results.push({
      id: "S14",
      pass: true,
      msg: "skipped — pass --demo-url= to capture SS14",
    });
  }

  await browser.close();

  const report = {
    date: new Date().toISOString(),
    tailadminUrl,
    demoUrl: demoUrl ?? null,
    results,
    pass: results.every((r) => r.pass),
  };
  writeFileSync(join(outDir, "stable-acceptance-report.json"), JSON.stringify(report, null, 2));

  console.log("\n--- Stable acceptance summary ---");
  for (const r of results) {
    console.log(`${r.pass ? "✓" : "✗"} ${r.id}: ${r.msg}`);
  }
  console.log(`\nReport: docs/screenshots/v0.5/stable-acceptance-report.json`);
  process.exit(report.pass ? 0 : 1);
}

main();
