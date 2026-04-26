# 📜 Reading Your History

This is Kavya's favourite part. She can finally see the *story* of her project — all the problems she solved, all the features she added — in clean, labelled order.

Let's build a short history first, then explore it.

## Build 2 more snapshots

```bash
# Add Kavya's first feature
echo "function addTask(text) { console.log('Added:', text); }" > app.js
git add app.js
git commit -m "Add addTask function"

# Add another feature
echo "function deleteTask(id) { console.log('Deleted:', id); }" >> app.js
git add app.js
git commit -m "Add deleteTask function"
```

## Now read the timeline

```bash
git log --oneline
```

You'll see:
```
9g8h7i6 Add deleteTask function
f4e5d6c Add addTask function
a1b2c3d Start Kavya's todo app
```

**That's it.** That's the timeline she always wished she had. Every snapshot. Every label. In order. Forever.

No more folder of doom. No more "which version was working?"

```bash
# Want even more detail on one snapshot?
git show HEAD
```

> **Run these in the terminal →**
