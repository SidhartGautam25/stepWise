import { useEffect, useRef } from "react";
import { submitAttemptResult } from "./apiAdapter";

export function QuestEvaluator({ 
  challengeId, 
  stepId, 
  userId, 
  token, 
  historyLength,
  checkStepCompletion,
  onPassed 
}: { 
  challengeId: string;
  stepId: string;
  userId: string;
  token: string;
  historyLength: number;
  checkStepCompletion: (stepId: string) => boolean;
  onPassed: () => void;
}) {
  const submittedStepsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (submittedStepsRef.current.has(stepId)) return;

    const isComplete = checkStepCompletion(stepId);
    if (!isComplete) return;

    submittedStepsRef.current.add(stepId);

    if (!token) {
      onPassed();
      return;
    }

    // Visual-only lessons and terminal-driven steps should share the same
    // completion pipeline once their step conditions are satisfied.
    submitAttemptResult(challengeId, stepId, userId, token)
      .then(() => onPassed())
      .catch((error) => {
        submittedStepsRef.current.delete(stepId);
        console.error(error);
      });
  }, [stepId, historyLength, challengeId, userId, token, checkStepCompletion, onPassed]);

  return null;
}
