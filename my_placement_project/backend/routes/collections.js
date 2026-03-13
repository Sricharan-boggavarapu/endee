const express = require("express");
const router = express.Router();
const { listCollections, createCollection, deleteCollection } = require("../services/endeeClient");

// GET /api/collections
router.get("/", async (req, res) => {
  try {
    const data = await listCollections();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collections
router.post("/", async (req, res) => {
  try {
    const { name, dimension = 1536 } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const data = await createCollection(name, dimension);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/collections/:id
router.delete("/:id", async (req, res) => {
  try {
    const data = await deleteCollection(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
