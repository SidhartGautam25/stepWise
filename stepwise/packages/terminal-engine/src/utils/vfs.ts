import type { VfsNode } from "../types";

export function resolvePath(cwd: string[], pathStr: string): string[] {
  if (!pathStr || pathStr === ".") return cwd;
  const parts = pathStr.split("/").filter(Boolean);
  const start = pathStr.startsWith("/") ? [] : [...cwd];

  for (const p of parts) {
    if (p === "..") start.pop();
    else if (p !== ".") start.push(p);
  }
  return start;
}

export function getDirNode(cwd: string[], path: string[], vfs: Record<string, VfsNode>): Record<string, VfsNode> | null {
  const resolved = resolvePath(cwd, path.join("/"));
  let currentDir = vfs;
  for (const p of resolved) {
    const next = currentDir[p];
    if (!next || next.type !== "directory" || !next.children) return null;
    currentDir = next.children;
  }
  return currentDir;
}

export function traverseAndSet(path: string[], newNode: VfsNode, oldVfs: Record<string, VfsNode>): Record<string, VfsNode> {
  const newVfs = JSON.parse(JSON.stringify(oldVfs));
  let dir = newVfs;
  for (const p of path) {
    if (!dir[p]) throw new Error("Path not found");
    dir = dir[p].children;
  }
  dir[newNode.name] = newNode;
  return newVfs;
}

export function traverseAndDelete(path: string[], target: string, oldVfs: Record<string, VfsNode>): Record<string, VfsNode> {
  const newVfs = JSON.parse(JSON.stringify(oldVfs));
  let dir = newVfs;
  for (const p of path) {
    if (!dir[p]) throw new Error("Path not found");
    dir = dir[p].children;
  }
  delete dir[target];
  return newVfs;
}
