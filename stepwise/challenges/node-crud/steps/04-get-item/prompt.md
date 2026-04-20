# Step 4: Get Item by ID 🔍

## What you're building

A dynamically interpolated `GET` route mapping: `GET /items/:id`. This endpoint requires parsing abstract identifiers natively out of the URL stream before routing the logic back to the caching subsystem!

## Your mission

Open your local `server.js` file.

You will see the creation paradigm we built in Step 3. We now must support extracting the unique records we mapped into our cache back out!

Add a dynamic logic block natively matching requests that **start with** `/items/` and belong to the `GET` verb.

```http
GET /items/48194
```

Your objective is to:
1. Extract the trailing ID suffix off the incoming request URL array.
2. Query the active `items` RAM allocation strictly for a uniquely matching `id` parameter.
3. If natively found: serialize the object down and fire an **HTTP 200 OK**.
4. If missing: fire an **HTTP 404 Not Found** containing an explicitly standardized error JSON payload: `{ "error": "Item not found" }`.

<details>
<summary><b>🛠️ Need a hint on abstract string extraction?</b></summary>
<br/>
High-level engines like Express or Native Next.js parse URLs implicitly into `.params.id` dictionaries.

Because you are touching the pure Native standard library, `url` strictly exposes a raw string (e.g. `"/items/41452"`). You must manually slice this string allocation apart safely!

```javascript
+   if (method === 'GET' && url.startsWith('/items/')) {
+     const id = url.split('/')[2];
+     const item = items.find(i => i.id === id);
+     
+     if (!item) {
+       return sendJson(res, 404, { error: 'Item not found' });
+     }
+     
+     return sendJson(res, 200, item);
+   }
```
</details>

## 🔬 Local Test Execution

You should heavily inject parameters sequentially recursively locally!

Boot your Node environment:
```bash
PORT=3001 node server.js
```

Emulate pushing an object into the cache to generate an ID:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"name": "Dynamic Routes"}' http://localhost:3001/items
```

Copy the `id` from the output, and test the extraction mapping:
```bash
curl http://localhost:3001/items/COPIED_ID
```

If it successfully returns the object matching the ID, lock in your progress natively:
```bash
npx stepwise test
```
