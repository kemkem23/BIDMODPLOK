const path = require("path");
const os = require("os");
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const multer = require("multer");

const racesRouter = require("./routes/races");
const leaderboardRouter = require("./routes/leaderboard");
const authRouter = require("./routes/auth");
const teamsRouter = require("./routes/teams");
const { getTeamById, updateTeam } = require("./models/store");
const ws = require("./ws");

const app = express();

app.use(cors());
app.use(compression());
app.use(express.json());

// Serve uploaded team photos
app.use("/api/uploads", express.static(path.join(__dirname, "team pictures")));

// Multer config for team photo uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, "team pictures"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${req.params.id}${ext}`);
  },
});
const upload = multer({ storage });

app.post("/api/teams/:id/photo", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const photoUrl = `/api/uploads/${req.file.filename}`;
  const team = updateTeam(req.params.id, { photo: photoUrl });
  if (!team) {
    return res.status(404).json({ error: "Team not found" });
  }
  res.json({ photo: photoUrl, team });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/server-ip", (req, res) => {
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
  res.json({ ip: ip || "127.0.0.1" });
});

app.use("/api/races", racesRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/auth", authRouter);
app.use("/api/teams", teamsRouter);

// Connection stats endpoint for monitoring
app.get("/api/stats", (req, res) => {
  res.json({
    wsConnections: typeof ws.getConnectionCount === "function" ? ws.getConnectionCount() : 0,
    uptime: process.uptime(),
    memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  });
});

// --- Serve React production build ---
// In production, the frontend is built to /frontend/build and served as static files.
// This eliminates the React dev server, saving ~400MB RAM.
const FRONTEND_BUILD = path.join(__dirname, "..", "frontend", "build");
const fs = require("fs");

if (fs.existsSync(path.join(FRONTEND_BUILD, "index.html"))) {
  // Serve static assets with long cache (they have content hashes in filenames)
  app.use(
    "/static",
    express.static(path.join(FRONTEND_BUILD, "static"), {
      maxAge: "1y",
      immutable: true,
    })
  );

  // Serve other build files (manifest, favicon, etc.) with short cache
  app.use(express.static(FRONTEND_BUILD, { maxAge: "10m", index: false }));

  // SPA fallback: any non-API route serves index.html
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "Not found" });
    }
    res.sendFile(path.join(FRONTEND_BUILD, "index.html"));
  });

  console.log("Serving frontend production build from", FRONTEND_BUILD);
} else {
  console.log(
    "No frontend build found. Run 'npm run build' in /frontend to enable production serving."
  );
}

module.exports = app;
