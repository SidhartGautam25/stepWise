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

  const powerLabel = (permissions: string) => {
    const owner = permissions[0] ?? "-";
    const group = permissions[1] ?? "-";
    const others = permissions[2] ?? "-";
    return `Owner ${owner} | Kin ${group} | Others ${others}`;
  };

  return (
    <div style={{
      background: "linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(17, 24, 39, 0.92))",
      border: "1px solid var(--color-border)",
      borderRadius: 8,
      padding: 28,
      marginBottom: 32,
      minHeight: 560,
      color: "var(--color-text)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: 16, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text)", display: "flex", alignItems: "center", gap: 12 }}>
            Filesystem Visualizer
          </h3>
          <p style={{ color: "var(--color-muted)", fontSize: 14, marginTop: 4 }}>
            Top right shows your current directory. Green output means success; red output means the command failed.
          </p>
        </div>
        <div style={{
          background: "rgba(99, 102, 241, 0.16)",
          padding: "6px 12px",
          borderRadius: 6,
          color: "var(--color-badge)",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          fontWeight: 600,
          border: "1px solid rgba(99, 102, 241, 0.28)"
        }}>
          Focus: /{cwd.join("/")}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 0.8fr) minmax(320px, 1.6fr)", gap: 24 }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: 16, background: "rgba(2, 6, 23, 0.45)" }}>
          <div style={{ fontSize: 12, color: "var(--color-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 14 }}>
            Root Directories
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {rootDirectories.map((node) => (
              <div key={node.name} style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr",
                gap: 10,
                alignItems: "center",
                padding: 10,
                borderRadius: 6,
                background: cwd[0] === node.name ? "rgba(16, 185, 129, 0.14)" : "rgba(255,255,255,0.05)",
                border: cwd[0] === node.name ? "1px solid rgba(16, 185, 129, 0.35)" : "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(99,102,241,0.18)", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 900 }}>
                  D
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "var(--color-text)", fontSize: 13, fontWeight: 700 }}>{node.name}</div>
                  <div style={{ color: "var(--color-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>{node.permissions}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, color: "var(--color-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 14 }}>
            Current Directory Contents
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
            {Object.keys(currentContents).length === 0 && (
              <div style={{ color: "var(--color-muted)", fontStyle: "italic", fontSize: 14, gridColumn: "1 / -1", textAlign: "center", padding: "56px 0", border: "1px dashed rgba(255,255,255,0.16)", borderRadius: 8 }}>
                This directory is empty. Create a directory or file to see it here.
              </div>
            )}
            {Object.values(currentContents).map((node) => (
              <div key={node.name} style={{
                display: "flex",
                flexDirection: "column",
                minHeight: 150,
                padding: 16,
                background: node.type === "directory" ? "rgba(15, 118, 110, 0.14)" : "rgba(180, 83, 9, 0.14)",
                borderRadius: 8,
                border: node.type === "directory" ? "1px solid rgba(45, 212, 191, 0.26)" : "1px solid rgba(251, 191, 36, 0.26)",
                transition: "all 0.2s",
                cursor: "default"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 8, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.08)", color: "var(--color-text)", fontWeight: 900 }}>
                    {node.type === "directory" ? "D" : "F"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-emerald)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    {node.permissions}
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: "var(--color-text)", fontSize: 15, overflowWrap: "anywhere" }}>
                  {node.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 6 }}>
                  {node.type === "directory" ? "Directory" : "File"} owned by {node.owner}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: "auto", paddingTop: 14, fontFamily: "var(--font-mono)" }}>
                  {powerLabel(node.permissions)}
                </div>
                {node.type === "file" && (
                  <div style={{ fontSize: 11, color: "var(--color-emerald)", marginTop: 6, fontWeight: 600 }}>
                    Content: {node.content ? node.content.trim().slice(0, 32) || "(empty)" : "(empty)"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
