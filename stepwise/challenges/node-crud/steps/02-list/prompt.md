# Step 2: List All Items

## What you're building

A `GET /items` endpoint that returns all items as a JSON array.

## Your task

The server already has `GET /health` working and an `items` array at the top.

Add a route handler for:

```
GET /items
```

Return **HTTP 200** with the `items` array as JSON. When empty, return `[]`.
