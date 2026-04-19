function pass(name) { return { name, status: 'pass', duration: 0 }; }
function fail(name, error) { return { name, status: 'fail', error: String(error), duration: 0 }; }

module.exports = async function runTests({ fetch, baseUrl }) {
  const results = [];
  const pt = await (await fetch(`${baseUrl}/items`, { method: 'POST', body: JSON.stringify({ name: 'O' }) })).json();
  const res = await fetch(`${baseUrl}/items/${pt.id}`, { method: 'PUT', body: JSON.stringify({ name: 'N', a: 1 }) });
  results.push(res.status === 200 ? pass('PUT 200') : fail('PUT 200', res.status));
  const updated = await res.json();
  results.push(updated.name === 'N' && updated.a === 1 ? pass('Merged') : fail('Merged', updated.name));
  results.push(updated.id === pt.id ? pass('Preserved ID') : fail('Preserved ID', updated.id));
  const bad = await fetch(`${baseUrl}/items/does-not-exist`, { method: 'PUT', body: '{}' });
  results.push(bad.status === 404 ? pass('404 missing') : fail('404 missing', bad.status));
  return results;
};
