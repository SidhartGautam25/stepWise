"use client";

import { useState } from "react";
import { IllustrationShell } from "./IllustrationShell";
import { T } from "../tokens";

export interface FileSystemTree {
  [key: string]: FileSystemTree | null;
}

export interface FileNavigatorProps {
  /** Nested record: keys are names, value null = file, object = folder */
  tree: FileSystemTree;
  hint?: string;
  rootLabel?: string;
  tip?: string;
}

/**
 * FileNavigator — a clickable breadcrumb file navigator.
 * Click folders to enter, click breadcrumbs to go back.
 * Files are non-navigable.
 *
 * Usage:
 * ```tsx
 * <FileNavigator
 *   hint="Navigate your home folder"
 *   tree={HOME_FOLDER_TREE}
 *   rootLabel="🏠 home/student"
 *   tip="This is exactly how Linux works!"
 * />
 * ```
 */
export function FileNavigator({
  tree,
  hint,
  rootLabel = "🏠 home",
  tip,
}: FileNavigatorProps) {
  const [path, setPath] = useState<string[]>([]);

  const current = path.reduce<FileSystemTree>((node, seg) => {
    const child = node[seg];
    return child && typeof child === "object" ? (child as FileSystemTree) : {};
  }, tree);

  const isFile = (name: string) => current[name] === null;

  return (
    <IllustrationShell hint={hint} gap={10}>
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 12,
          fontWeight: 600,
          flexWrap: "wrap",
        }}
      >
        <span
          onClick={() => setPath([])}
          style={{
            cursor: "pointer",
            color: T.emerald,
            textDecoration: "underline",
          }}
        >
          {rootLabel}
        </span>
        {path.map((seg, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: T.muted }}>/</span>
            <span
              onClick={() => setPath((p) => p.slice(0, i + 1))}
              style={{
                cursor: "pointer",
                color: T.emerald,
                textDecoration: "underline",
              }}
            >
              {seg}
            </span>
          </span>
        ))}
      </div>

      {/* Directory listing */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {path.length > 0 && (
          <div
            onClick={() => setPath((p) => p.slice(0, -1))}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: T.slateAlpha(0.08),
              border: `1px solid ${T.slateAlpha(0.2)}`,
              fontSize: 12,
              fontWeight: 600,
              color: T.muted,
              cursor: "pointer",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span>↩</span>
            <span>.. (go back)</span>
          </div>
        )}

        {Object.keys(current).map((name) => (
          <div
            key={name}
            onClick={() => {
              if (!isFile(name)) setPath((p) => [...p, name]);
            }}
            style={{
              padding: "9px 12px",
              borderRadius: 9,
              background: isFile(name) ? T.amberAlpha(0.08) : T.cyanAlpha(0.1),
              border: `1px solid ${isFile(name) ? T.amberAlpha(0.2) : T.cyanAlpha(0.2)}`,
              fontSize: 13,
              fontWeight: 600,
              color: T.text,
              cursor: isFile(name) ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
              animation: "ie-pop-in 0.25s ease",
            }}
          >
            <span>{isFile(name) ? "📄" : "📁"}</span>
            <span style={{ flex: 1 }}>{name}</span>
            {!isFile(name) && (
              <span style={{ fontSize: 11, color: T.muted }}>enter →</span>
            )}
          </div>
        ))}

        {Object.keys(current).length === 0 && (
          <div
            style={{
              padding: 16,
              textAlign: "center",
              color: T.muted,
              fontSize: 12,
              fontStyle: "italic",
            }}
          >
            This folder is empty
          </div>
        )}
      </div>

      {tip && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 9,
            background: T.emeraldAlpha(0.08),
            border: `1px solid ${T.emeraldAlpha(0.2)}`,
            fontSize: 11,
            color: T.body,
            textAlign: "center",
          }}
        >
          💡 {tip}
        </div>
      )}
    </IllustrationShell>
  );
}
