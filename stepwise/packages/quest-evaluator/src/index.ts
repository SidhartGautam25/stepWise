import type { CompletionRule, CompletionSpec } from "@repo/challenge-schema";

export interface EvaluatorGitCommit {
  branch?: string;
}

export interface EvaluatorGitState {
  initialized?: boolean;
  branch: string;
  branches: unknown[];
  commits: EvaluatorGitCommit[];
}

export interface EvaluatorVfsNode {
  type: string;
  content?: string;
  children?: Record<string, EvaluatorVfsNode>;
}

export interface EvaluatorTerminalState {
  cwd: string[];
  vfs: Record<string, EvaluatorVfsNode>;
  git?: EvaluatorGitState;
}

export interface EvaluatorTerminalLog {
  command?: string;
  error?: boolean | string;
}

function normalizePath(path: string): string[] {
  return path.replace(/^\/+/, "").split("/").filter(Boolean);
}

function getDirNode(state: EvaluatorTerminalState, path: string[]): any {
  let currentDir: any = state.vfs;
  for (const p of path) {
    if (!currentDir[p] || currentDir[p].type !== "directory") return null;
    currentDir = currentDir[p].children;
    if (!currentDir) return null;
  }
  return currentDir;
}

function getFileNode(state: EvaluatorTerminalState, rawPath: string): any {
  const path = normalizePath(rawPath);
  if (path.length === 0) return null;
  const fileName = path[path.length - 1];
  if (!fileName) return null;
  const parentDir = getDirNode(state, path.slice(0, -1));
  return parentDir?.[fileName] ?? null;
}

function successfulCommands(history: EvaluatorTerminalLog[]): string[] {
  return history
    .filter((log) => log.command && !log.error)
    .map((log) => log.command?.trim() ?? "")
    .filter(Boolean);
}

export function evaluateCompletionRule(
  rule: CompletionRule,
  state: EvaluatorTerminalState,
  history: EvaluatorTerminalLog[],
): boolean {
  const commands = successfulCommands(history);
  const git = state.git;

  switch (rule.type) {
    case "command_exact":
      return commands.some((command) => command === rule.command);
    case "command_prefix":
      return commands.some((command) => command.startsWith(rule.prefix));
    case "command_count_gte":
      return commands.filter((command) => command === rule.command).length >= rule.count;
    case "cwd_is":
      return state.cwd.join("/") === rule.path.replace(/^\/+/, "");
    case "git_initialized":
      return !!git?.initialized;
    case "git_commits_gte": {
      if (!git) return false;
      const commits = rule.currentBranchOnly
        ? git.commits.filter((commit) => commit.branch === git.branch)
        : git.commits;
      return commits.length >= rule.count;
    }
    case "git_branches_gte":
      return (git?.branches.length ?? 0) >= rule.count;
    case "vfs_dir_exists":
      return !!getDirNode(state, normalizePath(rule.path));
    case "vfs_file_contains": {
      const node = getFileNode(state, rule.path);
      return !!(node?.type === "file" && node.content?.includes(rule.text));
    }
    default:
      return false;
  }
}

export function evaluateCompletionSpec(
  spec: CompletionSpec,
  state: EvaluatorTerminalState,
  history: EvaluatorTerminalLog[],
): boolean {
  return spec.all.every((rule) => evaluateCompletionRule(rule, state, history));
}
