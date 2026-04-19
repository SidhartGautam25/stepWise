# Step 7: Persist Data to Disk

Instead of losing data on restart, write to `items.json`.

1. **Load on startup**: Use `fs.existsSync` and `fs.readFileSync(DATA_FILE)` to initialize the `items` array.
2. **Save on mutate**: Call `fs.writeFileSync` after create, update, and delete.
