const http = require("http");
const WebSocket = require("ws");
const request = require("supertest");
const app = require("../../app");
const { initWebSocket } = require("../../ws");

function connectClient(port) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket("ws://127.0.0.1:" + port);
    ws.on("open", () => resolve(ws));
    ws.on("error", reject);
  });
}

function collectMessages(ws, count, timeoutMs) {
  timeoutMs = timeoutMs || 5000;
  return new Promise((resolve, reject) => {
    const messages = [];
    const timer = setTimeout(() => {
      reject(new Error("Timed out waiting for " + count + " WS messages (received " + messages.length + ")"));
    }, timeoutMs);
    const handler = (data) => {
      messages.push(JSON.parse(data.toString()));
      if (messages.length >= count) {
        clearTimeout(timer);
        ws.removeListener("message", handler);
        resolve(messages);
      }
    };
    ws.on("message", handler);
  });
}

function waitForMessage(ws, timeoutMs) {
  timeoutMs = timeoutMs || 5000;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Timed out waiting for WS message"));
    }, timeoutMs);
    ws.once("message", (data) => {
      clearTimeout(timer);
      resolve(JSON.parse(data.toString()));
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
describe("Integration: WebSocket broadcasts on HTTP mutations", () => {
  let server, port;

  beforeAll((done) => {
    server = http.createServer(app);
    initWebSocket(server);
    server.listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeAll(async () => {
    await request(app)
      .post("/api/races/current")
      .send({
        id: "race-ws-test", className: "Test Class", round: "Final", status: "waiting",
        left: { lane: "left", team: { id: "t1", number: 1, name: "Team A", className: "Test Class" }, times: { qualify: null, run1: null, run2: null, run3: null } },
        right: { lane: "right", team: { id: "t3", number: 3, name: "Team B", className: "Test Class" }, times: { qualify: null, run1: null, run2: null, run3: null } },
      });
  });
  test("WS receives race:updated on PUT /api/races/current/times", async () => {
    const client = await connectClient(port);
    await delay(50);
    const messagesPromise = collectMessages(client, 2);
    await request(app).put("/api/races/current/times").send({ left: { qualify: 9.123 } });
    const messages = await messagesPromise;
    const raceMsg = messages.find((m) => m.type === "race:updated");
    expect(raceMsg).toBeDefined();
    expect(raceMsg.data).toBeDefined();
    expect(raceMsg.data.left.times.qualify).toBe(9.123);
    client.close();
  });

  test("WS receives leaderboard:updated on PUT /api/races/current/times", async () => {
    const client = await connectClient(port);
    await delay(50);
    const messagesPromise = collectMessages(client, 2);
    await request(app).put("/api/races/current/times").send({ right: { run1: 8.456 } });
    const messages = await messagesPromise;
    const lbMsg = messages.find((m) => m.type === "leaderboard:updated");
    expect(lbMsg).toBeDefined();
    expect(lbMsg.data).toBeDefined();
    expect(Array.isArray(lbMsg.data)).toBe(true);
    client.close();
  });
  test("WS receives team:updated on PUT /api/teams/:id", async () => {
    const client = await connectClient(port);
    await delay(50);
    const messagesPromise = collectMessages(client, 2);
    await request(app).put("/api/teams/t1").send({ nickname: "WS-Test-Nick" });
    const messages = await messagesPromise;
    const teamMsg = messages.find((m) => m.type === "team:updated");
    expect(teamMsg).toBeDefined();
    expect(teamMsg.data).toBeDefined();
    expect(teamMsg.data.nickname).toBe("WS-Test-Nick");
    client.close();
  });

  test("multiple WS clients all receive the same broadcast", async () => {
    const client1 = await connectClient(port);
    const client2 = await connectClient(port);
    const client3 = await connectClient(port);
    await delay(50);
    const p1 = collectMessages(client1, 2);
    const p2 = collectMessages(client2, 2);
    const p3 = collectMessages(client3, 2);
    await request(app).put("/api/races/current/times").send({ left: { run2: 7.777 } });
    const [msgs1, msgs2, msgs3] = await Promise.all([p1, p2, p3]);
    for (const msgs of [msgs1, msgs2, msgs3]) {
      const raceMsg = msgs.find((m) => m.type === "race:updated");
      expect(raceMsg).toBeDefined();
      expect(raceMsg.data.left.times.run2).toBe(7.777);
      const lbMsg = msgs.find((m) => m.type === "leaderboard:updated");
      expect(lbMsg).toBeDefined();
    }
    client1.close();
    client2.close();
    client3.close();
  });
  test("WS receives race:updated on POST /api/races/current", async () => {
    const client = await connectClient(port);
    await delay(50);
    const msgPromise = waitForMessage(client);
    await request(app).post("/api/races/current").send({
      id: "race-ws-post", className: "Test Class 2", round: "Semi", status: "waiting",
      left: { lane: "left", team: { id: "t5", number: 5, name: "Team C", className: "Test Class 2" }, times: { qualify: null, run1: null, run2: null, run3: null } },
      right: { lane: "right", team: { id: "t6", number: 6, name: "Team D", className: "Test Class 2" }, times: { qualify: null, run1: null, run2: null, run3: null } },
    });
    const msg = await msgPromise;
    expect(msg.type).toBe("race:updated");
    expect(msg.data.id).toBe("race-ws-post");
    client.close();
  });

  test("late-connecting client receives subsequent broadcasts", async () => {
    await request(app).put("/api/races/current/times").send({ left: { run3: 6.666 } });
    const client = await connectClient(port);
    await delay(50);
    const messagesPromise = collectMessages(client, 2);
    await request(app).put("/api/races/current/times").send({ right: { run3: 5.555 } });
    const messages = await messagesPromise;
    const raceMsg = messages.find((m) => m.type === "race:updated");
    expect(raceMsg).toBeDefined();
    client.close();
  });
});
