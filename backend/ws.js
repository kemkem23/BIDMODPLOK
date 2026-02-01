const WebSocket = require("ws");

let wss;
const clients = new Set();
const HEARTBEAT_INTERVAL = 30000;

// --- Throttled broadcast system ---
// Instead of sending every mutation instantly to 2000 clients,
// we batch broadcasts by type and flush at a fixed interval.
// This prevents the event loop from being overwhelmed when
// multiple mutations happen in quick succession.

const BROADCAST_INTERVAL_MS = 150; // flush every 150ms (< human perception threshold)
const pendingBroadcasts = new Map(); // type -> data (latest wins)
let flushTimer = null;

function startFlushTimer() {
  if (flushTimer) return;
  flushTimer = setInterval(() => {
    if (pendingBroadcasts.size === 0) return;

    // Build all messages to send
    const messages = [];
    for (const [type, data] of pendingBroadcasts) {
      messages.push(JSON.stringify({ type, data }));
    }
    pendingBroadcasts.clear();

    // Send to all clients - use a single iteration
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        // Check backpressure: skip clients with large send buffers
        if (client.bufferedAmount > 65536) continue;
        for (const msg of messages) {
          client.send(msg);
        }
      }
    }
  }, BROADCAST_INTERVAL_MS);
}

function initWebSocket(server) {
  wss = new WebSocket.Server({
    server,
    perMessageDeflate: {
      // Enable per-message compression for large payloads
      // This reduces bandwidth significantly for JSON messages
      zlibDeflateOptions: { chunkSize: 1024, memLevel: 7, level: 3 },
      zlibInflateOptions: { chunkSize: 10 * 1024 },
      threshold: 256, // only compress messages > 256 bytes
    },
    maxPayload: 64 * 1024, // 64KB max incoming message
  });

  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (ws.isAlive === false) {
        clients.delete(ws);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, HEARTBEAT_INTERVAL);

  wss.on("connection", (ws) => {
    ws.isAlive = true;
    clients.add(ws);

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("close", () => {
      clients.delete(ws);
    });

    ws.on("error", () => {
      clients.delete(ws);
    });
  });

  wss.on("close", () => {
    clearInterval(heartbeat);
    clearInterval(flushTimer);
    flushTimer = null;
  });

  startFlushTimer();

  // Log connection stats periodically
  setInterval(() => {
    if (clients.size > 0) {
      console.log(`[WS] Active connections: ${clients.size}`);
    }
  }, 60000);

  return wss;
}

function broadcast(type, data) {
  // Queue the broadcast — latest data for each type wins
  pendingBroadcasts.set(type, data);
}

function getConnectionCount() {
  return clients.size;
}

module.exports = { initWebSocket, broadcast, getConnectionCount };
