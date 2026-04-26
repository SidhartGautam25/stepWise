import { useEffect, useRef } from "react";
import { useAethera } from "../../contexts/AetheraContext";
import { submitAttemptResult } from "./apiAdapter";

export function AetheraEvaluator({ challengeId, stepId, userId, token, onPassed }: { challengeId: string, stepId: string, userId: string, token: string, onPassed: () => void }) {
  const { history, checkStepCompletion, completionVersion } = useAethera();
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
  }, [history, stepId, challengeId, userId, token, checkStepCompletion, onPassed, completionVersion]);

  return null;
}
