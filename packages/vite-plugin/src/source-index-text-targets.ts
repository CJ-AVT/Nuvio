import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { JSXElement, JSXOpeningElement } from "@babel/types";
import path from "node:path";
import type { StyleWireTarget, TextWireTarget } from "@rte/shared";
import { analyzeHost, type AnalyzeHostContext } from "./source-index-metadata.js";

const TEXT_TAG_PRIORITY = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
  "button",
  "label",
  "a",
  "strong",
  "em",
  "small",
] as const;

function getTagName(opening: JSXOpeningElement): string {
  if (opening.name.type === "JSXIdentifier") {
    return opening.name.name;
  }
  if (opening.name.type === "JSXMemberExpression") {
    const obj =
      opening.name.object.type === "JSXIdentifier" ? opening.name.object.name : "X";
    return `${obj}.${opening.name.property.name}`;
  }
  return "unknown";
}

function jsxElementHasElementChildren(el: JSXElement): boolean {
  for (const child of el.children) {
    if (child.type === "JSXElement" || child.type === "JSXFragment") {
      return true;
    }
  }
  return false;
}

function readRteId(opening: JSXOpeningElement): string | undefined {
  for (const attr of opening.attributes) {
    if (
      attr.type === "JSXAttribute" &&
      attr.name.type === "JSXIdentifier" &&
      attr.name.name === "data-rte-id" &&
      attr.value?.type === "StringLiteral"
    ) {
      const id = attr.value.value.trim();
      return id || undefined;
    }
  }
  return undefined;
}

function readLiteralClassName(opening: JSXOpeningElement): string | undefined {
  for (const attr of opening.attributes) {
    if (
      attr.type === "JSXAttribute" &&
      attr.name.type === "JSXIdentifier" &&
      attr.name.name === "className" &&
      attr.value?.type === "StringLiteral"
    ) {
      return attr.value.value;
    }
  }
  return undefined;
}

function isInsideMap(openingPath: NodePath<JSXOpeningElement>): boolean {
  let p: NodePath | null = openingPath.parentPath;
  while (p) {
    if (p.isCallExpression()) {
      const callee = p.node.callee;
      if (
        t.isMemberExpression(callee) &&
        !callee.computed &&
        t.isIdentifier(callee.property) &&
        callee.property.name === "map"
      ) {
        return true;
      }
    }
    p = p.parentPath;
  }
  return false;
}

function isDescendantPath(
  candidate: NodePath<JSXOpeningElement>,
  hostElementPath: NodePath<JSXElement>,
): boolean {
  let p: NodePath | null = candidate.parentPath;
  while (p) {
    if (p === hostElementPath) {
      return true;
    }
    p = p.parentPath;
  }
  return false;
}

function getJsxTextPreview(el: JSXElement): string {
  const parts: string[] = [];
  for (const child of el.children) {
    if (child.type === "JSXText") {
      const trimmed = child.value.replace(/\s+/g, " ").trim();
      if (trimmed) {
        parts.push(trimmed);
      }
    }
  }
  return parts.join(" ").trim();
}

function isTextCandidateTag(tagName: string, isNative: boolean): boolean {
  if ((TEXT_TAG_PRIORITY as readonly string[]).includes(tagName)) {
    return true;
  }
  return isNative && tagName !== "svg" && tagName !== "path";
}

function formatLabel(tagName: string, textPreview: string, rteId?: string): string {
  const snippet =
    textPreview.length > 36 ? `${textPreview.slice(0, 33)}…` : textPreview || "(empty)";
  if (rteId) {
    return `${tagName} · ${snippet}`;
  }
  return `${tagName} · ${snippet}`;
}

function resolvePatchHostId(
  hostId: string,
  hostCtx: AnalyzeHostContext,
  targetRteId: string | undefined,
  targetHasLiteralClassName: boolean,
): string {
  if (targetRteId && targetHasLiteralClassName) {
    return targetRteId;
  }
  if (hostCtx.hasLiteralClassName) {
    return hostId;
  }
  return targetRteId ?? hostId;
}

function tryAddTarget(
  openingPath: NodePath<JSXOpeningElement>,
  hostId: string,
  hostCtx: AnalyzeHostContext,
  fileAbs: string,
  seen: Set<string>,
  targets: TextWireTarget[],
): void {
  const elementPath = openingPath.parentPath;
  if (!elementPath?.isJSXElement()) {
    return;
  }
  const el = elementPath.node;
  if (jsxElementHasElementChildren(el)) {
    return;
  }

  const tagName = getTagName(openingPath.node);
  const isNative = /^[a-z][\w-]*$/.test(tagName);
  if (!isTextCandidateTag(tagName, isNative)) {
    return;
  }

  const textPreview = getJsxTextPreview(el);
  if (!textPreview && tagName !== "button") {
    return;
  }

  const loc = openingPath.node.loc?.start ?? { line: 1, column: 0 };
  const rteId = readRteId(openingPath.node);
  const key = rteId ?? `loc:${loc.line}:${loc.column}`;
  if (seen.has(key)) {
    return;
  }
  seen.add(key);

  const classNameValue = readLiteralClassName(openingPath.node);
  const childAnalyze = analyzeHost(openingPath);

  targets.push({
    key,
    label: formatLabel(tagName, textPreview, rteId),
    file: path.resolve(fileAbs),
    line: loc.line,
    column: loc.column,
    tagName,
    textEditable: childAnalyze?.textEditable ?? true,
    textPreview: textPreview || undefined,
    rteId,
    patchHostId: resolvePatchHostId(
      hostId,
      hostCtx,
      rteId,
      classNameValue !== undefined,
    ),
    insideMap: isInsideMap(openingPath),
  });
}

