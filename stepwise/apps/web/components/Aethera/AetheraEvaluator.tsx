import { useEffect } from "react";
import { useAethera } from "../../contexts/AetheraContext";
import { submitAttemptResult } from "./apiAdapter";

export function AetheraEvaluator({ challengeId, stepId, userId, token, onPassed }: { challengeId: string, stepId: string, userId: string, token: string, onPassed: () => void }) {
  const { history, checkStepCompletion } = useAethera();

  useEffect(() => {
    // Every time the command history changes, we evaluate if the step is satisfied.
    if (history.length > 0) {
      const isComplete = checkStepCompletion(stepId);
      if (isComplete) {
        // Send a success signal to API seamlessly bypassing CLI!
        submitAttemptResult(challengeId, stepId, userId, token)
          .then(() => onPassed())
          .catch(console.error);
      }
    }
  }, [history, stepId, challengeId, userId, token, checkStepCompletion, onPassed]);

  return null;
}
