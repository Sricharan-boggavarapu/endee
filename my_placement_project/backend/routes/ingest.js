const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { embedBatch } = require("../services/embeddings");
const { createCollection, upsertVectors } = require("../services/endeeClient");
const { chunkText, makeVectorId, sanitizeText } = require("../utils/chunker");

/**
 * POST /api/ingest
 * Body: { collection, title, content }
 */
router.post("/", async (req, res) => {
  try {
    const { collection, title, content } = req.body;

    if (!collection || !content) {
      return res.status(400).json({ error: "collection and content are required" });
    }

    const cleanContent = sanitizeText(content);
    const docId = crypto.randomUUID();

    // 1. Ensure collection exists in Endee
    await createCollection(collection);

    // 2. Chunk the document
    const chunks = chunkText(cleanContent, 400, 40);

    // 3. Embed all chunks in one batch call
    const embeddings = await embedBatch(chunks);

    // 4. Prepare vectors with metadata
    const vectors = chunks.map((chunk, i) => ({
      id: makeVectorId(docId, i),
      values: embeddings[i],
      metadata: {
        docId,
        title: title || "Untitled Document",
        content: chunk,
        chunkIndex: i,
        totalChunks: chunks.length,
        collection,
        ingestedAt: new Date().toISOString(),
      },
    }));

    // 5. Store in Endee
    await upsertVectors(collection, vectors);

    res.json({
      success: true,
      docId,
      collection,
      title: title || "Untitled Document",
      chunks: chunks.length,
      message: `Successfully ingested "${title}" into collection "${collection}" (${chunks.length} chunks)`,
    });
  } catch (err) {
    console.error("Ingest error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
