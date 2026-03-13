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
// Add this route to backend/routes/collections.js
// It handles the sendBeacon delete (beacon sends raw JSON body)
router.post("/delete-beacon", async (req, res) => {
  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);
    const { id } = body;
    if (id) await endeeClient.deleteCollection(id);
    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(200); // always 200 for beacon
  }
});


module.exports = router;
