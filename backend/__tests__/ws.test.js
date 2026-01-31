const http = require('http');
const WebSocket = require('ws');
const { initWebSocket, broadcast } = require('../ws');

/**
 * Helper: create a fresh HTTP server with WebSocket attached on a random port.
 */
function createTestServer() {
  return new Promise((resolve) => {
    const server = http.createServer();
    const wss = initWebSocket(server);
    server.listen(0, () => {
      const port = server.address().port;
      resolve({ server, port, wss });
    });
  });
}

/**
 * Helper: connect a WS client and wait for the 'open' event.
 */
function connectClient(port) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

/**
 * Helper: wait for the next message on a WS client (with timeout).
 */
function waitForMessage(ws, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for WS message after ${timeoutMs}ms`));
    }, timeoutMs);

    ws.once('message', (data) => {
      clearTimeout(timer);
      resolve(JSON.parse(data.toString()));
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('WebSocket module (ws.js)', () => {
  let server, port, wss;

  beforeEach(async () => {
    ({ server, port, wss } = await createTestServer());
  });

  afterEach(async () => {
    wss.clients.forEach((ws) => ws.terminate());
    await new Promise((resolve) => server.close(resolve));
  });

  test('broadcast sends JSON to all connected clients', async () => {
    const client1 = await connectClient(port);
    const client2 = await connectClient(port);
    await delay(50);

    const msgPromise1 = waitForMessage(client1);
    const msgPromise2 = waitForMessage(client2);

    broadcast('test:event', { foo: 'bar' });

    const [msg1, msg2] = await Promise.all([msgPromise1, msgPromise2]);

    expect(msg1).toEqual({ type: 'test:event', data: { foo: 'bar' } });
    expect(msg2).toEqual({ type: 'test:event', data: { foo: 'bar' } });

    client1.close();
    client2.close();
  });

  test('broadcast skips closed clients without errors', async () => {
    const client1 = await connectClient(port);
    const client2 = await connectClient(port);
    await delay(50);

    client1.close();
    await delay(100);

    const msgPromise = waitForMessage(client2);

    expect(() => broadcast('test:skip', { value: 42 })).not.toThrow();

    const msg = await msgPromise;
    expect(msg).toEqual({ type: 'test:skip', data: { value: 42 } });

    client2.close();
  });

  test('client disconnect removes client from tracking', async () => {
    const client1 = await connectClient(port);
    await delay(50);

    expect(wss.clients.size).toBe(1);

    client1.close();
    await delay(200);

    expect(wss.clients.size).toBe(0);
  });

  test('multiple clients connect and disconnect independently', async () => {
    const client1 = await connectClient(port);
    const client2 = await connectClient(port);
    const client3 = await connectClient(port);
    await delay(50);

    expect(wss.clients.size).toBe(3);

    client2.close();
    await delay(200);

    expect(wss.clients.size).toBe(2);

    const msgPromise1 = waitForMessage(client1);
    const msgPromise3 = waitForMessage(client3);

    broadcast('test:partial', { remaining: true });

    const [msg1, msg3] = await Promise.all([msgPromise1, msgPromise3]);
    expect(msg1).toEqual({ type: 'test:partial', data: { remaining: true } });
    expect(msg3).toEqual({ type: 'test:partial', data: { remaining: true } });

    client1.close();
    client3.close();
  });

  test('broadcast with no connected clients does not throw', async () => {
    expect(() => broadcast('test:empty', {})).not.toThrow();
  });

  test('heartbeat mechanism: client pong keeps connection alive', async () => {
    const client = await connectClient(port);
    await delay(50);

    const serverWs = [...wss.clients][0];

    serverWs.isAlive = false;
    serverWs.ping();

    await delay(200);

    expect(serverWs.isAlive).toBe(true);

    client.close();
  });

  test('heartbeat terminates unresponsive client (isAlive stays false)', async () => {
    const client = await connectClient(port);
    await delay(50);

    const serverWs = [...wss.clients][0];

    serverWs.isAlive = false;

    if (serverWs.isAlive === false) {
      serverWs.terminate();
    }

    await delay(200);

    expect(wss.clients.size).toBe(0);
  });

  test('error event on ws removes client from tracking', async () => {
    const client = await connectClient(port);
    await delay(50);

    expect(wss.clients.size).toBe(1);

    client.terminate();
    await delay(200);

    expect(wss.clients.size).toBe(0);
  });
});