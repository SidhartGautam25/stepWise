# 🌿 Parallel Worlds — Branching

First, open the **Visual Guide** to understand branches — then practice in the terminal below.

## Practice in the terminal

```bash
# Set up a starting point
git init
echo "# Kavya's Todo App" > README.md
git add . && git commit -m "Working todo app"

# Create and switch to a dark mode branch
git checkout -b feature/darkmode

# Experiment freely — this doesn't touch main
echo "dark-mode=true" >> README.md
git add . && git commit -m "Experiment: add dark mode setting"

# See all branches
git branch

# Switch back to main — experiment disappears from your files!
git checkout main
cat README.md

# The experiment is safe on its branch
git checkout feature/darkmode
cat README.md
```

> **Start with the Visual Guide, then practice below →**
