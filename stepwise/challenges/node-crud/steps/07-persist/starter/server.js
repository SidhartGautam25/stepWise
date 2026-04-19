const http = require('http');
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'items.json');

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

// ── TODO ──────────────────────────────────────────────────────────────────────
// Replace the in-memory items array with file-based persistence.
//
// 1. LOAD from disk on startup:
//    Use: fs.existsSync(DATA_FILE) and JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
//    If no file exists, initialize it as []
//
// 2. SAVE to disk after every write (create, update, delete):
//    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2))
// ──────────────────────────────────────────────────────────────────────────────

const items = []; // Replace this with logic to load from disk

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  if (method === 'GET' && url === '/health') return sendJson(res, 200, { status: 'ok', version: '1.0.0' });
  if (method === 'GET' && url === '/items') return sendJson(res, 200, items);

  if (method === 'POST' && url === '/items') {
    const body = await readBody(req);
    const item = { id: randomUUID(), ...body, createdAt: new Date().toISOString() };
    items.push(item);
    // TODO: save items to DATA_FILE after creating
    return sendJson(res, 201, item);
  }

  if (method === 'GET' && url.startsWith('/items/')) {
    const id = parseItemId(url, '/items');
    const item = items.find(i => i.id === id);
    return item ? sendJson(res, 200, item) : sendJson(res, 404, { error: 'Not found' });
  }

  if (method === 'PUT' && url.startsWith('/items/')) {
    const id = parseItemId(url, '/items');
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return sendJson(res, 404, { error: 'Not found' });
    const body = await readBody(req);
    const original = items[index];
    items[index] = { ...original, ...body, id: original.id, createdAt: original.createdAt };
    // TODO: save items to DATA_FILE after updating
    return sendJson(res, 200, items[index]);
  }

  if (method === 'DELETE' && url.startsWith('/items/')) {
    const id = parseItemId(url, '/items');
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return sendJson(res, 404, { error: 'Not found' });
    items.splice(index, 1);
    // TODO: save items to DATA_FILE after deleting
    res.writeHead(204);
    return res.end();
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => console.log(`Up on ${PORT}`));
