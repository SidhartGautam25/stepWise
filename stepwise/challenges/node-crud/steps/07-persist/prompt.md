# Step 7: Persist Data to Disk 💾

## What you're building

The absolute final boss of the architecture: **A File System Datastore**. 

Thus far, absolutely all elements mapped dynamically inside the `items` array exist solely inside transient RAM allocations dynamically mapped by V8. If an administrator literally accidentally closes the terminal (or the VM node natively crashes), 100% of the active database state instantaneously strictly disintegrates into the void.

You will implement an incredibly resilient state-saving mechanism dynamically routing RAM elements backwards onto the literal physical hard drive disk block!

## Your mission

Open your local `server.js` file.

At the very top of your environment block natively, load the foundational Native Node module `fs`.

```javascript
const fs = require('fs');
```

Your objective is to:
1. Dynamically rewrite your structural `POST`, `PUT`, and `DELETE` paths natively!
2. Immediately succeeding perfectly executing any standard Memory state mutating change, you must securely execute a physical drive write natively:
```javascript
fs.writeFileSync('database.json', JSON.stringify(items));
```
3. Whenever your application boots up, explicitly read the `database.json` block natively inside the engine initialization so memory state intrinsically safely survives explicit process restarts!

<details>
<summary><b>🛠️ Need a hint on File System instantiation?</b></summary>
<br/>
Because you literally must guarantee data perfectly safely transfers from Disk to Memory directly on start-up natively, you utilize safe explicit block logic!

```javascript
+ const fs = require('fs');
  let items = [];
  
  // Safely execute synchronous recovery natively
+ if (fs.existsSync('database.json')) {
+   items = JSON.parse(fs.readFileSync('database.json', 'utf-8'));
+ }
  
+ function saveDB() {
+   fs.writeFileSync('database.json', JSON.stringify(items));
+ }
```
You must simply map the `saveDB()` native explicitly before `res.end()` inside your Create/Update/Delete blocks recursively natively.
</details>

## 🔬 Local Test Execution

You must fully orchestrate complete architecture shutdowns dynamically!

Boot your Node environment:
```bash
PORT=3001 node server.js
```

Emulate pushing an object natively:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"name": "Survived Shutdown"}' http://localhost:3001/items
```

Strictly manually kill your server via `CTRL+C`!
Re-boot the server magically natively: `PORT=3001 node server.js`

Check the `GET` pipeline natively:
```bash
curl http://localhost:3001/items
```
If you see the survived array intact, explicitly execute evaluate check:
```bash
npx stepwise test
```