export function pickPrimaryTextTargetKey(targets: readonly TextWireTarget[]): string | undefined {
  if (targets.length === 0) {
    return undefined;
  }
  for (const preferred of TEXT_TAG_PRIORITY) {
    const hit = targets.find((t) => t.tagName === preferred);
    if (hit) {
      return hit.key;
    }
  }
  return targets[0]?.key;
}

export function resolveEntryPatchHostId(
  hostId: string,
  hostCtx: AnalyzeHostContext,
  targets: readonly TextWireTarget[],
): string {
  if (hostCtx.hasLiteralClassName) {
    return hostId;
  }
  const withClass = targets.find((t) => t.rteId && t.patchHostId === t.rteId);
  return withClass?.patchHostId ?? hostId;
}

/**
 * Collect descendant (and host) JSX text targets for index v3.
 * Used when the instrumented host is a container so the overlay can offer label/value picks.
 */
export function collectTextTargets(
  hostOpeningPath: NodePath<JSXOpeningElement>,
  hostId: string,
  hostCtx: AnalyzeHostContext,
  fileAbs: string,
): TextWireTarget[] {
  const hostElementPath = hostOpeningPath.parentPath;
  if (!hostElementPath?.isJSXElement()) {
    return [];
  }

  const targets: TextWireTarget[] = [];
  const seen = new Set<string>();

  tryAddTarget(hostOpeningPath, hostId, hostCtx, fileAbs, seen, targets);

  hostElementPath.traverse({
    JSXOpeningElement(innerPath) {
      if (innerPath === hostOpeningPath) {
        return;
      }
      if (!isDescendantPath(innerPath, hostElementPath)) {
        return;
      }
      tryAddTarget(innerPath, hostId, hostCtx, fileAbs, seen, targets);
    },
  });

  targets.sort((a, b) => {
    if (a.line !== b.line) {
      return a.line - b.line;
    }
    return a.column - b.column;
  });

  return targets;
}

export function collectStyleTargets(
  hostOpeningPath: NodePath<JSXOpeningElement>,
  hostId: string,
  hostCtx: AnalyzeHostContext,
  fileAbs: string,
): StyleWireTarget[] {
  const hostElementPath = hostOpeningPath.parentPath;
  if (!hostElementPath?.isJSXElement()) {
    return [];
  }

  const targets: StyleWireTarget[] = [];
  const seen = new Set<string>();

  const pushStyleTarget = (openingPath: NodePath<JSXOpeningElement>, fallbackKey?: string) => {
    const rteId = readRteId(openingPath.node) ?? fallbackKey;
    if (!rteId || seen.has(rteId)) {
      return;
    }
    seen.add(rteId);
    const tagName = getTagName(openingPath.node);
    const classNameValue = readLiteralClassName(openingPath.node);
    const childCtx = analyzeHost(openingPath);
    const loc = openingPath.node.loc?.start ?? { line: 1, column: 0 };
    const classNamePatchable =
      classNameValue !== undefined || Boolean(hostCtx.hasLiteralClassName && rteId === hostId);
    targets.push({
      key: rteId === hostId ? "host" : rteId,
      label: rteId === hostId ? `${tagName} · container` : `${tagName} · ${rteId}`,
      file: path.resolve(fileAbs),
      line: loc.line,
      column: loc.column,
      tagName,
      rteId,
      patchHostId: resolvePatchHostId(
        hostId,
        hostCtx,
        rteId,
        classNameValue !== undefined,
      ),
      classNamePatchable,
      riskLevel: childCtx?.classNameComputed ? "unsupported" : undefined,
    });
  };

  pushStyleTarget(hostOpeningPath, hostId);
  hostElementPath.traverse({
    JSXOpeningElement(innerPath) {
      if (innerPath === hostOpeningPath) {
        return;
      }
      if (!isDescendantPath(innerPath, hostElementPath)) {
        return;
      }
      const rteId = readRteId(innerPath.node);
      if (!rteId) {
        return;
      }
      pushStyleTarget(innerPath);
    },
  });

  targets.sort((a, b) => {
    if (a.line !== b.line) {
      return a.line - b.line;
    }
    return a.column - b.column;
  });

  return targets;
}
