const fs = require('fs');
const path = require('path');
const http = require('http');

async function runTest(testResult) {
  const filePath = path.resolve(process.cwd(), 'server.js');
  
  if (!fs.existsSync(filePath)) {
    testResult.addFailure('Create server.js', 'Could not find server.js file.');
    return;
  }
  
  testResult.addSuccess('Create server.js');
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes("require('http')") || content.includes('require("http")') || content.includes("import http")) {
    testResult.addSuccess('Import http module');
  } else {
    testResult.addFailure('Import http module', "Could not find a 'require(\"http\")' statement.");
  }
  
  if (content.includes("createServer")) {
    testResult.addSuccess('Use http.createServer');
  } else {
    testResult.addFailure('Use http.createServer', 'Make sure to invoke createServer()');
  }

  if (content.includes(".listen(3000)")) {
    testResult.addSuccess('Listen on port 3000');
  } else {
    testResult.addFailure('Listen on port 3000', 'Did you call .listen(3000)?');
  }
}

module.exports = runTest;
