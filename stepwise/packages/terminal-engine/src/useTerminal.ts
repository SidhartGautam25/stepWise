import { useState, useCallback } from "react";
import type { TerminalState, TerminalLanguage, CommandResult, Interpreter, VfsNode } from "./types";
import { makeDefaultState } from "./types";
import { gitInterpreter } from "./interpreters/gitInterpreter";
import { linuxInterpreter } from "./interpreters/linuxInterpreter";

export interface UseTerminalProps {
  language?: TerminalLanguage;
  initialVfs?: Record<string, VfsNode>;
}

export interface TerminalLog {
  command?: string;
  lines: string[];
  error: boolean;
}

function getInterpreter(lang: TerminalLanguage): Interpreter {
  return lang === "git" ? gitInterpreter : linuxInterpreter;
}

export function useTerminal({ language = "git", initialVfs = {} }: UseTerminalProps = {}) {
  const [state, setState] = useState<TerminalState>(() => makeDefaultState({ vfs: initialVfs }));
  const [history, setHistory] = useState<TerminalLog[]>([]);

  const execute = useCallback((raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    if (cmd === "clear") { setHistory([]); return; }
    
    const interpreter = getInterpreter(language);
    const res = interpreter(cmd, state);
    setState(res.newState);
    setHistory(h => [...h, { command: cmd, lines: res.lines, error: res.error }]);
  }, [language, state]);

  const clearHistory = useCallback(() => setHistory([]), []);

  return {
    state,
    history,
    execute,
    clearHistory,
    language
  };
}
