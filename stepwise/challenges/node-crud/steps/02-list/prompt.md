# Step 2: List All Items 📦

## What you're building

A standard REST architectural endpoint: `GET /items`. This path forms the foundation of any application's Read operations, securely returning all resource records requested over the network as a stringified JSON array.

## Your mission

Open your local `server.js` file.

You will see that the `GET /health` route we built previously has been carried over successfully. You will also notice an empty Javascript array initialized at the top of the file: `const items = [];`.

Your objective is to intercept a specific network payload:

```http
GET /items
```

If you catch this precisely matching path, immediately respond with a standard **HTTP 200 OK** and stream the `items` array back to the client natively. 

If the in-memory array is completely empty, it must correctly return `[]`.

<details>
<summary><b>🛠️ Need a hint on serializing data natively?</b></summary>
<br/>
Because you are returning an array structure over an HTTP text protocol, you can't just pass the raw Javascript array object to `sendJson`. Javascript arrays exist solely inside your server's RAM allocation! 

The pre-built `sendJson` helper automatically serializes your inputs internally, but you still need to capture the exact route logic.

```javascript
+ if (method === 'GET' && url === '/items') {
+   return sendJson(res, 200, items);
+ }
```
</details>

## 🔬 Local Test Execution

You should heavily verify your data transmission logic locally before pushing it to the evaluator!

Boot your Node environment:
```bash
PORT=3001 node server.js
```

Request the resource using `curl`:
```bash
curl http://localhost:3001/items
```

If your terminal prints a clean `[]`, you've conquered the step! Lock in your progress:
```bash
npx stepwise test
```
