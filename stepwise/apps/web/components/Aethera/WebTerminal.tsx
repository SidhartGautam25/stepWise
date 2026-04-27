import React, { useState, useRef, useEffect, MutableRefObject } from "react";
import { useAethera } from "../../contexts/AetheraContext";

// ── Step guidance: system log (terminal history announcement) ─────────────────
const STEP_LOG: Record<string, string[]> = {
  // linux
  "00-orientation": [
    "[SYSTEM] How to read this screen.",
    "The visualizer shows your current directory and contents.",
    "Green = success · Red = error. Type: continue",
  ],
  "01-directories": [
    "[SYSTEM] Step 1: Directories and listing.",
    "Run in order: pwd, ls, mkdir projects, ls",
  ],
  "02-navigation": [
    "[SYSTEM] Step 2: Moving between directories.",
    "Run: cd projects, pwd, cd .., cd projects",
  ],
  "03-files-and-listing": [
    "[SYSTEM] Step 3: Files, content, listing.",
    "Run: touch notes.txt, echo hello linux > notes.txt, ls, cat notes.txt",
  ],
};

// ── Step command checklist for git terminal steps ─────────────────────────────
interface CheckItem { cmd: string; hint: string; }
const GIT_STEP_GUIDE: Record<string, { title: string; context: string; items: CheckItem[] }> = {
  "01-init": {
    title: "Turn Kavya's folder into a Git repository",
    context: "Kavya is ready. She has her todo-app code. Now she's going to tell Git to keep an eye on this folder — forever. One command does it.",
    items: [
      { cmd: "mkdir todo-app", hint: "Create the project folder" },
      { cmd: "cd todo-app", hint: "Go inside it" },
      { cmd: "git init", hint: "Tell Git: 'watch this folder'" },
      { cmd: "ls -la", hint: "See the hidden .git folder Git created" },
    ],
  },
  "02-first-commit": {
    title: "Take Kavya's first snapshot",
    context: "Kavya creates her first file, then goes through Git's 3 zones: Working → Staging → Committed. Each git status call shows her exactly where things are.",
    items: [
      { cmd: 'echo "# Kavya\'s Todo App" > README.md', hint: "Create the first file" },
      { cmd: "git status", hint: "See: README.md is untracked" },
      { cmd: "git add README.md", hint: "Stage it (pack it in the bag)" },
      { cmd: "git status", hint: "See: now says 'to be committed'" },
      { cmd: 'git commit -m "Start Kavya\'s todo app"', hint: "Take the snapshot!" },
      { cmd: "git status", hint: "See: nothing to commit — done ✓" },
    ],
  },
  "03-history": {
    title: "Build a history of snapshots",
    context: "Kavya adds two more features and commits each. Then she runs git log to see her clean timeline — no more mystery zip files.",
    items: [
      { cmd: 'echo "function addTask(text) {}" > app.js', hint: "Write a function" },
      { cmd: "git add app.js", hint: "Stage it" },
      { cmd: 'git commit -m "Add addTask"', hint: "Snapshot 2" },
      { cmd: 'echo "function deleteTask(id) {}" >> app.js', hint: "Add another function" },
      { cmd: "git add app.js", hint: "Stage it" },
      { cmd: 'git commit -m "Add deleteTask"', hint: "Snapshot 3" },
      { cmd: "git log --oneline", hint: "See the clean timeline!" },
    ],
  },
  "04-branch": {
    title: "Try dark mode — safely on a branch",
    context: "Kavya remembers the dark mode disaster. This time she creates a branch — a separate timeline — so her main code is never touched.",
    items: [
      { cmd: "git checkout -b feature/darkmode", hint: "Create + switch to new branch" },
      { cmd: 'echo "dark-mode=true" >> README.md', hint: "Add dark mode code" },
      { cmd: "git add .", hint: "Stage all changes" },
      { cmd: 'git commit -m "Experiment with dark mode"', hint: "Snapshot on the new branch" },
      { cmd: "git branch", hint: "See both branches" },
      { cmd: "git checkout main", hint: "Switch back to main" },
      { cmd: "cat README.md", hint: "Dark mode gone! But it's safe on the other branch" },
    ],
  },
};

interface WebTerminalProps {
  activeStepId?: string;
  activeStepTitle?: string;
  focusRef?: MutableRefObject<() => void>;
}

