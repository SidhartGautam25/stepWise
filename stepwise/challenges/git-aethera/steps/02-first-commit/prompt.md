# 📸 Your First Snapshot

Kavya is ready to take her first real snapshot. Let's do it together.

## What you're doing

You're going to:
1. Write something (your "canvas")
2. See what Git notices
3. Choose what to include in the snapshot (staging)
4. Take the snapshot (commit)

## Do it step by step

```bash
# Create Kavya's first file
echo "# Kavya's Todo App" > README.md
echo "A simple app to track tasks." >> README.md
```

**Now check what Git sees:**
```bash
git status
```

Git will say the file is "untracked" — it can see it exists but hasn't been asked to watch it yet.

**Put it in the bag (staging):**
```bash
git add README.md
```

**Check status again — see the difference:**
```bash
git status
```

Now it says "Changes to be committed" — the file is in the bag, ready for the snapshot.

**Take the snapshot:**
```bash
git commit -m "Start Kavya's todo app"
```

**Verify — your snapshot is saved:**
```bash
git status
```

"nothing to commit, working tree clean" — the snapshot is taken. It's permanent. 🎉

> **Run these in order in the terminal →**
