# 📁 Turning Ideas Into Reality: The Repository

Kavya just realised that she needs four things to save her project from disaster:
1. A way to take **Snapshots**
2. **Labels** for each snapshot
3. A **Timeline** to scroll through
4. A **Shared Place** for her team

Git is the tool that gives her exactly these four things. Every command maps to one of her ideas.
To get started, she needs a safe, **hidden vault** where Git can store all of this.

But Git doesn't watch your entire computer. You have to tell it *exactly* which folder to watch. 

### What is `git init`?

When you run `git init`, you are saying: *"Git, I want you to start watching this folder. Please build your hidden vault right here."*

### And what is the `.git` folder?

It *is* the vault. When you run `git init`, Git creates a special, invisible folder named `.git`. Every snapshot you ever take, every branch you ever make, every piece of history for this project—it all lives safely inside that `.git` folder.

If you delete that folder, you delete your entire history.
