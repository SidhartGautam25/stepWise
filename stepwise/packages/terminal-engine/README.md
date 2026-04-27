# @repo/terminal-engine
A high-fidelity, language-aware simulated terminal ecosystem for the browser.

This package provides a realistic terminal interface that allows students to practice Linux and Git commands without leaving the platform.

## 🧱 Core Components

### `SimulatedTerminal`
The primary React component that renders the terminal UI. It supports:
- Real-time command execution.
- ANSI escape code parsing (colors!).
- Integrated Git branch status display.
- Custom heights and responsive layouts.

### `useTerminal` (Hook)
The brain behind the terminal. It manages history, state (VFS), and execution logic.
```tsx
const { state, history, execute } = useTerminal({ 
  language: "git", 
  initialVfs: { "file.txt": { type: "file", content: "hello" } } 
});
```

## 🧠 Interpreters
The engine uses pluggable interpreters to process commands:
- **`linuxInterpreter`**: Handles `pwd`, `ls`, `cd`, `mkdir`, `touch`, `echo`, `cat`, and `rm`.
- **`gitInterpreter`**: A sophisticated state machine simulating `git init`, `status`, `add`, `commit`, `log`, `branch`, and `checkout`.

## 🎨 Aesthetics
The terminal is designed with a premium, dark-mode focused aesthetic (can be themed via CSS variables).
- **Blue**: Directories
- **Green**: Active branch / Success
- **Yellow**: Commit hashes
- **Red**: Errors

## 🛠 Adding Commands
Commands are defined in their respective interpreter files. To add a command, update the `switch` statement in `linuxInterpreter.ts` or `gitInterpreter.ts` with the new logic following the `ok` / `err` response pattern.
