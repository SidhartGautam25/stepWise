Routing is arguably the absolute most complex primitive operation an HTTP server fundamentally executes under immense scale. As incoming structural streams rapidly fluctuate contextually based on end-user inputs (`/items/uuid-1`, `/items/uuid-2`), the server cannot inherently hardcode millions of finite logic gates.

Modern frameworks explicitly mask routing complexity utilizing RegEx mapping parameters (`express.get('/items/:id')`). Here, you are fundamentally seeing exactly how those routers manipulate the pure standard library: evaluating substring prefix evaluations natively!

<details>
<summary><b>🧠 Advanced: Routing Tries and Regex Matchers</b></summary>
<br/>

While slicing string arrays (`url.split('/')`) solves the dynamic resolution routing for a beginner's tutorial context, it does not scale to architecture-level systems natively!

If your server receives 10,000 requests a second, natively forcing V8 JavaScript to string-allocate standard Array blocks recursively destroys garbage-collection cycles immensely, driving your Node process CPU limits directly to 100%!

In incredibly optimized environments (like `Fastify`), standard routing is not handled by dynamic Arrays or even native `Regex` evaluations in a loop! Instead, they compile their routes massively into heavily-optimized **Radix Tries**. 

A Radix Trie computes route lookups exponentially faster by transforming the request strings into prefix trees at process start-up. Fastify traverses these Radix Trie pointer structures explicitly matching `/items/` nodes natively before interpreting the suffix as dynamic variable data! That is precisely what empowers frameworks to achieve millions of routings per second natively!
</details>
