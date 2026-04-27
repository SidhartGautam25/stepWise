import { useCallback } from "react";
import type { TerminalState, TerminalLog } from "@repo/terminal-engine";
import type { CompletionSpec } from "@repo/challenge-schema";
import { evaluateCompletionSpec } from "@repo/quest-evaluator";

type StepWithCompletion = { id: string; completion?: CompletionSpec };

export function useQuestEvaluator(
  state: TerminalState,
  history: TerminalLog[],
  steps: StepWithCompletion[],
) {

  const successfulCommands = useCallback(() => history.filter((log) => log.command && !log.error), [history]);
  
  const hasCommand = useCallback((command: string) => {
    return successfulCommands().some((log) => log.command?.trim() === command);
  }, [successfulCommands]);

  const hasCommandPrefix = useCallback((prefix: string) =>
    successfulCommands().some((log) => log.command?.trim().startsWith(prefix)), [successfulCommands]);

  const commandCount = useCallback((command: string) =>
    successfulCommands().filter((log) => log.command?.trim() === command).length, [successfulCommands]);

  const getDirNode = (path: string[]) => {
    let currentDir: any = state.vfs;
    for (const p of path) {
      const node = currentDir?.[p];
      if (!node || node.type !== "directory") return null;
      currentDir = node.children;
    }
    return currentDir ?? null;
  };

  const checkStepCompletion = useCallback((stepId: string, completedStepIds: string[]): boolean => {
    // Note: we do NOT return true for completedStepIds.includes(stepId) here.
    // evalStep in ChallengeViewer guards against already-passed steps.
    // Only check actual completion conditions below.
    const step = steps.find((candidate) => candidate.id === stepId);
    if (step?.completion?.all?.length) {
      return evaluateCompletionSpec(step.completion, state, history);
    }
    const git = state.git;
    
    // ── Git quest steps ──────────────────────────────────────────────────────
    if (stepId === "01-init") {
      return !!git?.initialized && hasCommandPrefix("git init") && hasCommandPrefix("ls");
    }

    if (stepId === "02-first-commit") {
      const branch = git?.branch;
      const commits = git?.commits.filter(c => c.branch === branch) || [];
      return commits.length >= 1 && hasCommandPrefix("git status") && hasCommandPrefix("git add") && hasCommandPrefix("git commit");
    }

    if (stepId === "03-history") {
      const branch = git?.branch;
      const commits = git?.commits.filter(c => c.branch === branch) || [];
      return commits.length >= 2 && hasCommandPrefix("git log");
    }

    if (stepId === "04-branch") {
      return (git?.branches.length || 0) >= 2 && hasCommandPrefix("git checkout");
    }

    if (["00-welcome", "00-world-before", "00-snapshot-idea", "00-git-the-answer"].includes(stepId)) {
      return completedStepIds.includes(stepId);
    }

    // ── Linux quest steps ────────────────────────────────────────────────────
    const homeStudent = getDirNode(["home", "student"]);
    const projects = homeStudent?.["projects"];
    const projectDir = projects?.type === "directory" ? projects.children : undefined;
    const notes = projectDir?.["notes.txt"];

    if (stepId === "00-why-os") return completedStepIds.includes(stepId);
    if (stepId === "00-orientation") return hasCommand("continue"); // only explicit 'continue' command

    if (stepId === "01-directories") {
      return !!(
        projects &&
        projects.type === "directory" &&
        hasCommand("pwd") &&
        commandCount("ls") >= 2 &&
        hasCommand("mkdir projects")
      );
    }

    if (stepId === "02-navigation") {
      return !!(
        projects &&
        state.cwd.join("/") === "home/student/projects" &&
        hasCommand("cd projects") &&
        hasCommand("pwd") &&
        hasCommandPrefix("cd ..")
      );
    }

    if (stepId === "03-files-and-listing") {
      return !!(
        notes &&
        notes.type === "file" &&
        notes.content?.includes("hello linux") &&
        state.cwd.join("/") === "home/student/projects" &&
        hasCommand("touch notes.txt") &&
        hasCommandPrefix("echo hello linux > notes.txt") &&
        hasCommand("ls") &&
        hasCommand("cat notes.txt")
      );
    }

    return false;
  }, [state, history, commandCount, hasCommand, hasCommandPrefix, steps]);

  return { checkStepCompletion };
}
