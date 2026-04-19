# Step 4: Get Item by ID

## Your task

Add a route handler for:
```
GET /items/:id
```

1. Extract ID via `parseItemId(url, '/items')`.
2. Find in `items`.
3. Return **HTTP 200** with item, or **HTTP 404** with `{ "error": "Not found" }`.
