# Step 1: Boot the Server

## What you're building

An HTTP server that responds to a health check. This is the foundation every API needs — a way to know it's running.

## Your task

Open `server.js`. The file has a `sendJson` helper and the server skeleton already set up.

Add a route handler for:

```
GET /health
```

It must return **HTTP 200** with this JSON body:

```json
{ "status": "ok", "version": "1.0.0" }
```

## How to test locally

Start the server:
```bash
PORT=3001 node server.js
```

In another terminal:
```bash
curl http://localhost:3001/health
```

When ready, submit:
```bash
npx stepwise test
```
