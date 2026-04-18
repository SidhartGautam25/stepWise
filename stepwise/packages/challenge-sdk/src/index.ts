const tests: any[] = [];

export function test(name: string, fn: any) {
  tests.push({ name, fn });
}

export function getTests() {
  return tests;
}

export function assert(condition: boolean, message?: string) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}
