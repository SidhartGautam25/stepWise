import React from "react";
import { useAethera, VfsNode } from "../../contexts/AetheraContext";

export function VisualWorld() {
  const { vfs, cwd } = useAethera();

  // Parse visually what's inside the current directory
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

  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 12,
      padding: 24,
      marginBottom: 32,
      minHeight: 250
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid var(--color-border)", paddingBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text)", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>✨</span> The Land of Aethera
          </h3>
          <p style={{ color: "var(--color-muted)", fontSize: 14, marginTop: 4 }}>
            Visualizing Sanctums & Codices in the veil.
          </p>
        </div>
        <div style={{ 
          background: "var(--color-indigo-muted)", 
          padding: "6px 12px", 
          borderRadius: 8, 
          color: "var(--color-badge)",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          fontWeight: 600,
          border: "1px solid var(--color-border-glass)"
        }}>
          Focus: /{cwd.join("/")}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 24 }}>
        {Object.keys(currentContents).length === 0 && (
          <div style={{ color: "var(--color-muted)", fontStyle: "italic", fontSize: 14, gridColumn: "1 / -1", textAlign: "center", padding: "40px 0" }}>
            The Veil is empty here. Use your Spells to forge something new.
          </div>
        )}
        {Object.values(currentContents).map((node, idx) => (
          <div key={idx} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 16,
            background: "var(--color-bg)",
            borderRadius: 12,
            border: "1px solid var(--color-border-strong)",
            transition: "all 0.2s",
            cursor: "default"
          }}
          className="card-hover"
          >
            <div style={{ fontSize: 42, marginBottom: 12 }}>
              {node.type === "sanctum" ? "🏰" : "📜"}
            </div>
            <div style={{ fontWeight: 600, color: "var(--color-text)", fontSize: 14, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", width: "100%", textAlign: "center" }}>
              {node.name}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: 8 }}>
              <div style={{ fontSize: 10, color: "var(--color-muted)", background: "var(--color-surface)", padding: "2px 6px", borderRadius: 4, border: "1px solid var(--color-border)" }}>
                {node.owner}
              </div>
              <div style={{ fontSize: 10, color: "var(--color-muted)", background: "var(--color-surface)", padding: "2px 6px", borderRadius: 4, border: "1px solid var(--color-border)" }}>
                {node.permissions}
              </div>
            </div>
            {node.type === "codex" && node.content && (
              <div style={{ fontSize: 10, color: "var(--color-emerald)", marginTop: 6, fontWeight: 500 }}>
                {node.content.length} runes written
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
