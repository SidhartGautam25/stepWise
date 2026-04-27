"use client";

/**
 * SimulatedTerminal — Language-aware in-browser terminal
 *
 * Renders a fully functional simulated terminal.
 * Can be controlled via `terminalProps`, or operates autonomously if none provided.
 */

import React, { useEffect, useRef, useState } from "react";
import type { TerminalState, VfsNode } from "../types";
import { TerminalLanguage } from "../types";
import { useTerminal, TerminalLog } from "../useTerminal";

export interface SimulatedTerminalProps {
  language?: TerminalLanguage;
  initialVfs?: Record<string, VfsNode>;
  preHistory?: string[];
  hint?: string;
  height?: number | string;
  // Controlled state
  state?: TerminalState;
  history?: TerminalLog[];
  execute?: (cmd: string) => void;
}


export function SimulatedTerminal({
  language = "git",
  initialVfs = {},
  preHistory = [],
  hint,
  height = "100%",
  state: extState,
  history: extHistory,
  execute: extExecute,
}: SimulatedTerminalProps) {
  // If controlled externally, ignore internal hook. If uncontrolled, use internal hook.
  const internal = useTerminal({ language, initialVfs });
  const isControlled = extState !== undefined && extExecute !== undefined;

  // Run preHistory commands on mount (only for uncontrolled mode)
  const didPre = React.useRef(false);
  React.useEffect(() => {
    if (isControlled || didPre.current || preHistory.length === 0) return;
    didPre.current = true;
    preHistory.forEach(cmd => internal.execute(cmd));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const state = isControlled ? extState! : internal.state;
  const history = isControlled ? (extHistory || []) : internal.history;
  const execute = isControlled ? extExecute! : internal.execute;

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const cmd = input.trim();
    setInput("");
    if (!cmd) return;
    execute(cmd);
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
          background: "var(--terminal-bg, #0d1117)",
          borderRadius: 12,
          border: "1px solid var(--terminal-border, rgba(255,255,255,0.08))",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 13,
        }}
      >
        {/* Title bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 7, padding: "10px 16px",
          borderBottom: "1px solid var(--terminal-border, rgba(255,255,255,0.07))",
          background: "var(--terminal-titlebar, rgba(255,255,255,0.03))", flexShrink: 0,
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
                  <span style={{ color: "var(--terminal-prompt, #4ade80)", fontWeight: 700 }}>student</span>
                  <span style={{ color: "var(--terminal-text, rgba(200,200,200,0.5))" }}>:</span>
                  <span style={{ color: "var(--terminal-path, #818cf8)" }}>~/{(state.cwd).join("/")}</span>
                  {state.git?.initialized && (
                    <span style={{ color: "var(--terminal-branch, #fbbf24)", fontSize: 11 }}>({state.git.branch})</span>
                  )}
                  <span style={{ color: "var(--terminal-text, #e2e8f0)", opacity: 0.5 }}>$</span>
                  <span style={{ color: "var(--terminal-text, #e2e8f0)" }}>{entry.command}</span>
                </div>
              )}
              {entry.lines.map((line, li) => (
                <div key={li} style={{
                  color: entry.error ? "var(--terminal-error, #f87171)" : "var(--terminal-success, #86efac)",
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
            <span style={{ color: "var(--terminal-prompt, #4ade80)", fontWeight: 700 }}>student</span>
            <span style={{ color: "var(--terminal-text, rgba(200,200,200,0.5))" }}>:</span>
            <span style={{ color: "var(--terminal-path, #818cf8)" }}>~/{(state.cwd).join("/")}</span>
            {state.git?.initialized && (
              <span style={{ color: "var(--terminal-branch, #fbbf24)", fontSize: 11 }}>({state.git.branch})</span>
            )}
            <span style={{ color: "var(--terminal-text, #e2e8f0)", opacity: 0.5 }}>$</span>
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
                color: "var(--terminal-text, #e2e8f0)", fontFamily: "var(--font-mono, monospace)", fontSize: 13,
                caretColor: "var(--terminal-path, #818cf8)",
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
