const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const multer = require("multer");
const { embedBatch } = require("../services/embeddings");
const { createCollection, upsertVectors } = require("../services/endeeClient");
const { chunkText, makeVectorId, sanitizeText } = require("../utils/chunker");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

function sanitizeCollection(name) {
  return (name || "default").replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
}

async function extractText(file) {
  if (!file) return null;
  const mime = file.mimetype || "";
  console.log(`   File mimetype: ${mime}, name: ${file.originalname}, size: ${file.size}`);

  if (mime === "application/pdf" || file.originalname?.toLowerCase().endsWith(".pdf")) {
    try {
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(file.buffer);
      const text = data.text.replace(/\s+/g, " ").trim();
      console.log(`   📄 PDF extracted: ${text.length} chars, ${data.numpages} pages`);
      console.log(`   📄 First 200 chars: ${text.slice(0, 200)}`);
      return text;
    } catch (err) {
      console.error(`   ❌ PDF parse error:`, err.message);
      throw new Error(`Failed to extract PDF text: ${err.message}`);
    }
  }
  return file.buffer.toString("utf8");
}

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const collection = sanitizeCollection(req.body.collection);
    const title = req.body.title || "Untitled";
    let content = req.body.content || "";

    console.log(`\n📥 INGEST REQUEST: collection="${collection}", title="${title}"`);

    if (req.file) {
      const extracted = await extractText(req.file);
      if (extracted) content = extracted;
    }

    if (!content || content.trim().length < 10) {
      return res.status(400).json({ error: "No content to ingest." });
    }

    const cleanContent = sanitizeText(content);
    const docId = crypto.randomUUID();

    console.log(`\n[1/4] Creating index "${collection}" in Endee...`);
    const createResult = await createCollection(collection);
    console.log(`      Result:`, JSON.stringify(createResult));

    console.log(`\n[2/4] Chunking document...`);
    const chunks = chunkText(cleanContent, 400, 40);
    console.log(`      ${chunks.length} chunks created`);

    console.log(`\n[3/4] Embedding ${chunks.length} chunks...`);
    const embeddings = await embedBatch(chunks);
    console.log(`      Embeddings done, dim=${embeddings[0]?.length}`);

    console.log(`\n[4/4] Storing vectors in Endee...`);
    const vectors = chunks.map((chunk, i) => ({
      id: makeVectorId(docId, i),
      values: embeddings[i],
      metadata: { docId, title, content: chunk, chunkIndex: i, totalChunks: chunks.length, collection, ingestedAt: new Date().toISOString() },
    }));

    await upsertVectors(collection, vectors);
    console.log(`\n✅ INGEST SUCCESS: ${chunks.length} chunks stored`);

    res.json({ success: true, docId, collection, title, chunks: chunks.length,
      message: `Successfully ingested "${title}" (${chunks.length} chunks)` });
  } catch (err) {
    console.error(`\n❌ INGEST ERROR:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;