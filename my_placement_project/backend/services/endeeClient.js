const axios = require("axios");

const BASE_URL = process.env.ENDEE_BASE_URL || "http://localhost:8080";

const endee = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ─── Collections ───────────────────────────────────────────────────────────────

async function listCollections() {
  const res = await endee.get("/collections");
  return res.data;
}

async function createCollection(name, dimension = 1536) {
  try {
    const res = await endee.post("/collections", { name, dimension });
    return res.data;
  } catch (err) {
    // If already exists, ignore
    if (err.response?.status === 409) return { name, dimension };
    throw err;
  }
}

async function deleteCollection(collectionId) {
  const res = await endee.delete(`/collections/${collectionId}`);
  return res.data;
}

// ─── Vectors ───────────────────────────────────────────────────────────────────

async function upsertVectors(collectionId, vectors) {
  // vectors: [{ id, values: float[], metadata: {} }]
  const res = await endee.post(`/collections/${collectionId}/vectors`, { vectors });
  return res.data;
}

async function searchVectors(collectionId, queryVector, topK = 5) {
  const res = await endee.post(`/collections/${collectionId}/search`, {
    vector: queryVector,
    top_k: topK,
    include_metadata: true,
  });
  return res.data;
}

async function deleteVector(collectionId, vectorId) {
  const res = await endee.delete(`/collections/${collectionId}/vectors/${vectorId}`);
  return res.data;
}

module.exports = {
  listCollections,
  createCollection,
  deleteCollection,
  upsertVectors,
  searchVectors,
  deleteVector,
};
