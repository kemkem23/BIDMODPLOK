const WebSocket = require("ws");

let wss;
const clients = new Set();
const HEARTBEAT_INTERVAL = 30000;

function initWebSocket(server) {
  wss = new WebSocket.Server({ server });

  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        clients.delete(ws);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
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
  });

  return wss;
}

function broadcast(type, data) {
  const message = JSON.stringify({ type, data });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

module.exports = { initWebSocket, broadcast };