export function WebTerminal({ activeStepId, activeStepTitle, focusRef }: WebTerminalProps) {
  const { cwd, history, execute, appendSystemLog, questMode } = useAethera();
  const isGit = questMode === "git";
  const [input, setInput] = useState("");
  const [guideCollapsed, setGuideCollapsed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const announcedStepRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (focusRef) focusRef.current = () => inputRef.current?.focus();
  }, [focusRef]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (!activeStepId || announcedStepRef.current === activeStepId) return;
    announcedStepRef.current = activeStepId;
    setGuideCollapsed(false); // open guide on each new step

    const logMessages = STEP_LOG[activeStepId] ?? [];
    if (logMessages.length > 0) {
      logMessages.forEach(appendSystemLog);
    } else if (!isGit) {
      appendSystemLog(`[SYSTEM] Quest Goal: ${activeStepTitle ?? "Continue the lesson."}`);
      appendSystemLog("Read the prompt on the left, then enter the required command here.");
    }

    window.setTimeout(() => inputRef.current?.focus(), 60);
  }, [activeStepId, activeStepTitle, appendSystemLog, isGit]);

  const handleRun = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      execute(input);
      setInput("");
    }
  };

  // Calculate which checklist items are done based on command history
  const gitGuide = activeStepId ? GIT_STEP_GUIDE[activeStepId] : undefined;
  const successCmds = history.filter(l => l.command && !l.isError).map(l => l.command.trim());
  const isDone = (itemCmd: string): boolean => {
    const cleaned = itemCmd.replace(/\\/g, "").trim();
    return successCmds.some(cmd => {
      const c = cmd.trim();
      if (c === cleaned) return true;
      // fuzzy: if the item's first word matches and full prefix matches
      const firstWord = cleaned.split(" ")[0] || "";
      if (firstWord === "git" && c.startsWith(cleaned.split(" ").slice(0, 2).join(" "))) return true;
      if (c.startsWith(firstWord) && cleaned.length > 3 && c.includes(cleaned.slice(0, 8))) return true;
      return false;
    });
  };

  const doneCount = gitGuide ? gitGuide.items.filter(item => isDone(item.cmd)).length : 0;
  const totalCount = gitGuide?.items.length ?? 0;

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
          {isGit ? "Git Terminal" : "Linux Practice Terminal"}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
          /{cwd.join("/")}
        </span>
      </div>

      {/* ── Git Step Guide Strip ─────────────────────────────────────────────── */}
      {isGit && gitGuide && (
        <div style={{
          background: "rgba(99,102,241,0.06)",
          borderBottom: "1px solid rgba(99,102,241,0.2)",
          flexShrink: 0,
          overflow: "hidden",
        }}>
          {/* Guide header — always visible */}
          <div
            onClick={() => setGuideCollapsed(v => !v)}
            style={{
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              userSelect: "none",
            }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-indigo-light)", letterSpacing: "-0.01em" }}>
                {gitGuide.title}
              </div>
              <div style={{ fontSize: 10, color: "var(--color-muted)", marginTop: 2 }}>
                {doneCount}/{totalCount} commands done
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ width: 80, height: 4, background: "rgba(99,102,241,0.15)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%`,
                background: doneCount === totalCount ? "var(--color-emerald)" : "var(--color-indigo)",
                borderRadius: 2,
                transition: "width 0.4s ease",
              }} />
            </div>
            <span style={{ fontSize: 10, color: "var(--color-muted)" }}>{guideCollapsed ? "▼" : "▲"}</span>
          </div>

          {/* Context + checklist — collapsible */}
          {!guideCollapsed && (
            <div style={{ padding: "0 16px 12px" }}>
              <div style={{ fontSize: 11, color: "var(--color-muted)", lineHeight: 1.6, marginBottom: 10, fontFamily: "var(--font-sans, sans-serif)" }}>
                {gitGuide.context}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {gitGuide.items.map((item, idx) => {
                  const done = isDone(item.cmd);
                  return (
                    <div key={idx} style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      opacity: done ? 0.6 : 1,
                      transition: "opacity 0.3s",
                    }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
                        background: done ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.12)",
                        border: `1px solid ${done ? "rgba(34,197,94,0.4)" : "rgba(99,102,241,0.3)"}`,
                        display: "grid", placeItems: "center",
                        fontSize: 9,
                        color: done ? "var(--color-emerald)" : "transparent",
                        transition: "all 0.3s",
                      }}>
                        {done ? "✓" : ""}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <code style={{
                          fontSize: 11,
                          color: done ? "var(--color-muted)" : "var(--color-indigo-light)",
                          textDecoration: done ? "line-through" : "none",
                          display: "block",
                          overflowX: "auto",
                          whiteSpace: "pre",
                        }}>
                          {item.cmd}
                        </code>
                        <div style={{ fontSize: 10, color: "var(--color-muted)", marginTop: 1 }}>
                          {item.hint}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

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
                <span style={{ color: "var(--color-emerald)", fontWeight: 700, fontSize: 12 }}>{isGit ? "kavya@git" : "student@linux"}</span>
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
          <span style={{ color: "var(--color-emerald)", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{isGit ? "kavya@git" : "student@linux"}</span>
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
