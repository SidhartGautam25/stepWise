/**
 * @repo/terminal-engine — Types
 *
 * Shared state types for the simulated terminal interpreter.
 * Pure data — no React, no side-effects.
 */

// ── Filesystem ────────────────────────────────────────────────────────────────

export interface FileNode {
  name: string;
  isDir: boolean;
  content?: string;    // undefined for directories
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
  /** All files in the current working directory */
  files: FileNode[];
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
  opts: Partial<TerminalState> & { files?: FileNode[] } = {},
): TerminalState {
  return {
    cwd: opts.cwd ?? ["home", "student"],
    files: opts.files ?? [],
    git: opts.git,
  };
}
