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
    "nuvio could not apply this edit safely.",
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

export const MAKE_TABLE_EDITABLE_SNIPPET = `Add nuvio table ids (v0.4 contract):
- Section wrapper: data-nuvio-id="{host}.section"
- Title h3: data-nuvio-id="{host}.title"
- Table scroll area: data-nuvio-id="{host}.table"
- Header cells: data-nuvio-id="{host}.header.products" (per column)
- Each row: data-nuvio-id="{host}.row.{id}" with literal className
- Cell text: data-nuvio-id="{host}.row.{id}.nameText" when using tableData.map()
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
      ? (import.meta as ImportMeta & { env?: Record<string, unknown> }).env?.VITE_NUVIO_EDITOR_URL
      : undefined;
  const fromProcess =
    typeof globalThis !== "undefined" &&
    "process" in globalThis &&
    (globalThis as { process?: { env?: Record<string, unknown> } }).process?.env?.NUVIO_EDITOR_URL;
  for (const candidate of [fromMeta, fromProcess]) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }
  return "vscode";
}

/** Build an editor deep link when file path is known (`VITE_NUVIO_EDITOR_URL` / `NUVIO_EDITOR_URL`, default `vscode`). */
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
