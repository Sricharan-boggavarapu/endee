const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBEDDING_MODEL = "text-embedding-ada-002";
const EMBEDDING_DIM = 1536;

/**
 * Generate embedding for a single text string
 */
async function embedText(text) {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000), // ada-002 token limit
  });
  return response.data[0].embedding;
}

/**
 * Batch embed multiple texts (OpenAI supports batch)
 */
async function embedBatch(texts) {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts.map((t) => t.slice(0, 8000)),
  });
  return response.data.map((d) => d.embedding);
}

module.exports = { embedText, embedBatch, EMBEDDING_DIM };
