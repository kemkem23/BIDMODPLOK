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

module.exports = app;
