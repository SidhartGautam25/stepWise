import type { Interpreter, CommandResult, TerminalState } from "../types";
import { getDirNode, resolvePath, traverseAndSet, traverseAndDelete } from "../utils/vfs";

function ok(lines: string[], newState: TerminalState): CommandResult {
  return { lines, error: false, newState };
}
function err(lines: string[], newState: TerminalState): CommandResult {
  return { lines, error: true, newState };
}

export const linuxInterpreter: Interpreter = (raw, state) => {
  const trimmed = raw.trim();
  if (!trimmed) return ok([], state);

  // Handle `echo "..." > file` pipe
  const echoRedirect = trimmed.match(/^echo\s+"?([^">]*)"?\s*>\s*(\S+)$/);
  if (echoRedirect) {
    const content = echoRedirect[1] ?? "";
    const fname = echoRedirect[2] ?? "";
    const vfs = traverseAndSet(state.cwd, { name: fname, type: "file", owner: "student", permissions: "644", content: content + "\n" }, state.vfs);
    return ok([], { ...state, vfs });
  }

  // Handle `echo "..." >> file` pipe
  const echoAppend = trimmed.match(/^echo\s+"?([^">]*)"?\s*>>\s*(\S+)$/);
  if (echoAppend) {
    const text = echoAppend[1] ?? "";
    const fname = echoAppend[2] ?? "";
    const dir = getDirNode(state.cwd, [], state.vfs);
    const existing = dir?.[fname]?.content ?? "";
    const vfs = traverseAndSet(state.cwd, { name: fname, type: "file", owner: "student", permissions: "644", content: existing + text + "\n" }, state.vfs);
    return ok([], { ...state, vfs });
  }

  const [cmd, ...rest] = trimmed.split(/\s+/);
  const arg = rest.join(" ");

  switch (cmd) {
    case "pwd":
      return ok(["/" + state.cwd.join("/")], state);

    case "cd": {
      const target = arg || "/home/student";
      const newPath = resolvePath(state.cwd, target);
      if (!getDirNode(state.cwd, [target], state.vfs)) return err([`cd: ${target}: No such file or directory`], state);
      return ok([], { ...state, cwd: newPath });
    }

    case "ls": {
      const showHidden = rest.includes("-la") || rest.includes("-a") || rest.includes("-l");
      const dir = getDirNode(state.cwd, [], state.vfs);
      if (!dir) return err(["ls: cannot read directory"], state);
      let names = Object.values(dir).map(f => f.type === "directory" ? `\x1b[34m${f.name}\x1b[0m` : f.name);
      if (showHidden && state.git?.initialized) names = ["\x1b[34m.git\x1b[0m", ...names];
      if (names.length === 0) return ok([], state);
      return ok([names.join("  ")], state);
    }

    case "mkdir": {
      if (!arg) return err(["mkdir: missing operand"], state);
      const dir = getDirNode(state.cwd, [], state.vfs);
      if (!dir) return err(["mkdir: cannot find current directory"], state);
      if (dir[arg]) return err([`mkdir: cannot create directory '${arg}': File exists`], state);
      const vfs = traverseAndSet(state.cwd, { name: arg, type: "directory", owner: "student", permissions: "755", children: {} }, state.vfs);
      return ok([], { ...state, vfs });
    }

    case "touch": {
      if (!arg) return err(["touch: missing file operand"], state);
      const dir = getDirNode(state.cwd, [], state.vfs);
      if (!dir) return err(["touch: cannot find current directory"], state);
      if (dir[arg]) return ok([], state);
      const vfs = traverseAndSet(state.cwd, { name: arg, type: "file", owner: "student", permissions: "644", content: "" }, state.vfs);
      return ok([], { ...state, vfs });
    }

    case "echo": {
      return ok([arg.replace(/^["']|["']$/g, "")], state);
    }

    case "cat": {
      if (!arg) return err(["cat: missing file operand"], state);
      const dir = getDirNode(state.cwd, [], state.vfs);
      if (!dir?.[arg]) return err([`cat: ${arg}: No such file or directory`], state);
      if (dir[arg]?.type === "directory") return err([`cat: ${arg}: Is a directory`], state);
      return ok([dir[arg]?.content ?? ""], state);
    }

    case "rm": {
      const target = rest[rest.length - 1] ?? "";
      if (!target) return err(["rm: missing operand"], state);
      const dir = getDirNode(state.cwd, [], state.vfs);
      if (!dir?.[target]) return err([`rm: cannot remove '${target}': No such file or directory`], state);
      const vfs = traverseAndDelete(state.cwd, target, state.vfs);
      return ok([], { ...state, vfs });
    }

    case "clear":
      return ok(["__CLEAR__"], state);

    case "continue":
      return ok([], state);

    default:
      return err([
        `bash: ${cmd}: command not found`,
        `\x1b[90mThis interactive lesson only supports specific commands: continue, pwd, cd, ls, mkdir, touch, echo, cat, rm, clear.\x1b[0m`,
        `\x1b[90mPlease verify your spelling and try sticking to the lesson objectives!\x1b[0m`
      ], state);
  }
};
