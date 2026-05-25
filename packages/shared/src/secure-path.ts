import path from "node:path";

export class PathEscapeError extends Error {
  readonly name = "PathEscapeError";

  constructor(
    public readonly root: string,
    public readonly candidate: string,
  ) {
    super(`Path escapes project root: ${candidate} (root ${root})`);
  }
}

/**
 * Ensures `candidateAbs` is the root directory itself or a path inside `rootAbs`.
 * Use before any dev-server file write (Phase 1+).
 */
export function assertPathWithinRoot(rootAbs: string, candidateAbs: string): void {
  const root = path.resolve(rootAbs);
  const candidate = path.resolve(candidateAbs);
  if (candidate === root) {
    return;
  }
  const relative = path.relative(root, candidate);
  if (relative === "" || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new PathEscapeError(root, candidate);
  }
}
