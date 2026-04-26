/**
 * Git Interpreter
 *
 * Simulates git commands in the terminal engine.
 * Supports: git init, git status, git add, git commit, git log, git branch,
 *           git checkout, git diff (simplified)
 * Also delegates non-git commands to the linux interpreter.
 */

import type { Interpreter, CommandResult, TerminalState, GitBranch, GitCommitRecord } from "../types";
import { linuxInterpreter } from "./linuxInterpreter";

function ok(lines: string[], newState: TerminalState): CommandResult {
  return { lines, error: false, newState };
}
function err(lines: string[], newState: TerminalState): CommandResult {
  return { lines, error: true, newState };
}

function shortHash(): string {
  return Math.random().toString(16).slice(2, 9);
}

function ensureGit(state: TerminalState): TerminalState {
  if (state.git) return state;
  return {
    ...state,
    git: {
      initialized: false,
      branch: "main",
      branches: [],
      staged: [],
      commits: [],
    },
  };
}

function handleGitCommand(gitArgs: string[], state: TerminalState): CommandResult {
  const git = state.git!;
  const sub = gitArgs[0] ?? "";

  // ── git init ──────────────────────────────────────────────────────────────
  if (sub === "init") {
    if (git.initialized) return ok(["Reinitialized existing Git repository in .git/"], state);
    const newState: TerminalState = {
      ...state,
      files: [...state.files, { name: ".git", isDir: true }],
      git: { ...git, initialized: true, branches: [{ name: "main", head: null }] },
    };
    return ok(["Initialized empty Git repository in .git/"], newState);
  }

  if (!git.initialized) {
    return err(["fatal: not a git repository (or any of the parent directories): .git"], state);
  }

  // ── git status ────────────────────────────────────────────────────────────
  if (sub === "status") {
    const untracked = state.files
      .filter(f => !f.isDir && f.name !== ".git" && !git.staged.includes(f.name))
      .map(f => f.name);
    const lines: string[] = [`On branch ${git.branch}`];
    if (git.staged.length === 0 && untracked.length === 0) {
      lines.push("nothing to commit, working tree clean");
    } else {
      if (git.staged.length > 0) {
        lines.push("", "Changes to be committed:", '  (use "git restore --staged <file>..." to unstage)', "");
        git.staged.forEach(f => lines.push(`\tnew file:   ${f}`));
      }
      if (untracked.length > 0) {
        lines.push("", "Untracked files:", '  (use "git add <file>..." to include in what will be committed)', "");
        untracked.forEach(f => lines.push(`\t${f}`));
      }
    }
    return ok(lines, state);
  }

  // ── git add ───────────────────────────────────────────────────────────────
  if (sub === "add") {
    const target = gitArgs[1] ?? "";
    let toStage: string[] = [];
    if (target === "." || target === "-A") {
      toStage = state.files.filter(f => !f.isDir && f.name !== ".git").map(f => f.name);
    } else {
      const f = state.files.find(f => f.name === target && !f.isDir);
      if (!f) return err([`error: pathspec '${target}' did not match any files`], state);
      toStage = [target];
    }
    const staged = [...new Set([...git.staged, ...toStage])];
    return ok([], { ...state, git: { ...git, staged } });
  }

  // ── git commit ────────────────────────────────────────────────────────────
  if (sub === "commit") {
    if (git.staged.length === 0) return err(["nothing to commit, working tree clean"], state);
    const mIdx = gitArgs.indexOf("-m");
    const message = mIdx !== -1 ? gitArgs.slice(mIdx + 1).join(" ").replace(/^["']|["']$/g, "") : "Update";
    const hash = shortHash();
    const commit: GitCommitRecord = { hash, message, branch: git.branch, timestamp: Date.now() };
    const branches: GitBranch[] = git.branches.map(b =>
      b.name === git.branch ? { ...b, head: hash } : b,
    );
    const newState: TerminalState = {
      ...state,
      git: { ...git, staged: [], commits: [...git.commits, commit], branches },
    };
    return ok([`[${git.branch} ${hash}] ${message}`, `  ${git.staged.length} file(s) changed`], newState);
  }

  // ── git log ───────────────────────────────────────────────────────────────
  if (sub === "log") {
    const oneline = gitArgs.includes("--oneline");
    if (git.commits.length === 0) return err(["fatal: your current branch 'main' does not have any commits yet"], state);
    const lines: string[] = [];
    [...git.commits].reverse().forEach(c => {
      if (oneline) {
        lines.push(`\x1b[33m${c.hash}\x1b[0m ${c.message}`);
      } else {
        lines.push(
          `commit \x1b[33m${c.hash}\x1b[0m`,
          `Author: Student <student@linux.local>`,
          `Date:   ${new Date(c.timestamp).toUTCString()}`,
          ``,
          `    ${c.message}`,
          ``,
        );
      }
    });
    return ok(lines, state);
  }

  // ── git branch ────────────────────────────────────────────────────────────
  if (sub === "branch") {
    const newBranchName = gitArgs[1] ?? "";
    if (!newBranchName || newBranchName.startsWith("-")) {
      // list branches
      const lines = git.branches.map(b =>
        b.name === git.branch ? `* \x1b[32m${b.name}\x1b[0m` : `  ${b.name}`,
      );
      return ok(lines.length ? lines : ["(no branches)"], state);
    }
    if (git.branches.find(b => b.name === newBranchName)) {
      return err([`fatal: A branch named '${newBranchName}' already exists.`], state);
    }
    const currentHead = git.branches.find(b => b.name === git.branch)?.head ?? null;
    const branches: GitBranch[] = [...git.branches, { name: newBranchName, head: currentHead }];
    return ok([], { ...state, git: { ...git, branches } });
  }

  // ── git checkout ─────────────────────────────────────────────────────────
  if (sub === "checkout") {
    const createNew = gitArgs[1] === "-b";
    const targetName = createNew ? gitArgs[2] : gitArgs[1];
    if (!targetName) return err(["error: branch name required"], state);
    if (createNew) {
      if (git.branches.find(b => b.name === targetName)) {
        return err([`fatal: A branch named '${targetName}' already exists.`], state);
      }
      const currentHead = git.branches.find(b => b.name === git.branch)?.head ?? null;
      const branches: GitBranch[] = [...git.branches, { name: targetName, head: currentHead }];
      return ok([`Switched to a new branch '${targetName}'`], { ...state, git: { ...git, branches, branch: targetName } });
    } else {
      if (!git.branches.find(b => b.name === targetName)) {
        return err([`error: pathspec '${targetName}' did not match any file(s) known to git`], state);
      }
      return ok([`Switched to branch '${targetName}'`], { ...state, git: { ...git, branch: targetName } });
    }
  }

  // ── git diff ─────────────────────────────────────────────────────────────
  if (sub === "diff") {
    const unstaged = state.files.filter(f => !f.isDir && f.name !== ".git" && !git.staged.includes(f.name));
    if (unstaged.length === 0 && git.staged.length === 0) return ok([], state);
    const lines: string[] = [];
    unstaged.forEach(f => {
      lines.push(`diff --git a/${f.name} b/${f.name}`, `--- a/${f.name}`, `+++ b/${f.name}`, `@@ -0,0 +1 @@`, `+${f.content ?? ""}`);
    });
    return ok(lines, state);
  }

  // ── git switch ────────────────────────────────────────────────────────────
  if (sub === "switch") {
    return handleGitCommand(["checkout", ...gitArgs.slice(1)], state);
  }

  return err([`git: '${sub}' is not a git command. See 'git --help'.`], state);
}

export const gitInterpreter: Interpreter = (raw, state) => {
  const withGit = ensureGit(state);
  const trimmed = raw.trim();
  if (!trimmed) return { lines: [], error: false, newState: withGit };

  const parts = trimmed.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? [];
  const [cmd, ...rest] = parts;

  if (cmd === "git") {
    return handleGitCommand(rest, withGit);
  }

  // Delegate non-git commands to linux interpreter
  const result = linuxInterpreter(raw, withGit);
  return result;
};
