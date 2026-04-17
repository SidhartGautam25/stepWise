const { test, assert, getTests } = require("@repo/challenge-sdk");

test("returns 42", (fn) => {
  const result = fn();
  assert(result === 42, "Expected 42");
});

module.exports = getTests();
