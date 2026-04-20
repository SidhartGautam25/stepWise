# Step 6: Delete an Item 🗑️

## What you're building

The final primitive verb in the standard CRUD lifecycle natively: `DELETE /items/:id`. This route completely permanently evicts an element from the memory index blocks natively.

## Your mission

Open your local `server.js` file.

Inside your core architectural logic, construct a route dynamically evaluating the HTTP `DELETE` verb.

```http
DELETE /items/34918
```

Your objective is to:
1. Extract the `id` from the abstract URL natively exactly like previously.
2. Locate the corresponding Object index natively inside the mapped `items` array.
3. If missing rigidly throw **HTTP 404 Not Found**.
4. If found, structurally completely evict the element from the Javascript Array natively.
5. Successfully transmit backwards a strictly standard **HTTP 204 No Content** architecture!

<details>
<summary><b>🛠️ Need a hint on safely removing elements natively?</b></summary>
<br/>
Because you are mutating a mapped cache array internally, you must splice the memory allocation out using standard native methods!

```javascript
+   if (method === 'DELETE' && url.startsWith('/items/')) {
+     const id = url.split('/')[2];
+     
+     // Evaluate memory block natively
+     const index = items.findIndex(i => i.id === id);
+     if (index === -1) {
+       return sendJson(res, 404, { error: 'Item not found' });
+     }
+ 
+     // Safely execute a 1-element strict memory destructive splice mapping
+     items.splice(index, 1);
+     
+     // HTTP 204 indicates the request was perfectly successful but absolutely no descriptive payload body remains to be transmitted!
+     res.statusCode = 204;
+     return res.end();
+   }
```
</details>

## 🔬 Local Test Execution

Verify completely locally!

Boot your Node environment:
```bash
PORT=3001 node server.js
```

Emulate pushing an object natively:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"name": "Temporary Target"}' http://localhost:3001/items
```

Execute a destruction transmission payload dynamically:
```bash
curl -v -X DELETE http://localhost:3001/items/COPIED_ID
```
*(Passing `-v` to `curl` will natively let you verify the HTTP 204 Status explicitly!)*

Once verified cleanly natively:
```bash
npx stepwise test
```
