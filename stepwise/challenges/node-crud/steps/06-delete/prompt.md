# Step 6: Delete an Item

## Your task

Add:
```
DELETE /items/:id
```

1. Find item by ID. Return 404 if not found.
2. Remove from `items` array (e.g., using `splice()`).
3. Return **HTTP 204** with *no body*:
```js
res.writeHead(204);
res.end();
```
