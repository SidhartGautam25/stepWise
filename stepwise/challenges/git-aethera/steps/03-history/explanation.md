When you run `git log --oneline`, you'll notice a random-looking 7-character string next to each message, like `9g8h7i6` or `f4e5d6c`.

This is called a **hash ID**, and it is crucial to Git.

A hash is essentially a unique barcode for that specific snapshot. Because every single commit ever made gets a totally unique, un-spoofable ID, you can do things like:
- Show me exactly what changed in `f4e5d6c`
- Rewind my entire project back to the moment `a1b2c3d` was taken
- Compare the code in `9g8h7i6` with the code in `a1b2c3d`

Git uses complex math (SHA-1 hashing) to guarantee that if even *one comma* in *one file* in your project changes, the snapshot gets a completely different ID. This is why Git is unbreakable—it is mathematically impossible to secretly tamper with a commit after it is taken.
