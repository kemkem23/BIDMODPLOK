const express = require("express");
const cors = require("cors");
const compression = require("compression");
const http = require("http");
const { initWebSocket } = require("./ws");

const racesRouter = require("./routes/races");
const leaderboardRouter = require("./routes/leaderboard");
const authRouter = require("./routes/auth");
const teamsRouter = require("./routes/teams");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(compression());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/races", racesRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/auth", authRouter);
app.use("/api/teams", teamsRouter);

const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
