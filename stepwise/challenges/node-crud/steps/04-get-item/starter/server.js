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
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

function parseItemId(url, prefix) {
  if (!url.startsWith(prefix + '/')) return null;
  return url.slice(prefix.length + 1) || null;
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

  if (method === 'POST' && url === '/items') {
    const body = await readBody(req);
    const item = { id: randomUUID(), ...body, createdAt: new Date().toISOString() };
    items.push(item);
    return sendJson(res, 201, item);
  }

  // ── TODO ──────────────────────────────────────────────────────────────────
  // Handle: GET /items/:id
  // 1. Extract id using parseItemId
  // 2. Return 200 with item, or 404 with error message
  // ──────────────────────────────────────────────────────────────────────────

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => console.log(`Up on ${PORT}`));
