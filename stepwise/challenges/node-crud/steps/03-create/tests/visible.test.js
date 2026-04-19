function pass(name) { return { name, status: 'pass', duration: 0 }; }
function fail(name, error) { return { name, status: 'fail', error: String(error), duration: 0 }; }

module.exports = async function runTests({ fetch, baseUrl }) {
  const results = [];
  let res = await fetch(`${baseUrl}/items`, { method: 'POST', body: JSON.stringify({ name: 'Widget' }) });
  results.push(res.status === 201 ? pass('POST 201') : fail('POST 201', res.status));
  const item = await res.json();
  results.push(typeof item.id === 'string' ? pass('Has ID') : fail('Has ID', typeof item.id));
  results.push(item.name === 'Widget' ? pass('Saved name') : fail('Saved name', item.name));
  results.push(typeof item.createdAt === 'string' ? pass('Has createdAt') : fail('Has createdAt', typeof item.createdAt));
  const list = await (await fetch(`${baseUrl}/items`)).json();
  results.push(list.length === 1 && list[0].id === item.id ? pass('Appears in list') : fail('Appears in list', 'no match'));
  return results;
};
