import { runChallenge } from "@repo/challenge-runner";
import { NodeTester } from "@repo/tester-node";
import path from "path";

async function main() {
  const tester = new NodeTester();
  const challengePath = path.resolve(
    __dirname,
    "../../../../challenges/promise-basic",
  );

  const result = await runChallenge({
    challengePath,
    tester,
    mode: "local",
  });

  console.log(JSON.stringify(result, null, 2));
}

main();
