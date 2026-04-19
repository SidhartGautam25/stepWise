# Step 3: Create an Item

## Your task

Add a route handler for:

```
POST /items
Content-Type: application/json

{ "name": "Widget", "price": 9.99 }
```

It must:
1. Read the body with `readBody(req)` (already provided).
2. Generate ID: `randomUUID()`.
3. Construct item: `{ id, ...body, createdAt: new Date().toISOString() }`.
4. Push to `items`.
5. Return **HTTP 201** with the item.
