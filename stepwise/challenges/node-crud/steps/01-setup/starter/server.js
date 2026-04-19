const http = require('http');

const PORT = process.env.PORT || 3000;

/**
 * Helper: write a JSON response.
 * Always sets Content-Type: application/json.
 */
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // ── TODO ──────────────────────────────────────────────────────────────────
  // Handle: GET /health
  //
  // Return HTTP 200 with this exact JSON body:
  //   { "status": "ok", "version": "1.0.0" }
  //
  // Hint: use sendJson(res, statusCode, data)
  // ──────────────────────────────────────────────────────────────────────────

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
