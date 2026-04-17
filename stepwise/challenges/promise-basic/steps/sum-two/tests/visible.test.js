const { test, assert, getTests } = require("@repo/challenge-sdk");

test("adds two positive numbers", (sumTwo) => {
  assert(sumTwo(2, 3) === 5, "Expected 2 + 3 to equal 5");
});

test("adds a negative and positive number", (sumTwo) => {
  assert(sumTwo(-1, 4) === 3, "Expected -1 + 4 to equal 3");
});

module.exports = getTests();
