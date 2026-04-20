# Step 5: Update an Item 🔄

## What you're building

A data mutation endpoint: `PUT /items/:id`. This route natively coordinates an incredibly advanced orchestration: intercepting a dynamic route ID mapping, reading a payload stream from the request blocks simultaneously, entirely replacing the matched entity natively inside the system memory array, and responding symmetrically!

## Your mission

Open your local `server.js` file.

Inside your core loop, construct a dynamically matched extraction for `PUT` protocols targeting the abstract `/items/` directory parameters.

```http
PUT /items/95191
```
*(Combined with a fully stringified JSON body transmission describing the update!)*

Your objective is to natively:
1. Dynamically identify the ID target parameters from the suffix.
2. Read the body-buffer streams chunk-by-chunk natively (just like you did in `POST`).
3. Find the identically matched underlying Object natively in the `items` array.
4. If missing, strictly emit **HTTP 404 Not Found**.
5. If found, rigidly re-write all attributes inside the matched Object utilizing Native JavaScript Object spreading parameters, perfectly maintaining its original Identifier context.
6. Acknowledge and transmit the uniquely transformed Object immediately backwards as **HTTP 200 OK**.

<details>
<summary><b>🛠️ Need a hint on safely rewriting data references natively?</b></summary>
<br/>
Because you are interacting flawlessly with Arrays natively bound in Node RAM allocations, mutating an element correctly is completely synchronous natively!

```javascript
+   if (method === 'PUT' && url.startsWith('/items/')) {
+     const id = url.split('/')[2];
+     
+     // Abstract the exact index location
+     const index = items.findIndex(i => i.id === id);
+     if (index === -1) {
+       return sendJson(res, 404, { error: 'Item not found' });
+     }
+ 
+     let bodyText = '';
+     req.on('data', chunk => { bodyText += chunk.toString(); });
+     req.on('end', () => {
+       const parsed = JSON.parse(bodyText);
+       
+       // Force rewrite maintaining ID rigidly natively
+       items[index] = { ...items[index], ...parsed, id };
+       
+       return sendJson(res, 200, items[index]);
+     });
+     return;
+   }
```
</details>

## 🔬 Local Test Execution

You must fully emulate data manipulation workflows locally to ensure your syntax natively compiles updates!

Boot your Node environment:
```bash
PORT=3001 node server.js
```

Emulate pushing an object into the cache to successfully generate an ID:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"name": "Initial Data"}' http://localhost:3001/items
```

Copy the natively generated `id` UUID context from the terminal, and structurally update it:
```bash
curl -X PUT -H "Content-Type: application/json" -d '{"name": "Updated Data 🚀"}' http://localhost:3001/items/COPIED_ID
```

When completely verified, lock securely natively:
```bash
npx stepwise test
```
