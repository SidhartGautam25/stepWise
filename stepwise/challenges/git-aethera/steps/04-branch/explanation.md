Remember the 3rd disaster in Kavya's story? When she and Rohan worked on different features, and Rohan accidentally overwrote all of Kavya's work?

Branches completely solve the collaboration problem. 

If Kavya creates a branch called `kavya/search` and Rohan creates a branch called `rohan/filters`, they can both code, experiment, and take snapshots as much as they want. Their work is saved in completely isolated timelines inside the same `.git` vault.

When they are both finished, Git has a magical tool called a `merge`. Git will analyze Rohan's branch and Kavya's branch, look at exactly what lines of code each of them added, and intelligently stitch the two timelines together into a single, perfectly unified `main` timeline. 

Nobody overwrites anyone anymore.
