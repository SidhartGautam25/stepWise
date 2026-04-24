import React from "react";
import { useAethera, VfsNode } from "../../contexts/AetheraContext";

export function VisualWorld() {
  const { vfs, cwd } = useAethera();

  const getCwdNode = (): Record<string, VfsNode> => {
    let dir = vfs;
    for (const p of cwd) {
      if (dir[p] && dir[p].children) {
        dir = dir[p].children!;
      } else {
        return {};
      }
    }
    return dir;
  };

  const currentContents = getCwdNode();
  const rootDirectories = Object.values(vfs).filter((node) => node.type === "directory");

  const permLabel = (permissions: string) => {
    const owner  = permissions[0] ?? "-";
    const group  = permissions[1] ?? "-";
    const others = permissions[2] ?? "-";
    return `owner:${owner}  group:${group}  others:${others}`;
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden",
      background: "linear-gradient(180deg, rgba(8,8,24,0.98), rgba(10,10,22,0.95))",
      borderRadius: 8,
      border: "1px solid var(--color-border-glass)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        flexShrink: 0,
        flexWrap: "wrap",
        gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
            Filesystem Visualizer
          </div>
          <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 2 }}>
            Green output = success · Red output = error
          </div>
        </div>
        <div style={{
          background: "var(--color-indigo-muted)",
          padding: "5px 11px",
          borderRadius: 6,
          color: "var(--color-indigo-light)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 700,
          border: "1px solid var(--color-border-glass)",
          flexShrink: 0,
        }}>
          /{cwd.join("/")}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: "auto",
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        gap: 0,
      }}>
        {/* Left: Root directory tree */}
        <div style={{
          borderRight: "1px solid rgba(255,255,255,0.07)",
          padding: "14px 12px",
          overflowY: "auto",
        }}>
          <div style={{ fontSize: 10, color: "var(--color-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>
            Root /
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rootDirectories.map((node) => {
              const isActive = cwd[0] === node.name;
              return (
                <div key={node.name} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  borderRadius: 6,
                  background: isActive ? "rgba(16, 185, 129, 0.12)" : "rgba(255,255,255,0.03)",
                  border: isActive ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255,255,255,0.06)",
                  cursor: "default",
                }}>
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: 5,
                    background: isActive ? "rgba(16,185,129,0.18)" : "rgba(99,102,241,0.14)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 11,
                    fontWeight: 900,
                    color: isActive ? "var(--color-emerald)" : "var(--color-indigo-light)",
                    flexShrink: 0,
                  }}>
                    📁
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: isActive ? "var(--color-emerald)" : "var(--color-text)", fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {node.name}
                    </div>
                    <div style={{ color: "var(--color-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}>
                      {node.permissions}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Current directory contents */}
        <div style={{ padding: "14px 14px", overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "var(--color-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>
            Contents of /{cwd.join("/")}
          </div>

          {Object.keys(currentContents).length === 0 && (
            <div style={{
              color: "var(--color-muted)",
              fontStyle: "italic",
              fontSize: 13,
              textAlign: "center",
              padding: "40px 0",
              border: "1px dashed rgba(255,255,255,0.12)",
              borderRadius: 8,
            }}>
              Empty directory. Create files or directories to see them here.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
            {Object.values(currentContents).map((node) => {
              const isDir = node.type === "directory";
              return (
                <div key={node.name} style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "12px 14px",
                  background: isDir ? "rgba(8, 145, 178, 0.1)" : "rgba(245, 158, 11, 0.08)",
                  borderRadius: 8,
                  border: isDir ? "1px solid rgba(6,182,212,0.22)" : "1px solid rgba(251,191,36,0.2)",
                  minHeight: 120,
                  cursor: "default",
                  transition: "border-color 0.2s, background 0.2s",
                }}>
                  {/* Icon + permissions row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 7,
                      background: "rgba(255,255,255,0.06)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 18,
                    }}>
                      {isDir ? "📁" : "📄"}
                    </div>
                    <div style={{ fontSize: 10, color: isDir ? "var(--color-cyan)" : "var(--color-amber)", fontFamily: "var(--font-mono)", fontWeight: 700, textAlign: "right" }}>
                      {node.permissions}
                    </div>
                  </div>

                  {/* Name */}
                  <div style={{ fontWeight: 800, color: "var(--color-text)", fontSize: 13, overflowWrap: "anywhere", lineHeight: 1.3 }}>
                    {node.name}
                  </div>

                  {/* Type + owner */}
                  <div style={{ fontSize: 10, color: "var(--color-muted)", marginTop: 4 }}>
                    {isDir ? "Directory" : "File"} · {node.owner}
                  </div>

                  {/* Permissions breakdown */}
                  <div style={{ fontSize: 9, color: "var(--color-muted)", marginTop: "auto", paddingTop: 10, fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>
                    {permLabel(node.permissions)}
                  </div>

                  {/* File content preview */}
                  {node.type === "file" && node.content && (
                    <div style={{ fontSize: 10, color: "var(--color-amber)", marginTop: 4, fontFamily: "var(--font-mono)", fontStyle: "italic" }}>
                      "{node.content.trim().slice(0, 28)}{node.content.trim().length > 28 ? "…" : ""}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
