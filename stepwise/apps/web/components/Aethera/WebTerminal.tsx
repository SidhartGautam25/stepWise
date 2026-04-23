import React, { useState, useRef, useEffect } from "react";
import { useAethera } from "../../contexts/AetheraContext";

const STEP_GUIDANCE: Record<string, string[]> = {
  "00-orientation": [
    "[SYSTEM] Step 0: How to read this screen.",
    "The top right of the visualizer always shows your current directory.",
    "Each tile is a directory or file. It shows the name, owner, permissions, and file content when available.",
    "Green terminal output means the command worked. Red output means Linux rejected the command.",
    "Type: continue",
  ],
  "01-directories": [
    "[SYSTEM] Step 1: Directories and listing.",
    "Run these commands in order: pwd, ls, mkdir projects, ls",
    "pwd prints where you are. ls lists what is here. mkdir creates a new directory.",
  ],
  "02-navigation": [
    "[SYSTEM] Step 2: Moving between directories.",
    "Practice using the directory you created earlier.",
    "Run these commands: cd projects, pwd, cd .., cd projects",
    "cd moves your current directory. cd .. moves one level up.",
  ],
  "03-files-and-listing": [
    "[SYSTEM] Step 3: Files, content, and listing.",
    "Stay inside /home/student/projects.",
    "Run these commands: touch notes.txt, echo hello linux > notes.txt, ls, cat notes.txt",
    "touch creates a file. echo writes text. cat prints file content.",
  ],
};

export function WebTerminal({ activeStepId, activeStepTitle }: { activeStepId?: string; activeStepTitle?: string }) {
  const { cwd, history, execute, appendSystemLog } = useAethera();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const announcedStepRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    if (!activeStepId || announcedStepRef.current === activeStepId) return;
    announcedStepRef.current = activeStepId;

    const messages = STEP_GUIDANCE[activeStepId] ?? [
      `[SYSTEM] Quest Goal: ${activeStepTitle ?? "Continue the lesson."}`,
      "Read the prompt, then enter the required command.",
    ];

    messages.forEach(appendSystemLog);
  }, [activeStepId, activeStepTitle, appendSystemLog]);

  const handleRun = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      execute(input);
      setInput("");
    }
  };

  return (
    <div style={{
      background: "var(--color-terminal-bg)",
      borderRadius: 8,
      border: "1px solid var(--color-border-glass)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      minHeight: 520,
      fontFamily: "var(--font-mono)",
      fontSize: 14,
      color: "var(--color-text)"
    }}>
      <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 16px", borderBottom: "1px solid var(--color-border-glass)", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981" }} />
        <span style={{ marginLeft: 12, fontSize: 13, color: "var(--color-muted)", fontWeight: 600, letterSpacing: "0.05em" }}>Linux Practice Terminal</span>
      </div>
      
      <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto" }}>
        {history.map((log, idx) => {
          if (!log.command && log.output.startsWith("[SYSTEM]")) {
             return (
               <div key={idx} style={{ marginBottom: 12, color: "var(--color-indigo)", fontWeight: 700, fontSize: 13, background: "rgba(99, 102, 241, 0.1)", padding: "8px 12px", borderLeft: "2px solid var(--color-indigo)", borderRadius: 4 }}>
                 {log.output}
               </div>
             );
          }
          if (!log.command) {
             return (
               <div key={idx} style={{ marginBottom: 10, color: "var(--color-muted)", fontSize: 13, lineHeight: 1.5 }}>
                 # {log.output}
               </div>
             );
          }

          return (
            <div key={idx} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ color: "var(--color-emerald)", fontWeight: 600 }}>student@linux</span>
                <span style={{ color: "var(--color-muted)" }}>:</span>
                <span style={{ color: "var(--color-indigo)", fontWeight: 600 }}>/{(log.cwd ?? cwd).join("/")}</span>
                <span style={{ color: "var(--color-muted)" }}>$</span>
                <span style={{ marginLeft: 8 }}>{log.command}</span>
              </div>
              {log.output && (
                <div style={{ color: log.isError ? "#ef4444" : "#10b981", marginTop: 4, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                  {log.output}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ color: "var(--color-emerald)", fontWeight: 600 }}>student@linux</span>
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
