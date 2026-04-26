/**
 * @repo/terminal-engine — Public API
 */

export { SimulatedTerminal }   from "./components/SimulatedTerminal";
export { gitInterpreter }      from "./interpreters/gitInterpreter";
export { linuxInterpreter }    from "./interpreters/linuxInterpreter";
export { makeDefaultState }    from "./types";

export type {
  TerminalState,
  TerminalLanguage,
  CommandResult,
  Interpreter,
  FileNode,
  GitCommitRecord,
  GitBranch,
} from "./types";
export type { SimulatedTerminalProps } from "./components/SimulatedTerminal";
