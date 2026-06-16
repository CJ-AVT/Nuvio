export type FixHandoffContext = {
  componentName?: string;
  hostId: string;
  file?: string;
  line?: number;
  userIntent: string;
  reason: string;
  suggestedNextStep: string;
};

export function buildFixHandoffClipboard(ctx: FixHandoffContext): string {
  const fileLine =
    ctx.file != null
      ? `${ctx.file}${ctx.line != null ? `:${ctx.line}` : ""}`
      : "(unknown file)";
  const component = ctx.componentName ?? ctx.hostId;

  return [
    "rte could not apply this edit safely.",
    "",
    `Component: ${component} (${ctx.hostId})`,
    `File: ${fileLine}`,
    `You tried: ${ctx.userIntent}`,
    `Reason: ${ctx.reason}`,
    "",
    `Suggested next step: ${ctx.suggestedNextStep}`,
    "",
    "Optional prompt (paste into your editor or AI assistant):",
    `"In ${ctx.file ?? "the component file"}, ${ctx.suggestedNextStep}"`,
  ].join("\n");
}

export const MAKE_TABLE_EDITABLE_SNIPPET = `Add rte table ids (v0.4 contract):
- Section wrapper: data-rte-id="{host}.section"
- Title h3: data-rte-id="{host}.title"
- Table scroll area: data-rte-id="{host}.table"
- Header cells: data-rte-id="{host}.header.products" (per column)
- Each row: data-rte-id="{host}.row.{id}" with literal className
- Cell text: data-rte-id="{host}.row.{id}.nameText" when using tableData.map()
Keep header and title text as string literals for in-panel editing.`;

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function resolveEditorUrlScheme(): string {
  const fromMeta =
    typeof import.meta !== "undefined"
      ? (import.meta as ImportMeta & { env?: Record<string, unknown> }).env?.VITE_RTE_EDITOR_URL
      : undefined;
  const fromProcess =
    typeof globalThis !== "undefined" &&
    "process" in globalThis &&
    (globalThis as { process?: { env?: Record<string, unknown> } }).process?.env?.RTE_EDITOR_URL;
  for (const candidate of [fromMeta, fromProcess]) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }
  return "vscode";
}

/** Build an editor deep link when file path is known (`VITE_RTE_EDITOR_URL` / `RTE_EDITOR_URL`, default `vscode`). */
export function buildEditorUrl(file?: string, line?: number): string | null {
  if (!file) {
    return null;
  }
  const scheme = resolveEditorUrlScheme();
  const normalized = file.replace(/\\/g, "/");
  const atLine = line != null ? `:${line}` : "";
  if (scheme.includes("://")) {
    return `${scheme}${normalized}${atLine}`;
  }
  return `${scheme}://file/${normalized}${atLine}`;
}
