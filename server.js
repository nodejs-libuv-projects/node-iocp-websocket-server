require("dotenv").config(); // Load .env variables

const express = require("express");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const crypto = require("crypto");
const fs = require("fs");
const dns = require("dns");
const util = require("util");

const lookupAsync = util.promisify(dns.lookup); // Convert DNS lookup to Promise

const app = express();
const PORT = process.env.PORT || 3000;
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Serve the frontend (index.html)
app.use(express.static("public"));

// WebSocket Connection Handling
wss.on("connection", (ws) => {
  console.log("🟢 New WebSocket client connected.");

  ws.send("✅ Connected to WebSocket Server!");

  ws.on("message", (message) => {
    console.log(`📩 Received: ${message}`);

    switch (message.toString()) {
      case "hash":
        performHash(ws);
        break;
      case "file":
        performFileRead(ws);
        break;
      case "dns":
        performDnsLookup(ws);
        break;
      default:
        ws.send(`⚠️ Unknown command: ${message}`);
    }
  });

  ws.on("close", () => {
    console.log("🔴 WebSocket client disconnected.");
  });
});

// Perform CPU-heavy hashing
function performHash(ws) {
  const start = Date.now();
  crypto.pbkdf2("password", "salt", 100000, 64, "sha512", () => {
    const time = Date.now() - start;
    ws.send(`🔢 Hashing completed in ${time}ms`);
  });
}

// Perform async file reading
function performFileRead(ws) {
  const start = Date.now();
  fs.readFile("largefile.txt", "utf8", (err, data) => {
    if (err) return ws.send(`❌ File read error: ${err.message}`);
    const time = Date.now() - start;
    ws.send(`📂 File read in ${time}ms (Size: ${data.length})`);
  });
}

// Perform DNS lookup
function performDnsLookup(ws) {
  const start = Date.now();
  lookupAsync("google.com")
    .then((result) => {
      const time = Date.now() - start;
      ws.send(
        `🌎 DNS Lookup (google.com) → ${JSON.stringify(
          result
        )} (Time: ${time}ms)`
      );
    })
    .catch((err) => ws.send(`❌ DNS lookup error: ${err.message}`));
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on PORT ${PORT}`);
});
