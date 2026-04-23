"use client";

import React, { createContext, useContext, useCallback, useState, ReactNode } from "react";

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
  checkStepCompletion: (stepId: string) => boolean;
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

export function AetheraProvider({ children }: { children: ReactNode }) {
  const [vfs, setVfs] = useState<Record<string, VfsNode>>(initialState);
  const [cwd, setCwd] = useState<string[]>(["home", "student"]);
  const [history, setHistory] = useState<CommandLog[]>([]);

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

  const execute = (input: string) => {
    const trimmed = input.trim();
    const args = trimmed.split(/\s+/);
    const cmd = args[0];
    let output = "";
    let isError = false;

    if (!cmd) return;

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

        let text = "";
        let redirectArg = "";
        let append = false;

        if (redirectIndex !== -1) {
          text = args.slice(1, redirectIndex).join(" ").replace(/^["']|["']$/g, "");
          redirectArg = args[redirectIndex + 1] || "";
        } else if (appendIndex !== -1) {
          text = args.slice(1, appendIndex).join(" ").replace(/^["']|["']$/g, "");
          redirectArg = args[appendIndex + 1] || "";
          append = true;
        } else {
          output = args.slice(1).join(" ").replace(/^["']|["']$/g, "");
        }

        if (redirectArg) {
          const dir = getDirNode(cwd);
          if (!dir) throw new Error("Cannot find current directory");

          let existingContent = "";
          const targetNode = dir[redirectArg];
          if (targetNode && targetNode.type === "file") {
            existingContent = targetNode.content || "";
          }

          const nextVfs = traverseAndSet(cwd, {
            name: redirectArg,
            type: "file",
            owner: "student",
            permissions: "644",
            content: append ? existingContent + text + "\n" : text + "\n"
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

        if (dir[target].type === "directory" && !isRecursive) {
          throw new Error(`rm: cannot remove '${target}': Is a directory`);
        }

        delete dir[target];
        setVfs(currentVfs);
      }
      else {
        throw new Error(`bash: ${cmd}: command not found`);
      }
    } catch (e: any) {
      isError = true;
      output = e.message;
    }

    setHistory(prev => [...prev, { command: trimmed, output, isError, cwd: [...cwd] }]);
  };

  const appendSystemLog = useCallback((msg: string) => {
    setHistory(prev => [...prev, { command: "", output: msg, isError: false }]);
  }, []);

  const successfulCommands = () => history.filter((log) => log.command && !log.isError);
  const hasCommand = (command: string, path?: string) =>
    successfulCommands().some((log) => log.command.trim() === command && (!path || pathToString(log.cwd ?? []) === path));
  const commandCount = (command: string, path?: string) =>
    successfulCommands().filter((log) => log.command.trim() === command && (!path || pathToString(log.cwd ?? []) === path)).length;

  const checkStepCompletion = (stepId: string): boolean => {
    const homeStudent = getDirNode(["home", "student"]);
    const projects = homeStudent?.["projects"];
    const projectDir = projects?.type === "directory" ? projects.children : undefined;
    const notes = projectDir?.["notes.txt"];

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
    <AetheraContext.Provider value={{ vfs, cwd, history, execute, checkStepCompletion, appendSystemLog }}>
      {children}
    </AetheraContext.Provider>
  );
}

export const useAethera = () => {
  const context = useContext(AetheraContext);
  if (!context) throw new Error("useAethera must be used within AetheraProvider");
  return context;
};
