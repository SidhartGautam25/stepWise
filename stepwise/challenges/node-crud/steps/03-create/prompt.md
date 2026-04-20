# Step 3: Create an Item 🆕

## What you're building

A `POST /items` REST endpoint. This route handles incredibly complex Data Ingestion logic natively. You will receive dynamic JSON from an external client pushing into your server, construct a structured data record, give it an identity UUID, and lock it into system memory!

## Your mission

Open your local `server.js` file.

Look through the file and add a route block intercepting the HTTP specification:

```http
POST /items
```

Every network packet arriving at this path contains a stringified body resembling:
```json
{ "name": "Learn Data Buffers" }
```

Your objective is to:
1. Natively read the raw HTTP string off the Network Stream bytes!
2. Parse that text specifically down into a Javascript constant.
3. Automatically generate a uniquely standardized `id` (e.g. using `Date.now().toString()`).
4. Push the augmented identity record into the cache.
5. Return the newly minted entity back mapped to a **HTTP 201 Created** status!

<details>
<summary><b>🛠️ Need a hint on ingesting raw Network Buffers natively?</b></summary>
<br/>
Because you are completely abstracted from express body-parsers, you have to read the raw TCP streaming payload dynamically into application memory bytes.

The `req` array natively exposes a stream event system. You simply listen for chunks of bytes falling sequentially out of the open port, compile them string together, and evaluate when it ends!

```javascript
+   if (method === 'POST' && url === '/items') {
+     let bodyText = '';
+     
+     // Listen for falling streaming bytes
+     req.on('data', chunk => {
+       bodyText += chunk.toString();
+     });
+ 
+     // Fire process once transmission stream halts
+     req.on('end', () => {
+       const parsed = JSON.parse(bodyText);
+       const newItem = { id: Date.now().toString(), ...parsed };
+       items.push(newItem);
+       
+       // A HTTP 201 communicates RESTful Creation
+       return sendJson(res, 201, newItem);
+     });
+     return;
+   }
```
</details>

## 🔬 Local Test Execution

You should heavily verify chunk streaming locally.

Boot your Node environment:
```bash
PORT=3001 node server.js
```

Emulate a client injecting a POST Payload:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"name": "StepWise Payload"}' http://localhost:3001/items
```

If it successfully returns the object coupled with a raw ID string, you have conquered the step:
```bash
npx stepwise test
```
