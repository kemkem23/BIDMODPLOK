const request = require("supertest");
const app = require("../../app");

describe("Integration: HTTP API", () => {
  describe("GET /api/health", () => {
    test("returns 200 with status ok", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok" });
    });
  });

  describe("CORS headers", () => {
    test("response includes Access-Control-Allow-Origin", async () => {
      const res = await request(app)
        .get("/api/health")
        .set("Origin", "http://localhost:3000");
      expect(res.headers["access-control-allow-origin"]).toBeDefined();
    });

    test("OPTIONS preflight returns CORS headers", async () => {
      const res = await request(app)
        .options("/api/health")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "GET");
      expect(res.status).toBe(204);
      expect(res.headers["access-control-allow-origin"]).toBeDefined();
      expect(res.headers["access-control-allow-methods"]).toBeDefined();
    });
  });
  describe("Full race flow", () => {
    test("POST race -> GET current -> PUT times -> GET shows updated", async () => {
      const raceData = {
        id: "race-test-flow", className: "Test Class", round: "Final", status: "waiting",
        left: { lane: "left", team: { id: "t1", number: 1, name: "Team Left", className: "Test Class" }, times: { qualify: null, run1: null, run2: null, run3: null } },
        right: { lane: "right", team: { id: "t3", number: 3, name: "Team Right", className: "Test Class" }, times: { qualify: null, run1: null, run2: null, run3: null } },
      };
      const postRes = await request(app).post("/api/races/current").send(raceData);
      expect(postRes.status).toBe(200);
      expect(postRes.body.currentRace.id).toBe("race-test-flow");
      const getRes = await request(app).get("/api/races/current");
      expect(getRes.status).toBe(200);
      expect(getRes.body.currentRace.id).toBe("race-test-flow");
      expect(getRes.body.currentRace.status).toBe("waiting");
      const putRes = await request(app).put("/api/races/current/times")
        .send({ left: { qualify: 9.5 }, right: { qualify: 10.2 }, status: "running" });
      expect(putRes.status).toBe(200);
      expect(putRes.body.currentRace.left.times.qualify).toBe(9.5);
      expect(putRes.body.currentRace.right.times.qualify).toBe(10.2);
      expect(putRes.body.currentRace.status).toBe("running");
      const getUpdated = await request(app).get("/api/races/current");
      expect(getUpdated.status).toBe(200);
      expect(getUpdated.body.currentRace.left.times.qualify).toBe(9.5);
      expect(getUpdated.body.currentRace.right.times.qualify).toBe(10.2);
      expect(getUpdated.body.currentRace.status).toBe("running");
    });
  });
  describe("ETag caching", () => {
    test("GET returns ETag header", async () => {
      const res = await request(app).get("/api/races/current");
      expect(res.status).toBe(200);
      expect(res.headers["etag"]).toBeDefined();
      expect(res.headers["etag"]).toMatch(/^"[a-f0-9]+"$/);
    });
    test("GET with matching If-None-Match returns 304", async () => {
      const first = await request(app).get("/api/races/current");
      const etag = first.headers["etag"];
      const second = await request(app).get("/api/races/current").set("If-None-Match", etag);
      expect(second.status).toBe(304);
    });
    test("ETag changes after mutation", async () => {
      const before = await request(app).get("/api/races/current");
      const etagBefore = before.headers["etag"];
      await request(app).put("/api/races/current/times").send({ left: { run1: 8.888 } });
      const after = await request(app).get("/api/races/current");
      expect(after.headers["etag"]).toBeDefined();
      expect(after.headers["etag"]).not.toBe(etagBefore);
    });
    test("stale ETag after mutation returns 200", async () => {
      const first = await request(app).get("/api/races/current");
      const staleEtag = first.headers["etag"];
      await request(app).put("/api/races/current/times").send({ right: { run2: 7.777 } });
      const res = await request(app).get("/api/races/current").set("If-None-Match", staleEtag);
      expect(res.status).toBe(200);
      expect(res.body.currentRace).toBeDefined();
    });
  });
  describe("GET /api/leaderboard", () => {
    test("returns classes and allResults", async () => {
      const res = await request(app).get("/api/leaderboard");
      expect(res.status).toBe(200);
      expect(res.body.classes).toBeDefined();
      expect(Array.isArray(res.body.classes)).toBe(true);
      expect(res.body.allResults).toBeDefined();
      expect(Array.isArray(res.body.allResults)).toBe(true);
    });
    test("returns ETag header", async () => {
      const res = await request(app).get("/api/leaderboard");
      expect(res.headers["etag"]).toBeDefined();
    });
  });

  describe("Teams API", () => {
    test("GET /api/teams returns all teams", async () => {
      const res = await request(app).get("/api/teams");
      expect(res.status).toBe(200);
      expect(res.body.teams).toBeDefined();
      expect(Array.isArray(res.body.teams)).toBe(true);
      expect(res.body.teams.length).toBeGreaterThan(0);
    });
    test("GET /api/teams/:id returns a specific team", async () => {
      const res = await request(app).get("/api/teams/t1");
      expect(res.status).toBe(200);
      expect(res.body.team).toBeDefined();
      expect(res.body.team.id).toBe("t1");
    });
    test("GET /api/teams/:id returns 404 for unknown team", async () => {
      const res = await request(app).get("/api/teams/nonexistent");
      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });
    test("PUT /api/teams/:id updates allowed fields", async () => {
      const res = await request(app).put("/api/teams/t1")
        .send({ name: "Updated Team Name", nickname: "Speedy" });
      expect(res.status).toBe(200);
      expect(res.body.team.name).toBe("Updated Team Name");
      expect(res.body.team.nickname).toBe("Speedy");
    });
    test("PUT /api/teams/:id returns 404 for unknown team", async () => {
      const res = await request(app).put("/api/teams/nonexistent").send({ name: "Ghost" });
      expect(res.status).toBe(404);
    });
  });
  describe("POST /api/auth/login", () => {
    test("valid credentials return token and role", async () => {
      const res = await request(app).post("/api/auth/login")
        .send({ username: "adminMay", password: "asdfasdfasdf" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.role).toBe("full");
      expect(res.body.username).toBe("adminMay");
    });
    test("invalid credentials return 401", async () => {
      const res = await request(app).post("/api/auth/login")
        .send({ username: "wrong", password: "wrong" });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
