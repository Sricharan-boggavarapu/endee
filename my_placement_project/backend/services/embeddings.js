const axios = require("axios");

const HF_API_KEY = process.env.HF_API_KEY;
const EMBEDDING_DIM = 384;
const MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const API_URL = `https://router.huggingface.co/hf-inference/models/${MODEL}/pipeline/feature-extraction`;

async function embedText(text) {
  const response = await axios.post(
    API_URL,
    { inputs: [text.slice(0, 512)] },
    {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  const data = response.data;
  // Returns array of embeddings (one per input)
  if (Array.isArray(data[0])) return data[0];
  return data;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function embedBatch(texts) {
  const embeddings = [];
  for (let i = 0; i < texts.length; i++) {
    try {
      const embedding = await embedText(texts[i]);
      embeddings.push(embedding);
      if (i < texts.length - 1) await sleep(100);
    } catch (err) {
      if (err.response?.status === 503) {
        console.log(`   ⏳ HF model loading, waiting 10s...`);
        await sleep(10000);
        const embedding = await embedText(texts[i]);
        embeddings.push(embedding);
      } else throw err;
    }
  }
  return embeddings;
}

module.exports = { embedText, embedBatch, EMBEDDING_DIM };