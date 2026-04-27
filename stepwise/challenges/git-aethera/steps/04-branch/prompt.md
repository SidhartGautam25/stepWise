# 🔀 Try dark mode — safely on a branch

Kavya remembers her "Undo Spiral disaster". Remember when she tried to add dark mode, broke her app, hit Ctrl+Z 40 times, and lost everything?

This time, she will use a **Branch**.

A branch is like a parallel universe. When she creates a branch, Git instantly duplicates her *entire project* into a new timeline. She can code, experiment, and break everything in this parallel universe, and the main universe (called `main`) will be completely unaffected.

In this step, we will:
1. Quickly run a setup command to get `main` ready.
2. Tell Git to create and immediately switch to a new branch for her dark mode experiment.
3. Pretend to edit code and take a snapshot on the *new* branch.
4. Do the magic trick: tell Git to switch us back to `main`, and watch the experimental code instantly disappear to safety.

### What is `git checkout`?

Think of `git checkout` as a time machine / teleporter.
If you say `git checkout main`, the Git librarian instantly reaches into the `.git` vault, pulls out the exact state of the `main` branch, and replaces all the files in your folder so they perfectly match `main`.
If you say `git checkout feature/darkmode`, the librarian instantly rips out those files and replaces them with your dark mode files.

---

> **💻 Time to branch out!**
>
> 1. Open the **Visualizer**. 
> 2. Follow the checklist in the **Git Terminal** above your code to create a branch, write an experiment, and switch branches. Watch the `README.md` length change instantly depending on which branch you are on!
