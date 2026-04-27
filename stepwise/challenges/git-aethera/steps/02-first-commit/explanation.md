Why not just pack the bag and take the snapshot in one step? Why make us type `git add` and *then* `git commit`?

Imagine you just fixed two different bugs in your app across 5 different files. 

If you snapshot everything at once, your label would have to be "Fixed the login bug AND fixed the color bug". That's messy. Five months from now, if the login system breaks again, it's hard to track down *exactly* which snapshot caused it if the snapshots contain unrelated changes.

The Staging Area (`git add`) gives you power. You can say:
*"Put only the 2 files related to the login bug in the bag. Commit. Label: Fixed login."*
*"Now put the 3 files related to color in the bag. Commit. Label: Fixed color bug."*

You get a perfectly organized history, even if your actual coding process was chaotic.
