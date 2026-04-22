import {
  StartAttemptResponse,
  SubmitResultResponse,
} from "../../../../packages/attempt-contracts/src";
import { RunChallengeResult } from "@repo/challenge-runner";

interface StudentResultOutput {
  attempt: StartAttemptResponse;
  result: RunChallengeResult;
  progression: SubmitResultResponse;
}

export function renderStudentFacingResult(
  output: StudentResultOutput,
): string {
  const lines: string[] = [];
  const failedTests = output.result.results.filter(
    (test) => test.status !== "pass" && test.visibility !== "hidden",
  );

  lines.push(`Quest: ${output.attempt.challengeId}`);
  lines.push(`Step: ${output.attempt.step.title} (${output.attempt.step.id})`);
  lines.push(
    "Mode: Build the current project step locally, then submit this step for validation.",
  );
  lines.push("");

  if (output.progression.outcome === "passed") {
    lines.push("Status: Passed");
    lines.push(
      `Visible checks: ${output.result.passed}/${output.result.total} passed`,
    );

    if (output.progression.challengeCompleted) {
      lines.push("");
      lines.push(
        "Nice work. You completed this quest and can move on to the next build.",
      );
    } else if (output.progression.nextStepId) {
      lines.push("");
      lines.push(`Next unlocked step: ${output.progression.nextStepId}`);
      lines.push(
        "You can continue building the next part of the project by running the same command again.",
      );
    }
  } else {
    lines.push("Status: Not passed yet");
    lines.push(
      `Visible checks: ${output.result.passed}/${output.result.total} passed`,
    );

    if (failedTests.length > 0) {
      lines.push("");
      lines.push("What still needs work:");

      for (const test of failedTests) {
        const detail = test.error ? ` - ${test.error}` : "";
        lines.push(`- ${test.name}${detail}`);
      }
    }

    lines.push("");
    lines.push(
      "Keep iterating on this step until the visible checks pass, then rerun the command to submit again.",
    );
  }

  lines.push("");
  lines.push(`Attempt: ${output.attempt.attemptId}`);
  lines.push(`Execution time: ${output.result.executionTime}ms`);

  return lines.join("\n");
}
