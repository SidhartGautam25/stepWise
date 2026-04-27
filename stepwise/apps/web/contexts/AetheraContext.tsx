"use client";

import React, { createContext, useContext, useCallback, useRef, useState, ReactNode } from "react";

export type NodeType = "directory" | "file";

export interface VfsNode {
  name: string;
  type: NodeType;
  owner: string;
  permissions: string;
  content?: string;
  children?: Record<string, VfsNode>;
}

interface CommandLog {
  command: string;
  output: string;
  isError: boolean;
  cwd?: string[];
}

interface AetheraState {
  vfs: Record<string, VfsNode>;
  cwd: string[];
  history: CommandLog[];
  execute: (input: string) => void;
  appendSystemLog: (msg: string) => void;
  markStepComplete: (stepId: string) => void;
  checkStepCompletion: (stepId: string) => boolean;
  completionVersion: number;
  questMode: "linux" | "git";
}

const initialState: Record<string, VfsNode> = {
  "bin": { name: "bin", type: "directory", owner: "root", permissions: "755", children: {
    "bash": { name: "bash", type: "file", owner: "root", permissions: "755", content: "The shell program that reads your commands.\n" },
    "ls": { name: "ls", type: "file", owner: "root", permissions: "755", content: "A command that lists directory contents.\n" },
  } },
  "tmp": { name: "tmp", type: "directory", owner: "root", permissions: "777", children: {
    "scratch.txt": { name: "scratch.txt", type: "file", owner: "student", permissions: "666", content: "Temporary files often live here.\n" },
  } },
  "etc": { name: "etc", type: "directory", owner: "root", permissions: "755", children: {
    "permissions.txt": { name: "permissions.txt", type: "file", owner: "root", permissions: "644", content: "r means read, w means write, x means execute or enter.\n" },
    "system.conf": { name: "system.conf", type: "file", owner: "root", permissions: "644", content: "System configuration files are commonly stored in /etc.\n" },
  } },
  "home": { name: "home", type: "directory", owner: "root", permissions: "755", children: {
    "student": { name: "student", type: "directory", owner: "student", permissions: "755", children: {
      "welcome.txt": { name: "welcome.txt", type: "file", owner: "student", permissions: "644", content: "Welcome. This is your home directory.\n" },
      "public": { name: "public", type: "directory", owner: "student", permissions: "755", children: {
        "notice.txt": { name: "notice.txt", type: "file", owner: "student", permissions: "644", content: "This directory can be entered and read by others.\n" },
      } },
      "private": { name: "private", type: "directory", owner: "student", permissions: "700", children: {
        "notes.txt": { name: "notes.txt", type: "file", owner: "student", permissions: "600", content: "Only the owner should read this file.\n" },
      } },
    } }
  }},
};

const AetheraContext = createContext<AetheraState | undefined>(undefined);

// ── Git VFS ───────────────────────────────────────────────────────────────────
const GIT_INITIAL_VFS: Record<string, VfsNode> = {
  "home": { name: "home", type: "directory", owner: "root", permissions: "755", children: {
    "student": { name: "student", type: "directory", owner: "student", permissions: "755", children: {} },
  }},
};

// ── Git state types ───────────────────────────────────────────────────────────
interface GitCommit { hash: string; message: string; branch: string; files: Record<string, string>; }

