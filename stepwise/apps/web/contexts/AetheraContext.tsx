"use client";

import React, { createContext, useContext, useCallback, useState, ReactNode } from "react";

export type NodeType = "sanctum" | "codex";

export interface VfsNode {
  name: string;
  type: NodeType;
  owner: string;
  permissions: string; // e.g. "755", "644"
  content?: string; // used if codex
  children?: Record<string, VfsNode>; // used if sanctum
}

interface CommandLog {
  command: string;
  output: string;
  isError: boolean;
  cwd?: string[];
}

interface AetheraState {
  vfs: Record<string, VfsNode>;
  cwd: string[]; // path array, e.g. ["projects", "house"]
  history: CommandLog[];
  execute: (input: string) => void;
  appendSystemLog: (msg: string) => void;
  checkStepCompletion: (stepId: string) => boolean;
}

const initialState: Record<string, VfsNode> = {
  "bin": { name: "bin", type: "sanctum", owner: "root", permissions: "755", children: {
    "guide-spirit": { name: "guide-spirit", type: "codex", owner: "root", permissions: "755", content: "The Guide Spirit listens for your commands.\n" },
    "veil-reader": { name: "veil-reader", type: "codex", owner: "root", permissions: "755", content: "A small spell for reading hidden marks.\n" },
  } },
  "tmp": { name: "tmp", type: "sanctum", owner: "root", permissions: "777", children: {
    "passing-rune": { name: "passing-rune", type: "codex", owner: "traveler", permissions: "666", content: "Anyone may leave a temporary mark here.\n" },
  } },
  "etc": { name: "etc", type: "sanctum", owner: "root", permissions: "755", children: {
    "laws-of-aethera": { name: "laws-of-aethera", type: "codex", owner: "root", permissions: "644", content: "Sight reads. Ink changes. Passage enters.\n" },
    "veil.conf": { name: "veil.conf", type: "codex", owner: "root", permissions: "644", content: "Sanctums begin open, then the Veil removes unsafe powers.\n" },
  } },
  "home": { name: "home", type: "sanctum", owner: "root", permissions: "755", children: {
    "student": { name: "student", type: "sanctum", owner: "student", permissions: "755", children: {
      "welcome-codex": { name: "welcome-codex", type: "codex", owner: "student", permissions: "644", content: "You are the Owner Soul here. Create house to begin.\n" },
      "public": { name: "public", type: "sanctum", owner: "student", permissions: "755", children: {
        "notice": { name: "notice", type: "codex", owner: "student", permissions: "644", content: "Others may see this, but only the owner may change it.\n" },
      } },
      "sealed-vault": { name: "sealed-vault", type: "sanctum", owner: "student", permissions: "700", children: {
        "private-rune": { name: "private-rune", type: "codex", owner: "student", permissions: "600", content: "Only the Owner Soul may read this.\n" },
      } },
    } }
  }},
};

const AetheraContext = createContext<AetheraState | undefined>(undefined);

export function AetheraProvider({ children }: { children: ReactNode }) {
  const [vfs, setVfs] = useState<Record<string, VfsNode>>(initialState);
  const [cwd, setCwd] = useState<string[]>(["home", "student"]); // Start in ~
  const [history, setHistory] = useState<CommandLog[]>([]);

  // Helpers to traverse VFS
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
      if (!next || next.type !== "sanctum" || !next.children) return null;
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
    const args = input.trim().split(/\s+/);
    const cmd = args[0];
    let output = "";
    let isError = false;

    if (!cmd) return;

    try {
      if (cmd === "mkdir") {
        const target = args[1];
        if (!target) throw new Error("mkdir: missing operand");
        const dir = getDirNode(cwd);
        if (!dir) throw new Error("Cannot find current directory");
        if (dir[target]) throw new Error(`mkdir: cannot create directory '${target}': File exists`);
        
        const nextVfs = traverseAndSet(cwd, {
          name: target, type: "sanctum", owner: "student", permissions: "755", children: {}
        }, vfs);
        setVfs(nextVfs);
        output = `The Veil settles on '${target}' with mark 755: owner has Sight, Ink, and Passage; others keep Sight and Passage.`;
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
        const dir = getDirNode(cwd);
        if (!dir) throw new Error("Cannot find current directory");
        
        if (!dir[target]) {
           const nextVfs = traverseAndSet(cwd, {
             name: target, type: "codex", owner: "student", permissions: "644", content: ""
           }, vfs);
           setVfs(nextVfs);
           output = `A new Codex '${target}' appears with mark 644: owner may read/write; others may only read.`;
        }
      }
      else if (cmd === "echo") {
        // Simple mock for `echo "hello" > index.txt` or `>>`
        // We do a naive split
        const redirectIndex = args.indexOf(">");
        const appendIndex = args.indexOf(">>");
        
        let text = "";
        let redirectArg = "";
        let append = false;

        if (redirectIndex !== -1) {
          text = args.slice(1, redirectIndex).join(" ").replace(/^["']|["']$/g, '');
          redirectArg = args[redirectIndex + 1] || "";
        } else if (appendIndex !== -1) {
          text = args.slice(1, appendIndex).join(" ").replace(/^["']|["']$/g, '');
          redirectArg = args[appendIndex + 1] || "";
          append = true;
        } else {
          output = args.slice(1).join(" ").replace(/^["']|["']$/g, '');
        }

        if (redirectArg) {
          const dir = getDirNode(cwd);
          if (!dir) throw new Error("Cannot find current directory");
          
          let existingContent = "";
          const targetNode = dir[redirectArg];
          if (targetNode && targetNode.type === "codex") {
             existingContent = targetNode.content || "";
          }

          const nextVfs = traverseAndSet(cwd, {
            name: redirectArg, 
            type: "codex", 
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
        if (dir[target].type !== "codex") throw new Error(`cat: ${target}: Is a directory`);
        output = dir[target].content || "";
      }
      else if (cmd === "rm") {
        const isRecursive = args.includes("-r") || args.includes("-rf");
        const target = args.filter(a => !a.startsWith("-"))[1];
        if (!target) throw new Error("rm: missing operand");
        
        const currentVfs = JSON.parse(JSON.stringify(vfs));
        const dir = getDirNode(cwd, currentVfs);
        if (!dir || !dir[target]) throw new Error(`rm: cannot remove '${target}': No such file or directory`);
        
        if (dir[target].type === "sanctum" && !isRecursive) {
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

    setHistory(prev => [...prev, { command: input, output, isError, cwd: [...cwd] }]);
  };

  const appendSystemLog = useCallback((msg: string) => {
    setHistory(prev => [...prev, { command: "", output: msg, isError: false }]);
  }, []);

  const checkStepCompletion = (stepId: string): boolean => {
    // Basic dynamic evaluator!
    const homeStudent = getDirNode(["home", "student"]);
    
    if (stepId === "01-the-first-sanctum") {
       const lastCmd = history[history.length - 1];
       return !!(
        homeStudent &&
        homeStudent["house"] &&
        homeStudent["house"].type === "sanctum" &&
        lastCmd?.command.trim() === "mkdir house"
       );
    }
    if (stepId === "02-the-codex") {
       const lastCmd = history[history.length - 1];
       return cwd.join("/") === "home/student/house" && lastCmd?.command.trim() === "cd house";
    }
    if (stepId === "03-sight") {
      // Just requiring them to have run `ls` inside `house` recently.
      const lastCmd = history[history.length - 1];
      return cwd.join("/") === "home/student/house" && (lastCmd?.command.startsWith("ls") ?? false);
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
