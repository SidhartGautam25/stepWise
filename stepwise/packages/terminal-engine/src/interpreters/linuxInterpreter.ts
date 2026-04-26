/**
 * Linux Interpreter
 *
 * Handles basic Linux shell commands in the simulated terminal.
 * Supports: ls, pwd, cd, mkdir, touch, echo, cat, rm, clear
 */

import type { Interpreter, CommandResult, TerminalState, FileNode } from "../types";

function ok(lines: string[], newState: TerminalState): CommandResult {
  return { lines, error: false, newState };
}
function err(lines: string[], newState: TerminalState): CommandResult {
  return { lines, error: true, newState };
}
function cwdStr(state: TerminalState) {
  return "/" + state.cwd.join("/");
}

export const linuxInterpreter: Interpreter = (raw, state) => {
  const trimmed = raw.trim();
  if (!trimmed) return ok([], state);

  // Handle `echo "..." > file` pipe
  const echoRedirect = trimmed.match(/^echo\s+"?([^">]*)"?\s*>\s*(\S+)$/);
  if (echoRedirect) {
    const content = echoRedirect[1] ?? "";
    const fname = echoRedirect[2] ?? "";
    const files = state.files.filter(f => f.name !== fname);
    files.push({ name: fname, isDir: false, content });
    return ok([`Written to ${fname}`], { ...state, files });
  }

  const [cmd, ...rest] = trimmed.split(/\s+/);
  const arg = rest.join(" ");

  switch (cmd) {
    case "pwd":
      return ok([cwdStr(state)], state);

    case "ls": {
      if (state.files.length === 0) return ok([], state);
      const names = state.files.map(f => f.isDir ? `\x1b[34m${f.name}\x1b[0m` : f.name);
      return ok([names.join("  ")], state);
    }

    case "mkdir": {
      if (!arg) return err(["mkdir: missing operand"], state);
      if (state.files.find(f => f.name === arg)) return err([`mkdir: cannot create directory '${arg}': File exists`], state);
      const files: FileNode[] = [...state.files, { name: arg, isDir: true }];
      return ok([], { ...state, files });
    }

    case "touch": {
      if (!arg) return err(["touch: missing file operand"], state);
      if (state.files.find(f => f.name === arg)) return ok([], state);
      const files: FileNode[] = [...state.files, { name: arg, isDir: false, content: "" }];
      return ok([], { ...state, files });
    }

    case "echo": {
      // plain echo (no redirect)
      return ok([arg.replace(/^["']|["']$/g, "")], state);
    }

    case "cat": {
      if (!arg) return err(["cat: missing file operand"], state);
      const f = state.files.find(f => f.name === arg && !f.isDir);
      if (!f) return err([`cat: ${arg}: No such file or directory`], state);
      return ok([f.content ?? ""], state);
    }

    case "rm": {
      const target = rest[rest.length - 1] ?? "";
      if (!target) return err(["rm: missing operand"], state);
      const files = state.files.filter(f => f.name !== target);
      if (files.length === state.files.length) return err([`rm: cannot remove '${target}': No such file or directory`], state);
      return ok([], { ...state, files });
    }

    case "clear":
      return ok(["__CLEAR__"], state);

    default:
      return err([`${cmd}: command not found`], state);
  }
};
