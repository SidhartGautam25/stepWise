import React, { useState, useRef, useEffect } from "react";
import { useAethera } from "../../contexts/AetheraContext";

export function WebTerminal({ activeStepTitle }: { activeStepTitle?: string }) {
  const { cwd, history, execute, appendSystemLog } = useAethera();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    if (activeStepTitle) {
      appendSystemLog(`[SYSTEM] Quest Goal: ${activeStepTitle}`);
      appendSystemLog(`Aethera Spirit awaits your spell...`);
    }
  }, [activeStepTitle]);

  const handleRun = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      execute(input);
      setInput("");
    }
  };

  const getPromptString = () => {
    const p = cwd.join("/");
    return `guide@aethera:/${p}$ `;
  };

  return (
    <div style={{
      background: "var(--color-terminal-bg)",
      borderRadius: 12,
      border: "1px solid var(--color-border-glass)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: 400,
      fontFamily: "var(--font-mono)",
      fontSize: 14,
      color: "var(--color-text)"
    }}>
      <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 16px", borderBottom: "1px solid var(--color-border-glass)", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981" }} />
        <span style={{ marginLeft: 12, fontSize: 13, color: "var(--color-muted)", fontWeight: 600, letterSpacing: "0.05em" }}>Aethera Bound Spirit</span>
      </div>
      
      <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto" }}>
        {history.map((log, idx) => {
          if (!log.command && log.output.startsWith("[SYSTEM]")) {
             return (
               <div key={idx} style={{ marginBottom: 12, color: "var(--color-indigo)", fontWeight: 600, fontSize: 13, background: "rgba(99, 102, 241, 0.1)", padding: "8px 12px", borderLeft: "2px solid var(--color-indigo)", borderRadius: 4 }}>
                 {log.output}
               </div>
             );
          }
          if (!log.command) {
             return (
               <div key={idx} style={{ marginBottom: 12, color: "var(--color-muted)", fontSize: 13, fontStyle: "italic" }}>
                 {log.output}
               </div>
             );
          }

          return (
            <div key={idx} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "var(--color-emerald)", fontWeight: 600 }}>guide@aethera</span>
                <span style={{ color: "var(--color-muted)" }}>:</span>
                <span style={{ color: "var(--color-indigo)", fontWeight: 600 }}>~{log.command.includes("cd") ? "" : `/${cwd.join("/")}`}</span>
                <span style={{ color: "var(--color-muted)" }}>$</span>
                <span style={{ marginLeft: 8 }}>{log.command}</span>
              </div>
              {log.output && (
                <div style={{ color: log.isError ? "#ef4444" : "var(--color-text)", marginTop: 4, whiteSpace: "pre-wrap" }}>
                  {log.output}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ color: "var(--color-emerald)", fontWeight: 600 }}>guide@aethera</span>
          <span style={{ color: "var(--color-muted)", margin: "0 4px" }}>:</span>
          <span style={{ color: "var(--color-indigo)", fontWeight: 600 }}>/{cwd.join("/")}</span>
          <span style={{ color: "var(--color-muted)", margin: "0 8px 0 4px" }}>$</span>
          
          <input 
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleRun}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--color-text)",
              fontFamily: "var(--font-mono)",
              fontSize: 14
            }}
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
