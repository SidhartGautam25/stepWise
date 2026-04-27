In Linux and MacOS operating systems, any file or folder that starts with a dot (`.`) is considered a **hidden file**. It won't show up in a standard `ls` or in your regular file explorer unless you specifically ask to see hidden things (like running `ls -la`).

This is a safety mechanism. Because the `.git` folder contains your *entire irreplaceable project history*, Git hides it intentionally. It doesn't want you to wander in there and accidentally delete something.

You interact with the vault **ONLY** by running `git` commands. Git acts as your librarian—you ask the librarian to fetch history or save history, but you never go into the vault yourself!
