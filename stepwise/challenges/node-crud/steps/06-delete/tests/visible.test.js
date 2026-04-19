function pass(name) { return { name, status: 'pass', duration: 0 }; }
function fail(name, error) { return { name, status: 'fail', error: String(error), duration: 0 }; }

module.exports = async function runTests({ fetch, baseUrl }) {
  const results = [];
  const pt1 = await (await fetch(`${baseUrl}/items`, { method: 'POST', body: JSON.stringify({ name: 'A' }) })).json();
  const pt2 = await (await fetch(`${baseUrl}/items`, { method: 'POST', body: JSON.stringify({ name: 'B' }) })).json();
  const res = await fetch(`${baseUrl}/items/${pt1.id}`, { method: 'DELETE' });
  results.push(res.status === 204 ? pass('DELETE 204') : fail('DELETE 204', res.status));
  const btext = await res.text();
  results.push(btext === '' ? pass('No body') : fail('No body', btext));
  const g1 = await fetch(`${baseUrl}/items/${pt1.id}`);
  results.push(g1.status === 404 ? pass('Now 404s') : fail('Now 404s', g1.status));
  const list = await (await fetch(`${baseUrl}/items`)).json();
  results.push(list.length === 1 && list[0].id === pt2.id ? pass('Others intact') : fail('Others intact', list.length));
  return results;
};
