// backend/src/server.js
const express = require("express");
const cors = require("cors");
const storiesRouter = require("./routes/stories.routes");
const { authGuard } = require("./middleware/auth.middleware");
require("dotenv").config();

const authRouter = require("./routes/auth.routes");
const { healthcheck } = require("./db");

// create app + middleware
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/stories", authGuard, storiesRouter);

// health routes
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/health/db", async (_req, res) => {
  try {
    const ok = await healthcheck();
    res.json({ ok, db: ok ? "connected" : "not connected" });
  } catch (err) {
    console.error("DB healthcheck error:", err);
    res.status(500).json({ ok: false, error: "Database connection failed" });
  }
});

// feature routes
app.use("/api/auth", authRouter);

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});