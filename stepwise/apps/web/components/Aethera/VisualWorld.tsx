import React, { useState } from "react";
import { useAethera, VfsNode } from "../../contexts/AetheraContext";

// ── Styles ───────────────────────────────────────────────────────────────────

const card = (bg: string, border: string, opacity = 1): React.CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  padding: "12px 14px",
  background: bg,
  borderRadius: 8,
  border: `1px solid ${border}`,
  minHeight: 100,
  cursor: "default",
  opacity,
  transition: "border-color 0.2s, opacity 0.2s",
  position: "relative",
});

// ── Component ─────────────────────────────────────────────────────────────────

export function VisualWorld() {
  const { vfs, cwd, questMode, gitInited } = useAethera();
  const isGit = questMode === "git";
  const [expandedGit, setExpandedGit] = useState(false);

  const getCwdContents = (): Record<string, VfsNode> => {
    let dir = vfs;
    for (const p of cwd) {
      if (dir[p]?.children) dir = dir[p].children!;
      else return {};
    }
    return dir;
  };

  const currentContents = getCwdContents();
  const rootDirectories = Object.values(vfs).filter((n) => n.type === "directory");

  const permLabel = (p: string) => {
    const r = (v: string) => (v === "7" || v === "6" || v === "5" || v === "4" ? "r" : "-");
    const w = (v: string) => (v === "7" || v === "6" || v === "3" || v === "2" ? "w" : "-");
    const x = (v: string) => (v === "7" || v === "5" || v === "3" || v === "1" ? "x" : "-");
    const fmt = (v: string) => `${r(v)}${w(v)}${x(v)}`;
    return `${fmt(p[0] ?? "0")}${fmt(p[1] ?? "0")}${fmt(p[2] ?? "0")}`;
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden",
      background: "linear-gradient(180deg, var(--aethera-panel-top), var(--aethera-panel-bottom))",
      borderRadius: 8,
      border: "1px solid var(--aethera-panel-border)",
      boxShadow: "0 16px 36px var(--aethera-panel-shadow)",
    }}>

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 16px", borderBottom: "1px solid var(--aethera-divider)",
        flexShrink: 0, flexWrap: "wrap", gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
            {isGit ? "📁 Your Project Folder" : "Filesystem Visualizer"}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 2 }}>
            {isGit
              ? "Changes appear here as you run commands"
              : "Green output = success · Red output = error"}
          </div>
        </div>
        <div style={{
          background: "var(--color-indigo-muted)", padding: "5px 11px", borderRadius: 6,
          color: "var(--color-indigo-light)", fontFamily: "var(--font-mono)",
          fontSize: 12, fontWeight: 700, border: "1px solid var(--color-border-glass)", flexShrink: 0,
        }}>
          /{cwd.join("/")}
        </div>
      </div>

      {/* Body */}
      <div style={{
        flex: 1, overflow: "auto",
        display: "grid",
        gridTemplateColumns: isGit ? "1fr" : "180px 1fr",
        gap: 0,
      }}>

        {/* Left: Root tree (Linux only) */}
        {!isGit && (
          <div style={{ borderRight: "1px solid var(--aethera-divider)", padding: "14px 12px", overflowY: "auto" }}>
            <div style={{ fontSize: 10, color: "var(--color-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>Root /</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {rootDirectories.map((node) => {
                const isActive = cwd[0] === node.name;
                return (
                  <div key={node.name} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                    borderRadius: 6,
                    background: isActive ? "rgba(16, 185, 129, 0.12)" : "var(--aethera-card-bg)",
                    border: isActive ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--aethera-card-border)",
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 5, fontSize: 11, fontWeight: 900,
                      background: isActive ? "rgba(16,185,129,0.18)" : "var(--color-indigo-muted)",
                      display: "grid", placeItems: "center",
                      color: isActive ? "var(--color-emerald)" : "var(--color-indigo-light)", flexShrink: 0,
                    }}>📁</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: isActive ? "var(--color-emerald)" : "var(--color-text)", fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.name}</div>
                      <div style={{ color: "var(--color-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}>{node.permissions}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Right / Main: Current directory contents */}
        <div style={{ padding: "14px 14px", overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "var(--color-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>
            Contents of /{cwd.join("/")}
          </div>

          {/* Git: .git hidden folder tile */}
          {isGit && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-muted)", marginBottom: 8, letterSpacing: "0.06em" }}>
                HIDDEN FILES {gitInited ? "" : "(run git init to create)"}
              </div>
              <div
                onClick={() => gitInited && setExpandedGit(v => !v)}
                style={{
                  ...card(
                    gitInited ? "rgba(99,102,241,0.08)" : "rgba(100,116,139,0.04)",
                    gitInited ? "rgba(99,102,241,0.3)" : "rgba(100,116,139,0.15)",
                    gitInited ? 1 : 0.45,
                  ),
                  cursor: gitInited ? "pointer" : "not-allowed",
                  flexDirection: "row", alignItems: "center", gap: 12,
                  padding: "10px 14px", minHeight: "auto",
                }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 7, flexShrink: 0,
                  background: gitInited ? "rgba(99,102,241,0.15)" : "rgba(100,116,139,0.1)",
                  display: "grid", placeItems: "center", fontSize: 16,
                }}>
                  🗄️
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: gitInited ? "var(--color-indigo-light)" : "var(--color-muted)" }}>
                      .git
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                      background: "rgba(100,116,139,0.15)", color: "var(--color-muted)",
                      letterSpacing: "0.05em", textTransform: "uppercase",
                    }}>hidden</span>
                    {gitInited && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                        background: "rgba(99,102,241,0.15)", color: "var(--color-indigo-light)",
                        letterSpacing: "0.05em", textTransform: "uppercase",
                      }}>git</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 2, lineHeight: 1.4 }}>
                    {gitInited ? "Your entire project history lives here" : "Not created yet — run git init"}
                  </div>
                </div>
                {gitInited && (
                  <div style={{ color: "var(--color-muted)", fontSize: 11, flexShrink: 0 }}>
                    {expandedGit ? "▲ hide" : "▼ peek"}
                  </div>
                )}
              </div>

              {/* .git breakdown */}
              {gitInited && expandedGit && (
                <div style={{
                  marginTop: 6, padding: "12px 14px", borderRadius: 8,
                  background: "rgba(99,102,241,0.04)", border: "1px dashed rgba(99,102,241,0.2)",
                  display: "flex", flexDirection: "column", gap: 6,
                }}>
                  {[
                    { name: "HEAD", desc: "Which branch you're on right now" },
                    { name: "config", desc: "Settings for this repository" },
                    { name: "objects/", desc: "All your snapshots, stored as blobs" },
                    { name: "refs/", desc: "Branch pointers — labels for snapshots" },
                  ].map(f => (
                    <div key={f.name} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-indigo-light)", fontWeight: 700, minWidth: 80 }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{f.desc}</div>
                    </div>
                  ))}
                  <div style={{ marginTop: 4, fontSize: 10, color: "var(--color-muted)", fontStyle: "italic" }}>
                    ⚠️ Never edit these files manually — Git manages them.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Regular files / dirs */}
          {isGit && (
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-muted)", marginBottom: 8, letterSpacing: "0.06em" }}>
              YOUR FILES
            </div>
          )}

          {Object.keys(currentContents).length === 0 && !isGit && (
            <div style={{
              color: "var(--color-muted)", fontStyle: "italic", fontSize: 13,
              textAlign: "center", padding: "40px 0",
              border: "1px dashed var(--aethera-card-border)", borderRadius: 8,
            }}>
              Empty directory. Create files or directories to see them here.
            </div>
          )}

          {Object.keys(currentContents).length === 0 && isGit && (
            <div style={{
              color: "var(--color-muted)", fontStyle: "italic", fontSize: 12,
              textAlign: "center", padding: "24px 0",
              border: "1px dashed var(--aethera-card-border)", borderRadius: 8,
            }}>
              No files yet — create one with<br />
              <code style={{ color: "var(--color-indigo-light)", fontFamily: "var(--font-mono)" }}>echo "text" &gt; filename.md</code>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {Object.values(currentContents).map((node) => {
              const isDir = node.type === "directory";
              const isGitTracked = isGit && gitInited;
              return (
                <div key={node.name} style={card(
                  isDir ? "var(--color-cyan-muted)" : "var(--color-amber-muted)",
                  isDir ? "rgba(6,182,212,0.22)" : "rgba(251,191,36,0.2)",
                )}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 7,
                      background: "var(--aethera-card-bg)",
                      display: "grid", placeItems: "center", fontSize: 16,
                    }}>
                      {isDir ? "📁" : "📄"}
                    </div>
                    {isGitTracked && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 4,
                        background: "rgba(34,197,94,0.12)", color: "var(--color-emerald)",
                        letterSpacing: "0.04em", textTransform: "uppercase",
                      }}>tracked</span>
                    )}
                    {!isGit && (
                      <div style={{ fontSize: 10, color: isDir ? "var(--color-cyan)" : "var(--color-amber)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {node.permissions}
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 800, color: "var(--color-text)", fontSize: 12, overflowWrap: "anywhere", lineHeight: 1.3 }}>
                    {node.name}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-muted)", marginTop: 4 }}>
                    {isDir ? "Directory" : "File"} · {isGit ? "" : node.owner}
                    {!isGit && ` · ${permLabel(node.permissions)}`}
                  </div>
                  {node.type === "file" && node.content && (
                    <div style={{ fontSize: 10, color: isGit ? "var(--color-emerald)" : "var(--color-amber)", marginTop: 6, fontFamily: "var(--font-mono)", fontStyle: "italic", lineHeight: 1.4 }}>
                      "{node.content.trim().slice(0, 32)}{node.content.trim().length > 32 ? "…" : ""}"
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
