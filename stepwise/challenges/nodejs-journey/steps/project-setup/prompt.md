Behind every modern Node.js application is a quiet, unassuming file called `package.json`. 

You can think of `package.json` as the **ID Card** and **Blueprint** of your project. It tells the Node.js environment what the project is named, who built it, and crucially, what external packages (dependencies) the project needs to run.

### Understanding NPM and Dependencies
Node.js ships with a tool called `npm` (Node Package Manager). Whenever you install a third-party library to handle databases, sending emails, or parsing dates, `npm` writes the record of that installation straight into your `package.json`.

Without a `package.json`, your server wouldn't know how to track its own dependencies, causing the code to crash when another developer tries to run it on their machine!

### Your Task
Initialize a valid `package.json` file in the root of your workspace!

1. Create a `package.json` file.
2. Inside that file, create a valid JSON object.
3. Give your project a `"name"` property set to `"todo-api"`.
4. Give it a `"version"` property set to `"1.0.0"`.

If you get stuck, run `npm init -y` inside your terminal, which magically generates this exact file for you!
