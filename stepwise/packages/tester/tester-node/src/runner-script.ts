import path from "path";

async function main() {
  const userCodePath = process.argv[2];
  const challengePath = process.argv[3];

  // ✅ validate inputs (important for production)
  if (!userCodePath || !challengePath) {
    console.error("Missing arguments: userCodePath or challengePath");
    process.exit(1);
  }

  try {
    const userModule = require(path.resolve(userCodePath));
    const tests = require(path.resolve(challengePath, "tests/visible.test.js"));

    const results = [];

    for (const test of tests) {
      try {
        await test.fn(userModule);
        results.push({ name: test.name, status: "pass" });
      } catch (err: any) {
        results.push({
          name: test.name,
          status: "fail",
          error: err.message,
        });
      }
    }

    console.log(JSON.stringify({ results }));
    process.exit(0);
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
}

main();
