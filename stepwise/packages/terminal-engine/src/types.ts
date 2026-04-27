/**
 * @repo/terminal-engine — Types
 *
 * Shared state types for the simulated terminal interpreter.
 * Pure data — no React, no side-effects.
 */

// ── Filesystem ────────────────────────────────────────────────────────────────

export type NodeType = "directory" | "file";

export interface VfsNode {
  name: string;
  type: NodeType;
  owner: string;
  permissions: string;
  content?: string;
  children?: Record<string, VfsNode>;
}

// ── Git ───────────────────────────────────────────────────────────────────────

export interface GitCommitRecord {
  hash: string;        // 7-char hex e.g. "a1b2c3d"
  message: string;
  branch: string;
  timestamp: number;
}

export interface GitBranch {
  name: string;
  head: string | null; // commit hash or null (no commits yet)
}

// ── Terminal State ────────────────────────────────────────────────────────────

export interface TerminalState {
  /** Current working directory segments, e.g. ["home","student"] */
  cwd: string[];
  /** Full virtual file system tree */
  vfs: Record<string, VfsNode>;
  /** Git-specific state — present only once `git init` is run */
  git?: {
    initialized: boolean;
    branch: string;
    branches: GitBranch[];
    staged: string[];         // names of staged files
    commits: GitCommitRecord[];
  };
}

// ── Interpreter ───────────────────────────────────────────────────────────────

export interface CommandResult {
  /** Lines of output to display */
  lines: string[];
  /** If true, output is styled as an error */
  error: boolean;
  /** Updated state after the command */
  newState: TerminalState;
}

/** A pure function that interprets a raw command string and returns a result */
export type Interpreter = (raw: string, state: TerminalState) => CommandResult;

/** Supported terminal language modes */
export type TerminalLanguage = "linux" | "git";

// ── Default State ─────────────────────────────────────────────────────────────

export function makeDefaultState(
  opts: Partial<TerminalState> = {},
): TerminalState {
  const cwd = opts.cwd ?? ["home", "student"];
  let baseVfs = opts.vfs ?? {};

  // Ensure the default CWD path exists in the VFS
  if (Object.keys(baseVfs).length === 0 && cwd.length > 0) {
    let current = baseVfs;
    for (const p of cwd) {
      current[p] = { name: p, type: "directory", permissions: "755", owner: "student", children: {} };
      current = current[p].children as Record<string, VfsNode>;
    }
  }

  return {
    cwd,
    vfs: baseVfs,
    git: opts.git,
  };
}
