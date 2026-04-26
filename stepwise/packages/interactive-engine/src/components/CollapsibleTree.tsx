"use client";

import { useState } from "react";
import { IllustrationShell } from "./IllustrationShell";
import { T } from "../tokens";

export interface TreeNode {
  name: string;
  type: "folder" | "file";
  children?: TreeNode[];
}

export interface CollapsibleTreeProps {
  tree: TreeNode;
  hint?: string;
  /** Indentation in px per level, default 18 */
  indent?: number;
  /** Footer tip text */
  tip?: string;
}

/**
 * CollapsibleTree — a recursively rendered, clickable folder/file tree.
 * Folders expand/collapse on click. Files are non-interactive by default.
 *
 * Usage:
 * ```tsx
 * <CollapsibleTree
 *   hint="Click folders to expand them"
 *   tree={STORAGE_FOLDER_TREE}
 *   tip="📁 = Folder | 📄 = File"
 * />
 * ```
 */
export function CollapsibleTree({ tree, hint, indent = 18, tip }: CollapsibleTreeProps) {
  return (
    <IllustrationShell hint={hint} gap={10}>
      <TreeNodeRenderer node={tree} depth={0} indent={indent} />
      {tip && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 9,
            background: T.pillBg,
            border: `1px solid ${T.pillBorder}`,
            fontSize: 11,
            color: T.pillText,
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          {tip}
        </div>
      )}
    </IllustrationShell>
  );
}

function TreeNodeRenderer({
  node,
  depth,
  indent,
}: {
  node: TreeNode;
  depth: number;
  indent: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const isFolder = node.type === "folder";
  const hasChildren = isFolder && node.children && node.children.length > 0;

  const icon = isFolder ? (expanded ? "📂" : "📁") : "📄";
  const bg = isFolder ? T.cyanAlpha(0.1) : T.amberAlpha(0.08);
  const border = isFolder ? T.cyanAlpha(0.2) : T.amberAlpha(0.18);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div
        onClick={() => isFolder && setExpanded((e) => !e)}
        style={{
          cursor: isFolder ? "pointer" : "default",
          marginLeft: depth * indent,
          padding: "9px 12px",
          borderRadius: 8,
          background: expanded && isFolder ? T.indigoAlpha(0.1) : bg,
          border: `${expanded && isFolder ? 2 : 1}px solid ${expanded && isFolder ? T.indigoAlpha(0.3) : border}`,
          fontSize: 13,
          fontWeight: 600,
          color: T.text,
          display: "flex",
          alignItems: "center",
          gap: 8,
          transition: "all 0.2s",
        }}
      >
        <span>{icon}</span>
        <span style={{ flex: 1 }}>{node.name}</span>
        {hasChildren && (
          <span style={{ fontSize: 11, color: T.muted }}>{expanded ? "▲" : "▼"}</span>
        )}
      </div>
      {expanded && hasChildren &&
        node.children!.map((child) => (
          <div key={child.name} style={{ animation: "ie-slide-in 0.2s ease" }}>
            <TreeNodeRenderer node={child} depth={depth + 1} indent={indent} />
          </div>
        ))}
    </div>
  );
}
