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

  if (method === 'GET' && url.startsWith('/items/')) {
    const id = parseItemId(url, '/items');
    const item = items.find(i => i.id === id);
    return item ? sendJson(res, 200, item) : sendJson(res, 404, { error: 'Not found' });
  }

  // ── TODO ──────────────────────────────────────────────────────────────────
  // Handle: PUT /items/:id
  // 1. Extract id, find item index. If -1, return 404.
  // 2. Read body, merge into item preserving standard properties
  // 3. Update the array and return 200
  // ──────────────────────────────────────────────────────────────────────────

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => console.log(`Up on ${PORT}`));
