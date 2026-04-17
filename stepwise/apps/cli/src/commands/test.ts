import { runChallenge } from "@repo/challenge-runner";
import { NodeTester } from "@repo/tester-node";

async function main() {
  const tester = new NodeTester();

  const result = await runChallenge({
    userCodePath: "../../challenges/promise-basic/index.js",
    challengePath: "../../challenges/promise-basic",
    tester,
    timeout: 2000,
  });

  console.log(JSON.stringify(result, null, 2));
}

main();
