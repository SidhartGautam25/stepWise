"use client";

/**
 * SimulatedTerminal — Language-aware in-browser terminal
 *
 * Renders a fully functional simulated terminal that interprets commands
 * locally using the appropriate interpreter (git or linux).
 * No Docker container needed — great for interactive lesson slides.
 *
 * Props:
 *   language        – "git" | "linux"
 *   initialFiles    – files to seed in the working directory
 *   preHistory      – commands to pre-run and show on mount
 *   hint            – small label shown above the terminal
 *   height          – optional fixed height
 */

import React, { useEffect, useRef, useState } from "react";
import type { FileNode, TerminalState, CommandResult } from "../types";
import { makeDefaultState } from "../types";
import { gitInterpreter } from "../interpreters/gitInterpreter";
import { linuxInterpreter } from "../interpreters/linuxInterpreter";

export type TerminalLanguage = "git" | "linux";

export interface SimulatedTerminalProps {
  language?: TerminalLanguage;
  initialFiles?: FileNode[];
  preHistory?: string[];
  hint?: string;
  height?: number | string;
}

interface HistoryEntry {
  command?: string;
  lines: string[];
  error: boolean;
}

function getInterpreter(lang: TerminalLanguage) {
  return lang === "git" ? gitInterpreter : linuxInterpreter;
}

function runCommand(raw: string, state: TerminalState, lang: TerminalLanguage): CommandResult {
  return getInterpreter(lang)(raw, state);
}

export function SimulatedTerminal({
  language = "git",
  initialFiles = [],
  preHistory = [],
  hint,
  height = "100%",
}: SimulatedTerminalProps) {
  const [state, setState] = useState<TerminalState>(() => makeDefaultState({ files: initialFiles }));
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const didPre = useRef(false);

  // Run preHistory commands on mount
  useEffect(() => {
    if (didPre.current || preHistory.length === 0) return;
    didPre.current = true;
    let s = makeDefaultState({ files: initialFiles });
    const entries: HistoryEntry[] = [];
    preHistory.forEach(cmd => {
      const res = runCommand(cmd, s, language);
      entries.push({ command: cmd, lines: res.lines, error: res.error });
      s = res.newState;
    });
    setState(s);
    setHistory(entries);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const cmd = input.trim();
    setInput("");
    if (!cmd) return;
    if (cmd === "clear") { setHistory([]); return; }
    const res = runCommand(cmd, state, language);
    setState(res.newState);
    setHistory(h => [...h, { command: cmd, lines: res.lines, error: res.error }]);
  };

  const prompt = buildPrompt(state, language);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, height }}>
      {hint && (
        <div style={{ fontSize: 10, fontWeight: 800, color: "var(--interactive-kicker)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {hint}
        </div>
      )}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          background: "#0d1117",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 13,
        }}
      >
        {/* Title bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 7, padding: "10px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.03)", flexShrink: 0,
        }}>
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ef4444" }} />
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#f59e0b" }} />
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#10b981" }} />
          <span style={{ marginLeft: 10, fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.05em" }}>
            {language === "git" ? "Git Practice Terminal" : "Linux Practice Terminal"}
          </span>
          {state.git?.initialized && (
            <span style={{ marginLeft: "auto", fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(34,197,94,0.15)", color: "#22c55e", fontWeight: 700 }}>
              ⎇ {state.git.branch}
            </span>
          )}
        </div>

        {/* Output area */}
        <div
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
          style={{ flex: 1, overflowY: "auto", padding: "14px 18px", cursor: "text" }}
        >
          {history.map((entry, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              {entry.command && (
                <div style={{ display: "flex", gap: 6, alignItems: "baseline", flexWrap: "wrap" }}>
                  <span style={{ color: "#4ade80", fontWeight: 700 }}>student</span>
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>:</span>
                  <span style={{ color: "#818cf8" }}>~/{(state.cwd).join("/")}</span>
                  {state.git?.initialized && (
                    <span style={{ color: "#fbbf24", fontSize: 11 }}>({state.git.branch})</span>
                  )}
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>$</span>
                  <span style={{ color: "#e2e8f0" }}>{entry.command}</span>
                </div>
              )}
              {entry.lines.map((line, li) => (
                <div key={li} style={{
                  color: entry.error ? "#f87171" : "#86efac",
                  fontSize: 12, lineHeight: 1.55, paddingLeft: 2,
                  whiteSpace: "pre-wrap",
                  fontFamily: "var(--font-mono, monospace)",
                }}>
                  {line}
                </div>
              ))}
            </div>
          ))}

          {/* Active input */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: "#4ade80", fontWeight: 700 }}>student</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>:</span>
            <span style={{ color: "#818cf8" }}>~/{(state.cwd).join("/")}</span>
            {state.git?.initialized && (
              <span style={{ color: "#fbbf24", fontSize: 11 }}>({state.git.branch})</span>
            )}
            <span style={{ color: "rgba(255,255,255,0.4)" }}>$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              style={{
                flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
                color: "#e2e8f0", fontFamily: "var(--font-mono, monospace)", fontSize: 13,
                caretColor: "#818cf8",
              }}
              placeholder={prompt}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function buildPrompt(state: TerminalState, lang: TerminalLanguage): string {
  const dir = state.cwd.join("/");
  const branch = state.git?.initialized ? ` (${state.git.branch})` : "";
  return lang === "git" ? `~/${dir}${branch} $ ` : `~/${dir} $ `;
}
