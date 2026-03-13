require("dotenv").config();
const express = require("express");
const cors = require("cors");

const searchRoutes = require("./routes/search");
const ingestRoutes = require("./routes/ingest");
const collectionsRoutes = require("./routes/collections");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "SemanticSearch AI Backend running", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/search", searchRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/collections", collectionsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🚀 SemanticSearch AI Backend running on http://localhost:${PORT}`);
  console.log(`📡 Endee Vector DB: ${process.env.ENDEE_BASE_URL || "http://localhost:8080"}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /health`);
  console.log(`  GET  /api/collections`);
  console.log(`  POST /api/ingest`);
  console.log(`  POST /api/search`);
  console.log(`  POST /api/search/ask`);
});

const KEEP_BACKEND = process.env.RENDER_EXTERNAL_URL || "http://localhost:3001";
const KEEP_ENDEE = process.env.ENDEE_BASE_URL || "http://localhost:8080";
setInterval(async () => {
  try {
    await fetch(KEEP_BACKEND + "/health");
    await fetch(KEEP_ENDEE + "/api/v1/index/list");
    console.log("Ping keep-alive sent");
  } catch (err) {
    console.log("Keep-alive ping failed:", err.message);
  }
}, 10 * 60 * 1000);
