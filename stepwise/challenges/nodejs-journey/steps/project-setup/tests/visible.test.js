const fs = require('fs');
const path = require('path');

function runTest(testResult) {
  try {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    if (!fs.existsSync(pkgPath)) {
      testResult.addFailure('Create package.json', 'Could not find package.json file. Did you create it?');
      return;
    }
    
    testResult.addSuccess('Create package.json');
    
    const content = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    if (content.name === 'todo-api') {
      testResult.addSuccess('Set name to todo-api');
    } else {
      testResult.addFailure('Set name to todo-api', `Expected name to be "todo-api", got "${content.name}"`);
    }

    if (content.version === '1.0.0') {
      testResult.addSuccess('Set version to 1.0.0');
    } else {
      testResult.addFailure('Set version to 1.0.0', `Expected version 1.0.0, got "${content.version}"`);
    }

  } catch (err) {
    testResult.addFailure('Syntax Check', 'Your package.json does not contain valid JSON syntax.');
  }
}

module.exports = runTest;
