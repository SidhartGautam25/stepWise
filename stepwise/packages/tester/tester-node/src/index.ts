import {
  RuntimeContext,
  TestCase,
  Tester,
} from "@repo/challenge-runner";

export class NodeTester implements Tester {
  async prepare(userCodePath: string): Promise<RuntimeContext> {
    const resolvedUserCodePath = require.resolve(userCodePath);
    delete require.cache[resolvedUserCodePath];

    return {
      runtime: require(resolvedUserCodePath),
      metadata: {
        userCodePath: resolvedUserCodePath,
      },
    };
  }

  async execute(test: TestCase, context: RuntimeContext): Promise<void> {
    await Promise.resolve(test.fn(context.runtime));
  }

  async cleanup(_context?: RuntimeContext): Promise<void> {}
}
