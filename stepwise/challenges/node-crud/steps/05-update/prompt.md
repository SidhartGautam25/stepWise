# Step 5: Update an Item

## Your task

Add:
```
PUT /items/:id
```

1. Find item by ID. Return 404 if not found.
2. Read body with `readBody(req)`.
3. Merge properties: `{ ...original, ...body, id: original.id, createdAt: original.createdAt }`.
4. Return **200** with updated item.
