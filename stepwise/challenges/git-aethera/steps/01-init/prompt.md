# 🔧 Starting a Repository

You know the idea. Now let's do it for real.

Kavya is starting fresh. She's going to create her todo app **the right way this time** — with Git watching from day one.

## Step 1 — Create the project folder

```bash
mkdir todo-app
cd todo-app
```

## Step 2 — Tell Git to start watching

```bash
git init
```

Git will say:
```
Initialized empty Git repository in /home/student/todo-app/.git/
```

That `.git` folder Git created? That's where **all your snapshots will live**. Every commit you ever make goes in there. It's your entire project history in one hidden folder.

## Step 3 — See that it worked

```bash
ls -la
```

You'll see the `.git` folder. That's the proof Git is now watching this folder.

> **Run these in the terminal on the right →**
