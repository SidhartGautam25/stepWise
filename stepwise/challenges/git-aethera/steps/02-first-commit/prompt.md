# 📸 Take Kavya's First Snapshot

Kavya is ready to take her first real snapshot. The vault is set up, but it's currently empty.

There is a strict, two-step process to taking a snapshot in Git. You don't just say "snap everything". 

### The 3 Zones of Git

Imagine Kavya is packing for a trip. Git organizes her work loosely into three areas:

🗄️ **Your Room (Working Directory):** This is all her files. Some might be changed, some might be new. It's everything you see in your folder.
🛏️ **Your Bag (Staging Area):** She doesn't pack her whole room for the trip. She chooses *exactly* which items are relevant right now and puts them in the bag.
📸 **The Photo (The Commit):** Once the bag is packed perfectly, she takes a photograph of the bag's exact contents. This photo goes permanently into the vault!

### 1. Packing the Bag (`git add`)
Before you take a photograph, you have to decide exactly what goes into the frame. 
When Kavya creates a file, she has to explicitly put it in the bag using `git add <filename>`.

### 2. Taking the Shot (`git commit`)
Once everything she wants is in the bag, she tells Git to seal the bag, take the snapshot, and put it in the vault. This is called a **commit**. A commit ALWAYS requires a short message (`-m "label"`) explaining what she did, so she can understand the history later.

---

### What `git status` tells us

`git status` is Kavya's best friend. It simply tells her:
1. What files are currently in the bag (Staged / "Changes to be committed")
2. What files she changed but *haven't* been put in the bag yet (Untracked)

> **💻 Time to take the first snapshot!**
>
> 1. Make sure to use the **Split View** below to see the visual changes as you type.
> 2. Follow the checklist in the **Git Terminal** above your code. 
> 3. After every edit and every `git add`, run `git status`. Watch how Git categorizes the files before and after they go into the bag.
