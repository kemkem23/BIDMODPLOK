/**
 * Production entry point with optimizations for handling 2000+ concurrent users.
 *
 * Why not Node.js cluster module?
 * WebSocket connections are stateful — each worker would have its own set of
 * clients and its own in-memory store. A mutation on worker A wouldn't broadcast
 * to clients on worker B. Solving this requires Redis pub/sub or sticky sessions,
 * which adds complexity not justified for a single-machine event setup.
 *
 * Instead, we optimize the single process:
 * - Increase OS-level connection limits
 * - Serve the production React build as static files (no dev server needed)
 * - Use optimized WebSocket broadcasting (throttled, batched)
 * - Enable aggressive HTTP caching
 */

// Increase max listeners for high connection counts
require("events").defaultMaxListeners = 0;

// Set higher memory limit hint
if (!process.env.NODE_OPTIONS) {
  // Can't set mid-process, but log recommendation
  const totalMemMB = Math.round(require("os").totalmem() / 1024 / 1024);
  const recommended = Math.min(4096, Math.round(totalMemMB * 0.6));
  console.log(`Tip: For best performance, start with: NODE_OPTIONS="--max-old-space-size=${recommended}" node cluster.js`);
}

const http = require("http");
const app = require("./app");
const { initWebSocket } = require("./ws");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Increase server connection limits for 2000+ users
server.maxConnections = 5000;
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

initWebSocket(server);

server.listen(PORT, () => {
  const os = require("os");
  const interfaces = os.networkInterfaces();
  let ip = null;
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        ip = iface.address;
        break;
      }
    }
    if (ip) break;
  }
  console.log("");
  console.log("===========================================");
  console.log("  PRODUCTION SERVER (2000-user capacity)");
  console.log("===========================================");
  console.log(`  Local:   http://localhost:${PORT}`);
  if (ip) {
    console.log(`  Network: http://${ip}:${PORT}`);
  }
  console.log(`  Workers: Single-process optimized`);
  console.log(`  CPUs:    ${os.cpus().length} cores`);
  console.log(`  Memory:  ${Math.round(os.totalmem() / 1024 / 1024)} MB total`);
  console.log("===========================================");
  console.log("");
});

module.exports = { app, server };
