In the previous step, your HTTP server returned "Hello StepWise!" to any traffic that hit it. Whether a user visited `localhost:3000/cats`, `localhost:3000/login`, or `localhost:3000/profile`, the exact same message was returned!

In a real functional ecosystem, different URLs represent completely different physical actions.
- A request to `/api/users/1` should fetch user data.
- A request to `/api/tweets` should return a list of tweets.

This core architectural concept is called **Routing**. 

### Connecting the Endpoint
The `http.createServer` callback fundamentally contains two critical arguments: the incoming `request` and the outbound `response`.

The incoming `request` object contains exactly what the user was asking for.
Specifically, `request.url` contains the path (e.g. `/api/todos`), and `request.method` contains the HTTP Action (e.g., `GET`, `POST`, `DELETE`).

### Your Task
Upgrade your `server.js` file to implement logical routing.

1. Keep your existing `http.createServer` logic.
2. Inside the callback function, add an `if` statement measuring the request path!
3. If the user hits `req.url === '/ping'`, return `res.end("pong")`.
4. If they hit any other path, return `res.end("Not Found")`.
