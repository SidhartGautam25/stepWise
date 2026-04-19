function pass(name) { return { name, status: 'pass', duration: 0 }; }
function fail(name, error) { return { name, status: 'fail', error: String(error), duration: 0 }; }

module.exports = async function runTests({ fetch, baseUrl }) {
  const results = [];
  const pt = await (await fetch(`${baseUrl}/items`, { method: 'POST', body: JSON.stringify({ name: 'T' }) })).json();
  const res = await fetch(`${baseUrl}/items/${pt.id}`);
  results.push(res.status === 200 ? pass('GET /:id 200') : fail('GET /:id 200', res.status));
  const match = await res.json();
  results.push(match.id === pt.id ? pass('Returns item') : fail('Returns item', match.id));
  const bad = await fetch(`${baseUrl}/items/does-not-exist`);
  results.push(bad.status === 404 ? pass('404 for missing') : fail('404 for missing', bad.status));
  return results;
};
