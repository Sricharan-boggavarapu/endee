const express = require("express");
const router = express.Router();
const { embedText } = require("../services/embeddings");
const { searchVectors } = require("../services/endeeClient");
const { ragAnswer } = require("../services/rag");

/**
 * POST /api/search
 * Body: { collection, query, topK }
 */
router.post("/", async (req, res) => {
  try {
    const { collection, query, topK = 5 } = req.body;

    if (!collection || !query) {
      return res.status(400).json({ error: "collection and query are required" });
    }

    // Embed the query
    const queryVector = await embedText(query);

    // Search Endee
    const searchResult = await searchVectors(collection, queryVector, topK);
    const matches = searchResult.matches || searchResult.results || [];

    // Format results
    const results = matches.map((m, i) => ({
      rank: i + 1,
      id: m.id,
      score: parseFloat((m.score || m.similarity || 0).toFixed(4)),
      title: m.metadata?.title || "Untitled",
      excerpt: (m.metadata?.content || m.metadata?.text || "").slice(0, 300),
      docId: m.metadata?.docId,
      collection: m.metadata?.collection,
      ingestedAt: m.metadata?.ingestedAt,
    }));

    res.json({
      query,
      collection,
      totalResults: results.length,
      results,
    });
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/search/ask — RAG Q&A
 * Body: { collection, question, topK }
 */
router.post("/ask", async (req, res) => {
  try {
    const { collection, question, topK = 5 } = req.body;

    if (!collection || !question) {
      return res.status(400).json({ error: "collection and question are required" });
    }

    const result = await ragAnswer(collection, question, topK);
    res.json({ question, collection, ...result });
  } catch (err) {
    console.error("RAG error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
