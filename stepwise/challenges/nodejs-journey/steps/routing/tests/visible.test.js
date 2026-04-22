const fs = require('fs');
const path = require('path');
const http = require('http');

async function runTest(testResult) {
  const filePath = path.resolve(process.cwd(), 'server.js');
  
  if (!fs.existsSync(filePath)) {
    testResult.addFailure('server.js found', 'Could not find server.js file.');
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes("req.url") || content.includes("request.url")) {
    testResult.addSuccess('Implement Routing URL checking');
  } else {
    testResult.addFailure('Implement Routing URL checking', 'Did you add an evaluation against request.url?');
  }
  
  if (content.includes("/ping")) {
    testResult.addSuccess('Watch for /ping route');
  } else {
    testResult.addFailure('Watch for /ping route', 'Could not find the "/ping" route in your server logic.');
  }

  if (content.includes("pong")) {
    testResult.addSuccess('Return pong');
  } else {
    testResult.addFailure('Return pong', 'Return "pong" when /ping is hit.');
  }
}

module.exports = runTest;
