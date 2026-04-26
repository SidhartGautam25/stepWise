# 📸 Taking Your First Snapshot

Arjun took a photo of his canvas. You're going to do the same — but for code.

A snapshot in Git is called a **commit**. It's a permanent record of exactly what all your files looked like at this moment.

## The two-step process

**Step 1 — Write something (your "canvas")**
```bash
echo "# Priya's Todo App" > README.md
echo "A simple todo list" >> README.md
```

**Step 2 — Check what Git sees**
```bash
git status
```
Git sees the file but hasn't saved it yet. It's in your Working Directory.

**Step 3 — Stage it (move to staging area)**
```bash
git add README.md
```
Now check status again — see how it changed?

**Step 4 — Commit (take the snapshot!)**
```bash
git commit -m "Start Priya's todo app"
```

The `-m` is your label — "why did I take this snapshot?" Be descriptive!

**Step 5 — Verify your snapshot was saved**
```bash
git status
```
"nothing to commit, working tree clean" — your snapshot is saved! 🎉

> **Run these in the terminal →**
