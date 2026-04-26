import React, { useState, useRef, useEffect, MutableRefObject } from "react";
import { useAethera } from "../../contexts/AetheraContext";

const STEP_GUIDANCE: Record<string, string[]> = {
  "00-welcome": [
    "[SYSTEM] Step 0: Start with the interactive lesson on the left.",
    "Use the Next button in the visual panel to move through the Linux introduction.",
    "You do not need to type anything in the terminal for this step.",
  ],
  "00-why-os": [
    "[SYSTEM] Step 1: Continue with the interactive operating systems lesson.",
    "Use the Next button in the visual panel to understand hardware, storage, and why files and directories exist.",
    "You do not need to type anything in the terminal for this step either.",
  ],
  "00-orientation": [
    "[SYSTEM] Step 0: How to read this screen.",
    "The visualizer on the left always shows your current directory and its contents.",
    "Each tile is a directory or file — showing name, owner, permissions, and content.",
    "Green terminal output means the command worked. Red means Linux rejected it.",
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
  // ── git-aethera ────────────────────────────────────────────────────────────
  "01-init": [
    "[SYSTEM] Git Step 1: Turn a folder into a repository.",
    "Run: mkdir todo-app && cd todo-app",
    "Run: git init",
    "Run: ls -la   → look for the .git folder Git created",
  ],
  "02-first-commit": [
    "[SYSTEM] Git Step 2: Take your first snapshot.",
    "Run: echo \"# Kavya's Todo App\" > README.md",
    "Run: git status   → file is 'untracked' (Git sees it but hasn't saved it)",
    "Run: git add README.md   → put it in the bag (staging)",
    "Run: git status   → notice it changed to 'Changes to be committed'",
    "Run: git commit -m \"Start Kavya's todo app\"   → take the snapshot!",
    "Run: git status   → 'nothing to commit' = snapshot saved",
  ],
  "03-history": [
    "[SYSTEM] Git Step 3: Build a history and explore it.",
    "Run: echo \"function addTask(text) {}\" > app.js && git add app.js && git commit -m \"Add addTask\"",
    "Run: echo \"function deleteTask(id) {}\" >> app.js && git add app.js && git commit -m \"Add deleteTask\"",
    "Run: git log --oneline   → your clean timeline!",
  ],
  "04-branch": [
    "[SYSTEM] Git Step 4: Create a branch for safe experiments.",
    "First set up: git init && echo '# Todo App' > README.md && git add . && git commit -m \"Working todo app\"",
    "Run: git checkout -b feature/darkmode",
    "Run: echo \"dark-mode=true\" >> README.md && git add . && git commit -m \"Experiment with dark mode\"",
    "Run: git branch   → see both branches",
    "Run: git checkout main && cat README.md   → experiment gone from view, but safe!",
    "Run: git checkout feature/darkmode && cat README.md   → the experiment is here",
  ],
};

interface WebTerminalProps {
  activeStepId?: string;
  activeStepTitle?: string;
  /** Mutable ref — ChallengeViewer assigns a focus() callback here */
  focusRef?: MutableRefObject<() => void>;
}

export function WebTerminal({ activeStepId, activeStepTitle, focusRef }: WebTerminalProps) {
  const { cwd, history, execute, appendSystemLog } = useAethera();
  const [input, setInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const announcedStepRef = useRef<string | undefined>(undefined);

  // Expose focus() to parent via ref
  useEffect(() => {
    if (focusRef) {
      focusRef.current = () => inputRef.current?.focus();
    }
  }, [focusRef]);

  // Auto-scroll terminal history to bottom on every new entry
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [history]);

  // Announce step guidance when step changes
  useEffect(() => {
    if (!activeStepId || announcedStepRef.current === activeStepId) return;
    announcedStepRef.current = activeStepId;

    const messages = STEP_GUIDANCE[activeStepId] ?? [
      `[SYSTEM] Quest Goal: ${activeStepTitle ?? "Continue the lesson."}`,
      "Read the prompt on the left, then enter the required command here.",
    ];

    messages.forEach(appendSystemLog);

    // Focus input whenever a new step starts
    window.setTimeout(() => inputRef.current?.focus(), 60);
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
      display: "flex",
      flexDirection: "column",
      height: "100%",
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      color: "var(--aethera-terminal-text)",
      overflow: "hidden",
      borderLeft: "1px solid var(--aethera-panel-border)",
    }}>
      {/* Terminal header bar */}
      <div style={{
        background: "var(--aethera-terminal-header)",
        padding: "10px 16px",
        borderBottom: "1px solid var(--aethera-divider)",
        display: "flex",
        alignItems: "center",
        gap: 7,
        flexShrink: 0,
      }}>
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ef4444" }} />
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#f59e0b" }} />
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#10b981" }} />
        <span style={{ marginLeft: 10, fontSize: 12, color: "var(--color-muted)", fontWeight: 600, letterSpacing: "0.05em" }}>
          Linux Practice Terminal
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
          /{cwd.join("/")}
        </span>
      </div>

      {/* History scroll area */}
      <div
        ref={scrollContainerRef}
        style={{ flex: 1, padding: "14px 18px", overflowY: "auto" }}
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((log, idx) => {
          if (!log.command && log.output.startsWith("[SYSTEM]")) {
            return (
              <div key={idx} style={{
                marginBottom: 10,
                color: "var(--color-indigo-light)",
                fontWeight: 700,
                fontSize: 12,
                background: "rgba(108, 99, 255, 0.1)",
                padding: "7px 12px",
                borderLeft: "2px solid var(--color-indigo)",
                borderRadius: "0 4px 4px 0",
              }}>
                {log.output.replace("[SYSTEM] ", "")}
              </div>
            );
          }

          if (!log.command) {
            return (
              <div key={idx} style={{ marginBottom: 8, color: "var(--color-muted)", fontSize: 12, lineHeight: 1.55 }}>
                # {log.output}
              </div>
            );
          }

          return (
            <div key={idx} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "baseline" }}>
                <span style={{ color: "var(--color-emerald)", fontWeight: 700, fontSize: 12 }}>student@linux</span>
                <span style={{ color: "var(--color-muted)", fontSize: 12 }}>:</span>
                <span style={{ color: "var(--color-indigo-light)", fontWeight: 600, fontSize: 12 }}>/{(log.cwd ?? cwd).join("/")}</span>
                <span style={{ color: "var(--color-muted)", fontSize: 12 }}>$</span>
                <span style={{ color: "var(--aethera-terminal-text)", fontSize: 13 }}>{log.command}</span>
              </div>
              {log.output && (
                <div style={{
                  color: log.isError ? "var(--aethera-terminal-error)" : "var(--aethera-terminal-success)",
                  marginTop: 3,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                  fontSize: 12,
                  paddingLeft: 2,
                }}>
                  {log.output}
                </div>
              )}
            </div>
          );
        })}

        {/* Active input line */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <span style={{ color: "var(--color-emerald)", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>student@linux</span>
          <span style={{ color: "var(--color-muted)", fontSize: 12, flexShrink: 0 }}>:</span>
          <span style={{ color: "var(--color-indigo-light)", fontWeight: 600, fontSize: 12, flexShrink: 0 }}>/{cwd.join("/")}</span>
          <span style={{ color: "var(--color-muted)", fontSize: 12, margin: "0 2px", flexShrink: 0 }}>$</span>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleRun}
            style={{
              flex: 1,
              minWidth: 0,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--aethera-terminal-text)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              caretColor: "var(--color-indigo)",
            }}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
          />
        </div>
      </div>
    </div>
  );
}
