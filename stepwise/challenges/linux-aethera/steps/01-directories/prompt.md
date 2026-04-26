# Directories and Listing

## 🗺️ Where You Are Right Now

When you open the terminal, you land in your **home folder** — your personal space on this computer. Think of it as your own room in a shared apartment. Everything inside belongs to you.

Your home folder lives at this path:

```
/home/student
```

The `/` at the start means "the very top of the entire filesystem". Every path starts from there — like how every address in a city starts from the country.

---

## 📋 Two Commands You'll Use

### `pwd` — Print Working Directory

*"Where am I right now?"*

```bash
pwd
```

It prints your current location — the full path from `/` all the way to where you are. Think of it like asking Google Maps: **"What's my current address?"**

### `ls` — List

*"What's inside this folder?"*

```bash
ls
```

It shows you everything inside your current folder — all the files and sub-folders. Like opening a drawer and looking at what's in it.

---

## 📁 Creating a New Folder

### `mkdir` — Make Directory

*"Create a new folder here."*

```bash
mkdir projects
```

This creates a new folder called `projects` inside your current location. You'll see it appear in the **Visualizer** on the left after you run it!

---

## 🎯 Your Task

Run these commands **in order** in the terminal. Watch the Visualizer on the left update as you go:

```bash
pwd
ls
mkdir projects
ls
```

After running `mkdir projects`, you should see the `projects` folder appear in the Visualizer. Compare the `ls` output before and after creating it — that's how you know it worked!

> 💡 **Tip**: After reading this guide, click **"🗺️ Visualizer"** in the tab above to see your filesystem state and run commands in the terminal.
