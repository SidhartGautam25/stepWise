const http = require('http');

const PORT = process.env.PORT || 3000;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // Answer for Step 1:
  if (method === 'GET' && url === '/health') {
    return sendJson(res, 200, { status: 'ok', version: '1.0.0' });
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
