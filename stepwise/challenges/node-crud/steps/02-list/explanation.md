The `GET /items` endpoint is profoundly fundamental. It represents the "Read" layer bridging RESTful principles over HTTP. 

When you navigate to any list of things on the internet—like your Twitter Feed or an Amazon product index—the server infrastructure is processing a massive generic `GET` query precisely like this one, pulling structures from a database, and transmitting them to your device as stringified bundles.

In this specific exercise, we are keeping things simple using an **In-Memory Cache**. By initializing a standard JavaScript array `const items = [];` inside the global Node scope, you are forcibly storing server records in **RAM** rather than a persistent hard-drive Disk block! 

<details>
<summary><b>🧠 Advanced: Text Protocols & Content-Type Headers</b></summary>
<br/>

The internet inherently operates exclusively on pure strings—technically, byte buffers. It fundamentally cannot inherently transmit "JavaScript Arrays" or "Python Dictionaries".

When you call `JSON.stringify(items)`, you are serializing RAM objects natively down into standardized UTF-8 text characters. However, simply sending strings back across the wire isn't quite enough for modern architectures. Browsers and programmatic clients like `curl` need explicitly defined Metadata to parse those strings securely. 

This is why, inside your pre-supplied `sendJson` helper function, Node natively injects a massive structural header into the HTTP outbound pipe:

```javascript
res.setHeader('Content-Type', 'application/json');
```

If you omitted this header, receiving network clients wouldn't know if you were sending an HTML page, an image, or application payload text! They would default to rendering a blank screen or a massive unformatted block of plaintext. By strictly enforcing `application/json`, you dictate explicitly to the client processor parsing the byte buffer precisely what structural decoder to run on the payload!
</details>
