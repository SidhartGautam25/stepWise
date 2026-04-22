Welcome to the core of backend web development! To serve a website or an API, we need something that stays "awake" to receive incoming messages over the internet. This is exactly what an **HTTP Server** does.

HTTP (Hypertext Transfer Protocol) is the language web browsers and servers use to speak to each other. Whenever you navigate to an address like `youtube.com`, your browser is sending an HTTP Request across the ocean to a physical computer running an HTTP Server software perfectly like what we are about to build.

### Require vs Import
To spin up a server, we need the `http` module. Node.js natively provides two different systems to load external modules:
1. `require()` — The original CommonJS standard heavily used in Node.js historical archives. 
2. `import` — The modern ES Module standard used extensively in frontend React/Browser environments.

We will use the modern `require('http')` approach for this journey.

### Building `createServer`
Under the hood, Node.js provides an internal C++ binding to network sockets. When you call `http.createServer()`, Node allocates a long-running system process specifically waiting to hear an HTTP message.

```javascript
const server = http.createServer((request, response) => {
  response.end("Hello World!");
});
```

### The Concept of a Port
Servers don't just "listen" broadly to the whole internet. Physical computers have thousands of background network operations running simultaneously (WiFi connections, bluetooth, background app syncs, Spotify streams). 

To ensure our HTTP messages don't accidentally get handed to the Spotify background streamer, network protocols attach numeric "doors" called **Ports**. We assign our server to a specific Port (like `3000`), so when traffic hits Port `3000`, the operating system immediately knows it belongs to us! You activate this by calling `server.listen(3000)`.

### Your Task
1. Create a `server.js` file.
2. `require` the built-in `http` module.
3. Call `http.createServer()` and attach a callback function that simply calls `response.end("Hello StepWise!")`
4. Call `.listen(3000)` on your newly created server!
