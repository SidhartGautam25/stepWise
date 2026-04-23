import { useEffect, useRef } from "react";
import { useAethera } from "../../contexts/AetheraContext";
import { submitAttemptResult } from "./apiAdapter";

export function AetheraEvaluator({ challengeId, stepId, userId, token, onPassed }: { challengeId: string, stepId: string, userId: string, token: string, onPassed: () => void }) {
  const { history, checkStepCompletion } = useAethera();
  const submittedStepsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Every time the command history changes, we evaluate if the step is satisfied.
    if (history.length > 0) {
      if (submittedStepsRef.current.has(stepId)) return;

      const isComplete = checkStepCompletion(stepId);
      if (isComplete) {
        submittedStepsRef.current.add(stepId);

        // Send a success signal to API seamlessly bypassing CLI!
        submitAttemptResult(challengeId, stepId, userId, token)
          .then(() => onPassed())
          .catch(console.error);
      }
    }
  }, [history, stepId, challengeId, userId, token, checkStepCompletion, onPassed]);

  return null;
}
