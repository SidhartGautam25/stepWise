const http = require('http');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 3000;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(raw)); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

const items = [];

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  if (method === 'GET' && url === '/health') {
    return sendJson(res, 200, { status: 'ok', version: '1.0.0' });
  }

  if (method === 'GET' && url === '/items') {
    return sendJson(res, 200, items);
  }

  // ── TODO ──────────────────────────────────────────────────────────────────
  // Handle: POST /items
  // 1. Read body with `await readBody(req)`
  // 2. Add id (randomUUID) and createdAt (new Date().toISOString())
  // 3. Push to items array
  // 4. Return HTTP 201 with the created item
  // ──────────────────────────────────────────────────────────────────────────

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