export function AetheraProvider({ children, questMode = "linux" }: { children: ReactNode; questMode?: "linux" | "git" }) {
  const isGit = questMode === "git";
  const [vfs, setVfs] = useState<Record<string, VfsNode>>(isGit ? GIT_INITIAL_VFS : initialState);
  const [cwd, setCwd] = useState<string[]>(["home", "student"]);
  const [history, setHistory] = useState<CommandLog[]>([]);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);

  // ── Git interpreter state ─────────────────────────────────────────────────
  const gitInitedRef = useRef(false);
  const gitStagedRef = useRef<Record<string, string>>({});
  const gitCommitsRef = useRef<GitCommit[]>([]);
  const gitBranchesRef = useRef<string[]>(["main"]);
  const gitCurrentBranchRef = useRef<string>("main");
  const gitFilesAtBranchRef = useRef<Record<string, Record<string, string>>>({ main: {} });

  const shortHash = () => Math.random().toString(36).slice(2, 9);

  const executeGit = useCallback((trimmed: string): { output: string; isError: boolean } => {
    const args = trimmed.split(/\s+/);
    const cmd = args[0];

    // ── git ──────────────────────────────────────────────────────────────────
    if (cmd === "git") {
      const sub = args[1];

      if (sub === "init") {
        if (gitInitedRef.current) return { output: "Reinitialized existing Git repository in .git/", isError: false };
        gitInitedRef.current = true;
        return { output: "Initialized empty Git repository in .git/", isError: false };
      }

      if (!gitInitedRef.current) return { output: "fatal: not a git repository (run git init first)", isError: true };

      if (sub === "status") {
        const branch = gitCurrentBranchRef.current;
        const staged = Object.keys(gitStagedRef.current);
        const committed = gitFilesAtBranchRef.current[branch] ?? {};
        // get working dir files
        const dirNode = getDirNode(cwd);
        const workingFiles = dirNode ? Object.keys(dirNode).filter(k => dirNode[k]?.type === "file") : [];
        const untracked = workingFiles.filter(f => !staged.includes(f) && !committed[f]);
        const modified = workingFiles.filter(f => !staged.includes(f) && committed[f] !== undefined && dirNode?.[f]?.content !== committed[f]);

        let out = `On branch ${branch}\n`;
        if (staged.length === 0 && untracked.length === 0 && modified.length === 0) {
          out += "nothing to commit, working tree clean";
        } else {
          if (staged.length > 0) out += `\nChanges to be committed:\n  (use "git restore --staged" to unstage)\n${staged.map(f => `        new file:   ${f}`).join("\n")}\n`;
          if (modified.length > 0) out += `\nChanges not staged for commit:\n${modified.map(f => `        modified:   ${f}`).join("\n")}\n`;
          if (untracked.length > 0) out += `\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n${untracked.map(f => `        ${f}`).join("\n")}\n`;
        }
        return { output: out.trim(), isError: false };
      }

      if (sub === "add") {
        const target = args[2];
        if (!target) return { output: "Nothing specified, nothing added.", isError: true };
        const dirNode = getDirNode(cwd);
        if (!dirNode) return { output: "fatal: cannot read current directory", isError: true };
        if (target === ".") {
          const files = Object.entries(dirNode).filter(([, n]) => n.type === "file");
          files.forEach(([name, node]) => { gitStagedRef.current[name] = (node as VfsNode).content ?? ""; });
          return { output: "", isError: false };
        }
        const node = dirNode[target];
        if (!node || node.type !== "file") return { output: `fatal: pathspec '${target}' did not match any files`, isError: true };
        gitStagedRef.current[target] = node.content ?? "";
        return { output: "", isError: false };
      }

      if (sub === "commit") {
        const msgIdx = args.indexOf("-m");
        const message = msgIdx !== -1 ? args.slice(msgIdx + 1).join(" ").replace(/^"|"$/g, "").replace(/^'|'$/g, "") : "";
        if (!message) return { output: "error: commit message is required (-m \"message\")", isError: true };
        const staged = gitStagedRef.current;
        if (Object.keys(staged).length === 0) return { output: "nothing to commit, working tree clean", isError: true };
        const branch = gitCurrentBranchRef.current;
        const hash = shortHash();
        const snapshot = { ...gitFilesAtBranchRef.current[branch], ...staged };
        gitFilesAtBranchRef.current[branch] = snapshot;
        gitCommitsRef.current.push({ hash, message, branch, files: { ...staged } });
        gitStagedRef.current = {};
        return { output: `[${branch} ${hash}] ${message}\n ${Object.keys(staged).length} file(s) changed`, isError: false };
      }

      if (sub === "log") {
        const oneline = args.includes("--oneline");
        const branch = gitCurrentBranchRef.current;
        const commits = gitCommitsRef.current.filter(c => c.branch === branch);
        if (commits.length === 0) return { output: "fatal: your current branch has no commits yet", isError: true };
        const lines = [...commits].reverse().map(c =>
          oneline ? `${c.hash.slice(0,7)} ${c.message}` : `commit ${c.hash}\n    ${c.message}`
        );
        return { output: lines.join("\n"), isError: false };
      }

      if (sub === "branch") {
        const newBranch = args[2];
        if (newBranch) {
          if (gitBranchesRef.current.includes(newBranch)) return { output: `fatal: a branch named '${newBranch}' already exists`, isError: true };
          gitBranchesRef.current.push(newBranch);
          const currentFiles = gitFilesAtBranchRef.current[gitCurrentBranchRef.current] ?? {};
          gitFilesAtBranchRef.current[newBranch] = { ...currentFiles };
          return { output: "", isError: false };
        }
        const current = gitCurrentBranchRef.current;
        const lines = gitBranchesRef.current.map(b => b === current ? `* ${b}` : `  ${b}`);
        return { output: lines.join("\n"), isError: false };
      }

      if (sub === "checkout") {
        const isNew = args[2] === "-b";
        const branchName = isNew ? args[3] : args[2];
        if (!branchName) return { output: "error: branch name required", isError: true };
        if (isNew) {
          if (gitBranchesRef.current.includes(branchName)) return { output: `fatal: A branch named '${branchName}' already exists`, isError: true };
          gitBranchesRef.current.push(branchName);
          const currentFiles = gitFilesAtBranchRef.current[gitCurrentBranchRef.current] ?? {};
          gitFilesAtBranchRef.current[branchName] = { ...currentFiles };
          gitCurrentBranchRef.current = branchName;
          return { output: `Switched to a new branch '${branchName}'`, isError: false };
        }
        if (!gitBranchesRef.current.includes(branchName)) return { output: `error: pathspec '${branchName}' did not match any branch`, isError: true };
        // Restore working directory files from that branch
        const branchFiles = gitFilesAtBranchRef.current[branchName] ?? {};
        setVfs(prev => {
          const next = JSON.parse(JSON.stringify(prev));
          const dir = getDirNodeFromVfs(cwd, next);
          if (!dir) return prev;
          // Remove files not in that branch, update files that are
          const existingFiles = Object.keys(dir).filter(k => dir[k]?.type === "file");
          existingFiles.forEach(f => { if (!branchFiles[f]) delete dir[f]; });
          Object.entries(branchFiles).forEach(([name, content]) => {
            dir[name] = { name, type: "file", owner: "student", permissions: "644", content: content as string };
          });
          return next;
        });
        gitCurrentBranchRef.current = branchName;
        return { output: `Switched to branch '${branchName}'`, isError: false };
      }

      if (sub === "diff") {
        return { output: "(no diff output in this interactive terminal)", isError: false };
      }

      return { output: `git: '${sub}' is not a supported command in this lesson`, isError: true };
    }

    // ── Non-git commands available in git mode ────────────────────────────────
    if (cmd === "mkdir") {
      const target = args[1];
      if (!target) return { output: "mkdir: missing operand", isError: true };
      const dir = getDirNode(cwd);
      if (!dir) return { output: "mkdir: cannot find current directory", isError: true };
      if (dir[target]) return { output: `mkdir: cannot create directory '${target}': File exists`, isError: true };
      setVfs(prev => traverseAndSet(cwd, { name: target, type: "directory", owner: "student", permissions: "755", children: {} }, prev));
      return { output: `created directory '${target}'`, isError: false };
    }

    if (cmd === "cd") {
      const target = args[1] || "/home/student";
      const newPath = resolvePath(target);
      if (!getDirNode(newPath)) return { output: `cd: ${target}: No such file or directory`, isError: true };
      setCwd(newPath);
      return { output: "", isError: false };
    }

    if (cmd === "ls") {
      const showHidden = args.includes("-la") || args.includes("-a") || args.includes("-l");
      const dir = getDirNode(cwd);
      if (!dir) return { output: "ls: cannot read directory", isError: true };
      let names = Object.values(dir).map(n => n.name);
      if (showHidden && gitInitedRef.current) names = [".git", ...names];
      return { output: names.join("  ") || "(empty)", isError: false };
    }

    if (cmd === "touch") {
      const target = args[1];
      if (!target) return { output: "touch: missing file operand", isError: true };
      const dir = getDirNode(cwd);
      if (!dir) return { output: "touch: cannot find current directory", isError: true };
      if (!dir[target]) setVfs(prev => traverseAndSet(cwd, { name: target, type: "file", owner: "student", permissions: "644", content: "" }, prev));
      return { output: "", isError: false };
    }

    if (cmd === "echo") {
      const redirectIndex = args.indexOf(">");
      const appendIndex = args.indexOf(">>");
      if (redirectIndex !== -1) {
        const text = args.slice(1, redirectIndex).join(" ").replace(/^"|"$/g, "");
        const file = args[redirectIndex + 1];
        if (!file) return { output: "echo: missing file", isError: true };
        setVfs(prev => traverseAndSet(cwd, { name: file, type: "file", owner: "student", permissions: "644", content: text + "\n" }, prev));
        return { output: "", isError: false };
      }
      if (appendIndex !== -1) {
        const text = args.slice(1, appendIndex).join(" ").replace(/^"|"$/g, "");
        const file = args[appendIndex + 1];
        if (!file) return { output: "echo: missing file", isError: true };
        const dir = getDirNode(cwd);
        const existing = (dir?.[file]?.content) ?? "";
        setVfs(prev => traverseAndSet(cwd, { name: file, type: "file", owner: "student", permissions: "644", content: existing + text + "\n" }, prev));
        return { output: "", isError: false };
      }
      return { output: args.slice(1).join(" ").replace(/^"|"$/g, ""), isError: false };
    }

    if (cmd === "cat") {
      const target = args[1];
      if (!target) return { output: "cat: missing operand", isError: true };
      const dir = getDirNode(cwd);
      if (!dir?.[target]) return { output: `cat: ${target}: No such file or directory`, isError: true };
      return { output: dir[target].content ?? "", isError: false };
    }

    if (cmd === "pwd") return { output: `/${cwd.join("/")}`, isError: false };
    if (cmd === "clear") return { output: "[CLEAR]", isError: false };

    return { output: `bash: ${cmd}: command not found\nAvailable: git, mkdir, cd, ls, touch, echo, cat, pwd, clear`, isError: true };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cwd, vfs]);

  const pathToString = (path: string[]) => `/${path.join("/")}`;

  const resolvePath = (pathStr: string): string[] => {
    if (!pathStr || pathStr === ".") return cwd;
    const parts = pathStr.split("/").filter(Boolean);
    const start = pathStr.startsWith("/") ? [] : [...cwd];

    for (const p of parts) {
      if (p === "..") start.pop();
      else if (p !== ".") start.push(p);
    }
    return start;
  };

  const getDirNode = (path: string[], currentVfs = vfs): Record<string, VfsNode> | null => {
    let currentDir = currentVfs;
    for (const p of path) {
      const next = currentDir[p];
      if (!next || next.type !== "directory" || !next.children) return null;
      currentDir = next.children;
    }
    return currentDir;
  };

  const getDirNodeFromVfs = (path: string[], fromVfs: Record<string, VfsNode>): Record<string, VfsNode> | null => {
    let currentDir = fromVfs;
    for (const p of path) {
      const next = currentDir[p];
      if (!next || next.type !== "directory" || !next.children) return null;
      currentDir = next.children;
    }
    return currentDir;
  };

  const traverseAndSet = (path: string[], newNode: VfsNode, oldVfs: Record<string, VfsNode>) => {
    const newVfs = JSON.parse(JSON.stringify(oldVfs));
    let dir = newVfs;
    for (const p of path) {
      if (!dir[p]) throw new Error("Path not found");
      dir = dir[p].children;
    }
    dir[newNode.name] = newNode;
    return newVfs;
  };

  // Route execute — linux mode uses the original interpreter, git mode uses executeGit
  const execute = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (isGit) {
      const result = executeGit(trimmed);
      if (result.output === "[CLEAR]") { setHistory([]); return; }
      setHistory(prev => [...prev, { command: trimmed, output: result.output, isError: result.isError, cwd: [...cwd] }]);
      return;
    }

    // ── Original Linux interpreter ───────────────────────────────────────────
    const args = trimmed.split(/\s+/);
    const cmd = args[0];
    let output = "";
    let isError = false;
    try {
      if (cmd === "continue") {
        output = "Intro complete. You can start using Linux commands now.";
      }
      else if (cmd === "pwd") {
        output = pathToString(cwd);
      }
      else if (cmd === "mkdir") {
        const target = args[1];
        if (!target) throw new Error("mkdir: missing operand");
        if (target.includes("/")) throw new Error("mkdir: this lesson expects a simple directory name");
        const dir = getDirNode(cwd);
        if (!dir) throw new Error("Cannot find current directory");
        if (dir[target]) throw new Error(`mkdir: cannot create directory '${target}': File exists`);
        const nextVfs = traverseAndSet(cwd, {
          name: target, type: "directory", owner: "student", permissions: "755", children: {}
        }, vfs);
        setVfs(nextVfs);
        output = `created directory '${target}' with permissions 755`;
      }
      else if (cmd === "cd") {
        const target = args[1] || "/home/student";
        const newPath = resolvePath(target);
        if (!getDirNode(newPath)) throw new Error(`cd: ${target}: No such file or directory`);
        setCwd(newPath);
      }
      else if (cmd === "ls") {
        const dir = getDirNode(cwd);
        if (!dir) throw new Error("Cannot read directory");
        output = Object.values(dir).map(n => n.name).join("  ");
      }
      else if (cmd === "touch") {
        const target = args[1];
        if (!target) throw new Error("touch: missing file operand");
        if (target.includes("/")) throw new Error("touch: this lesson expects a simple file name");
        const dir = getDirNode(cwd);
        if (!dir) throw new Error("Cannot find current directory");
        if (!dir[target]) {
          const nextVfs = traverseAndSet(cwd, {
            name: target, type: "file", owner: "student", permissions: "644", content: ""
          }, vfs);
          setVfs(nextVfs);
          output = `created file '${target}' with permissions 644`;
        }
      }
      else if (cmd === "echo") {
        const redirectIndex = args.indexOf(">");
        const appendIndex = args.indexOf(">>");
        let text = ""; let redirectArg = ""; let append = false;
        if (redirectIndex !== -1) {
          text = args.slice(1, redirectIndex).join(" ").replace(/^["']|["']$/g, "");
          redirectArg = args[redirectIndex + 1] || "";
        } else if (appendIndex !== -1) {
          text = args.slice(1, appendIndex).join(" ").replace(/^["']|["']$/g, "");
          redirectArg = args[appendIndex + 1] || ""; append = true;
        } else {
          output = args.slice(1).join(" ").replace(/^["']|["']$/g, "");
        }
        if (redirectArg) {
          const dir = getDirNode(cwd);
          if (!dir) throw new Error("Cannot find current directory");
          const existingContent = append ? (dir[redirectArg]?.content || "") : "";
          const nextVfs = traverseAndSet(cwd, {
            name: redirectArg, type: "file", owner: "student", permissions: "644",
            content: existingContent + text + "\n"
          }, vfs);
          setVfs(nextVfs);
        }
      }
      else if (cmd === "cat") {
        const target = args[1];
        if (!target) throw new Error("cat: missing operand");
        const dir = getDirNode(cwd);
        if (!dir || !dir[target]) throw new Error(`cat: ${target}: No such file or directory`);
        if (dir[target].type !== "file") throw new Error(`cat: ${target}: Is a directory`);
        output = dir[target].content || "";
      }
      else if (cmd === "rm") {
        const isRecursive = args.includes("-r") || args.includes("-rf");
        const target = args.filter(a => !a.startsWith("-"))[1];
        if (!target) throw new Error("rm: missing operand");
        const currentVfs = JSON.parse(JSON.stringify(vfs));
        const dir = getDirNode(cwd, currentVfs);
        if (!dir || !dir[target]) throw new Error(`rm: cannot remove '${target}': No such file or directory`);
        if (dir[target].type === "directory" && !isRecursive) throw new Error(`rm: cannot remove '${target}': Is a directory`);
        delete dir[target];
        setVfs(currentVfs);
      }
      else if (cmd === "clear") {
        setHistory([]);
        return;
      }
      else {
        throw new Error(`bash: ${cmd}: command not found.\nThis interactive lesson only supports specific commands: continue, pwd, mkdir, cd, ls, touch, echo, cat, rm, clear.\nPlease verify your spelling and try sticking to the lesson objectives!`);
      }
    } catch (e: any) {
      isError = true; output = e.message;
    }
    setHistory(prev => [...prev, { command: trimmed, output, isError, cwd: [...cwd] }]);
  };

  const appendSystemLog = useCallback((msg: string) => {
    setHistory(prev => [...prev, { command: "", output: msg, isError: false }]);
  }, []);

  const markStepComplete = useCallback((stepId: string) => {
    setCompletedStepIds((prev) => (prev.includes(stepId) ? prev : [...prev, stepId]));
  }, []);

  const successfulCommands = () => history.filter((log) => log.command && !log.isError);
  const hasCommand = (command: string, path?: string) =>
    successfulCommands().some((log) => log.command.trim() === command && (!path || pathToString(log.cwd ?? []) === path));
  const commandCount = (command: string, path?: string) =>
    successfulCommands().filter((log) => log.command.trim() === command && (!path || pathToString(log.cwd ?? []) === path)).length;

  const checkStepCompletion = (stepId: string): boolean => {
    if (completedStepIds.includes(stepId)) {
      return true;
    }

    const homeStudent = getDirNode(["home", "student"]);
    const projects = homeStudent?.["projects"];
    const projectDir = projects?.type === "directory" ? projects.children : undefined;
    const notes = projectDir?.["notes.txt"];

    if (stepId === "00-welcome" || stepId === "00-why-os") {
      return completedStepIds.includes(stepId);
    }

    if (stepId === "00-orientation") {
      return hasCommand("continue");
    }

    if (stepId === "01-directories") {
      return !!(
        projects &&
        projects.type === "directory" &&
        hasCommand("pwd", "/home/student") &&
        commandCount("ls", "/home/student") >= 2 &&
        hasCommand("mkdir projects", "/home/student")
      );
    }

    if (stepId === "02-navigation") {
      return !!(
        projects &&
        cwd.join("/") === "home/student/projects" &&
        hasCommand("cd projects", "/home/student") &&
        hasCommand("pwd", "/home/student/projects") &&
        hasCommand("cd ..", "/home/student/projects")
      );
    }

    if (stepId === "03-files-and-listing") {
      return !!(
        notes &&
        notes.type === "file" &&
        notes.content?.includes("hello linux") &&
        cwd.join("/") === "home/student/projects" &&
        hasCommand("touch notes.txt", "/home/student/projects") &&
        hasCommand("echo hello linux > notes.txt", "/home/student/projects") &&
        hasCommand("ls", "/home/student/projects") &&
        hasCommand("cat notes.txt", "/home/student/projects")
      );
    }

    return false;
  };

  return (
    <AetheraContext.Provider
      value={{
        vfs,
        cwd,
        history,
        execute,
        checkStepCompletion,
        appendSystemLog,
        markStepComplete,
        completionVersion: completedStepIds.length,
        questMode,
      }}
    >
      {children}
    </AetheraContext.Provider>
  );
}

export const useAethera = () => {
  const context = useContext(AetheraContext);
  if (!context) throw new Error("useAethera must be used within AetheraProvider");
  return context;
};
