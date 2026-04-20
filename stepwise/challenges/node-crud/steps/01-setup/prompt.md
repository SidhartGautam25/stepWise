# Step 1: Boot the Server 🚀

## What you're building

An HTTP server that responds to a fundamental **System Health Check**. This is the absolute core foundation every backend API needs before writing complex logic — a way for cloud orchestration architectures to know your application is alive and receiving network traffic.

## Your mission

Open your local `server.js` file.

Inside the file, you will find a highly optimized `sendJson` helper pre-built for you, and a standard Node.js server lifecycle skeleton.

Your objective is to natively intercept a network request specifically matching a `GET` protocol directed at the `/health` path.

```http
GET /health
```

If you catch this request, immediately intercept the transmission and return a standard **HTTP 200** status code containing the exact JSON payload payload below:

```json
{ 
  "status": "ok", 
  "version": "1.0.0" 
}
```

<details>
<summary><b>🛠️ Need a hint on how to do this natively?</b></summary>
<br/>
Because you aren't using Express, you have to directly access the `method` and `url` variables off the native Node `req` (Request) object object. You can use standard `if` statements to route the request:

```javascript
  if (method === 'GET' && url === '/health') {
    return sendJson(res, 200, { status: 'ok', version: '1.0.0' });
  }
```
</details>

## 🔬 Local Test Execution

You should always verify your logic locally before committing the evaluation payload!

Boot your Node environment:
```bash
PORT=3001 node server.js
```

In a completely separate terminal window, manually ping your server using `curl`:
```bash
curl http://localhost:3001/health
```

If it instantly responds with your JSON, you've conquered the step! Lock in your progress by executing:
```bash
npx stepwise test
```
