function pass(name) { return { name, status: 'pass', duration: 0 }; }
function fail(name, error) { return { name, status: 'fail', error: String(error), duration: 0 }; }

module.exports = async function runTests({ fetch, baseUrl }) {
  const results = [];
  let res;
  try { res = await fetch(`${baseUrl}/health`); } catch (err) { return [fail('GET /health responds', err.message)]; }
  results.push(res.status === 200 ? pass('GET 200') : fail('GET 200', res.status));
  const ct = res.headers.get('content-type') ?? '';
  results.push(ct.includes('application/json') ? pass('JSON type') : fail('JSON type', ct));
  let body;
  try { body = await res.json(); } catch (err) { return [...results, fail('Parsable body', err.message)]; }
  results.push(body.status === 'ok' ? pass('status ok') : fail('status ok', body.status));
  results.push(typeof body.version === 'string' ? pass('version string') : fail('version string', typeof body.version));
  return results;
};
