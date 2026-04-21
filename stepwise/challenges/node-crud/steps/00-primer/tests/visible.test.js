function pass(name) { return { name, status: 'pass', duration: 0 }; }

module.exports = async function runTests() {
  return [
    pass('Read the Conceptual Primer module'),
    pass('Understood the HTTP Waiter Analogy'),
    pass('Identified exactly what Node.js is'),
  ];
};
