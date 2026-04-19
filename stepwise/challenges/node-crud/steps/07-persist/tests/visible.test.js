function pass(name) { return { name, status: 'pass', duration: 0 }; }
function fail(name, error) { return { name, status: 'fail', error: String(error), duration: 0 }; }

module.exports = async function runTests({ fetch, baseUrl, restartServer }) {
  const results = [];
  const pt = await (await fetch(`${baseUrl}/items`, { method: 'POST', body: JSON.stringify({ name: 'A' }) })).json();
  await restartServer();
  const listRes = await fetch(`${baseUrl}/items`);
  const list = await listRes.json();
  results.push(list.length === 1 && list[0].id === pt.id ? pass('Survived restart') : fail('Survived restart', list.length));
  const pt2 = await (await fetch(`${baseUrl}/items`, { method: 'POST', body: JSON.stringify({ name: 'B' }) })).json();
  const list2 = await (await fetch(`${baseUrl}/items`)).json();
  results.push(list2.length === 2 ? pass('Can write after') : fail('Can write after', list2.length));
  return results;
};
