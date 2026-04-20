Modern backend engineering in Node.js rarely involves writing the raw HTTP standard library logic yourself in production (you'd typically abstract this away using powerful frameworks like Express, Fastify, or NestJS). 

However, explicitly understanding **how the engine routes data under the hood** is an absolutely essential rite of passage for elite engineering. 

A `/health` or "health check" endpoint is universally the absolute first route built in any service. Heavy orchestration cloud environments (like Kubernetes Pods, AWS Application Load Balancers, or StepWise's own local CLI evaluator infrastructure!) aggressively use this specific route to ping your server every few seconds. 

If it returns a `200 OK`, the orchestration load balancer dynamically flags your server as alive and intelligently routes millions of concurrent network packets to your process. If it fails or times out, the server is marked as "dead", cordoned off from the wider internet, and gracefully restarted. 

In this step, you are setting up the foundational pulse of your application.

<details>
<summary><b>🧠 Advanced: Understanding the Node Event Loop and HTTP Sockets</b></summary>
<br/>

When you call `http.createServer()`, Node.js does not spin up a multi-threaded web server like Apache. Instead, it natively creates an **Event Emitter** binding deep inside the V8 JavaScript engine.

Under the hood, Node leverages a highly optimized C++ library called `libuv` to open a raw TCP socket on your operating system. When a network packet hits the port you specified (e.g., `3001`), the operating system parses the TCP transmission, and `libuv` dynamically injects the HTTP payload into your JavaScript Event Loop via the **Callback Queue**. 

This is why your `(req, res)` function looks like a callback! The single-threaded JavaScript engine executes your synchronous JavaScript sequentially. The moment you execute `res.end()`, Node translates your objects back into raw byte-buffers, passing them back to `libuv`, which fires the transmission back across the open TCP socket to the client!
</details>
