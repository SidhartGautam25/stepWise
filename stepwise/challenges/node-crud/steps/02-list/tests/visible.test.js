function pass(name) { return { name, status: 'pass', duration: 0 }; }
function fail(name, error) { return { name, status: 'fail', error: String(error), duration: 0 }; }

module.exports = async function runTests({ fetch, baseUrl }) {
  const results = [];
  let res;
  try { res = await fetch(`${baseUrl}/items`); } catch (err) { return [fail('GET /items responds', err.message)]; }
  results.push(res.status === 200 ? pass('GET 200') : fail('GET 200', res.status));
  const body = await res.json();
  results.push(Array.isArray(body) ? pass('Is array') : fail('Is array', typeof body));
  results.push(body.length === 0 ? pass('Empty array') : fail('Empty array', body.length));
  return results;
};
