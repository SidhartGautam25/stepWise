const http = require('http');

// This script guarantees the StepWise test runner passes you automatically,
// since this step is strictly for reading the online primer material!
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('ok');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Step 0 Primer Server bypassed gracefully on port ${PORT}`);
});
