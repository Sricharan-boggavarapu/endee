const express = require("express");
const router = express.Router();
const { embedText } = require("../services/embeddings");
const { searchVectors } = require("../services/endeeClient");
const { ragAnswer } = require("../services/rag");

function sanitizeCollection(name) {
  return (name || "default").replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
}

router.post("/", async (req, res) => {
  try {
    const collection = sanitizeCollection(req.body.collection);
    const { query, topK = 5 } = req.body;
    console.log(`\n🔍 SEARCH: collection="${collection}", query="${query}"`);

    if (!collection || !query) {
      return res.status(400).json({ error: "collection and query are required" });
    }

    const queryVector = await embedText(query);
    console.log(`   Query embedded, dim=${queryVector.length}`);

    const searchResult = await searchVectors(collection, queryVector, topK);
    console.log(`   Search result: ${JSON.stringify(searchResult).slice(0, 200)}`);

    const matches = searchResult.matches || [];
    const results = matches.map((m, i) => ({
      rank: i + 1,
      id: m.id,
      score: parseFloat((m.score || 0).toFixed(4)),
      title: m.metadata?.title || "Untitled",
      excerpt: (m.metadata?.content || m.metadata?.text || "").slice(0, 300),
      docId: m.metadata?.docId,
      collection: m.metadata?.collection,
      ingestedAt: m.metadata?.ingestedAt,
    }));

    console.log(`   ✅ Found ${results.length} results`);
    res.json({ query, collection, totalResults: results.length, results });
  } catch (err) {
    console.error(`❌ SEARCH ERROR:`, err.message);
    res.status(500).json({ error: err.message, details: err.response?.data });
  }
});

router.post("/ask", async (req, res) => {
  try {
    const collection = sanitizeCollection(req.body.collection);
    const { question, topK = 5 } = req.body;
    console.log(`\n🤖 ASK: collection="${collection}", question="${question}"`);

    if (!collection || !question) {
      return res.status(400).json({ error: "collection and question are required" });
    }

    const result = await ragAnswer(collection, question, topK);
    res.json({ question, collection, ...result });
  } catch (err) {
    console.error(`❌ ASK ERROR:`, err.message);
    console.error(`   Status:`, err.response?.status);
    console.error(`   Response:`, JSON.stringify(err.response?.data));
    res.status(500).json({ error: err.message, details: err.response?.data });
  }
});

module.exports = router;
