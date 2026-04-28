# @repo/challenge-runner

Shared challenge execution utilities.

## Tester Registry

Testers are registered by capability instead of being hardcoded in CLI command
logic.

```ts
import { TesterRegistry } from "@repo/challenge-runner";
import { testerRegistration as node } from "@repo/tester-node";
import { testerRegistration as server } from "@repo/tester-server";

const registry = new TesterRegistry()
  .registerMany([server, node])
  .registerFromEnv();

const tester = registry.getTester({
  runtime: "node",
  challengeType: "server",
});
```

External plugin packages can be loaded without changing CLI code:

```bash
STEPWISE_TESTER_PLUGINS="@acme/stepwise-python-tester" stepwise test
```

A plugin module must export one of:

```ts
export const testerRegistration = {
  name: "python",
  supportedRuntimes: ["python"],
  supportedChallengeTypes: ["function"],
  create: () => new PythonTester(),
};
```

or:

```ts
export const testerRegistrations = [pythonTester, djangoTester];
```
