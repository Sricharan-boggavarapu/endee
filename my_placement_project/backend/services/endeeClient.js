const axios = require("axios");
const msgpack = require("@msgpack/msgpack");

const BASE_URL = process.env.ENDEE_BASE_URL || "http://localhost:8080";

const endee = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000, // increased to 60s
  responseType: "arraybuffer",
});

function parseResponse(data, headers) {
  const ct = headers?.["content-type"] || "";
  if (ct.includes("msgpack")) {
    return msgpack.decode(new Uint8Array(data));
  }
  const text = Buffer.from(data).toString("utf8");
  try { return JSON.parse(text); } catch { return text; }
}

function bytesToString(byteObj) {
  if (typeof byteObj === "string") return byteObj;
  if (byteObj instanceof Uint8Array) return new TextDecoder().decode(byteObj);
  if (typeof byteObj === "object" && byteObj !== null) {
    const keys = Object.keys(byteObj).map(Number).sort((a,b)=>a-b);
    const arr = new Uint8Array(keys.map(k => byteObj[k]));
    return new TextDecoder().decode(arr);
  }
  return "";
}

async function listCollections() {
  const res = await endee.get("/api/v1/index/list");
  const data = parseResponse(res.data, res.headers);
  return Array.isArray(data) ? data : (data.indexes || []);
}

async function createCollection(name, dimension = 384) {
  try {
    await endee.post("/api/v1/index/create", {
      index_name: name, dim: dimension, space_type: "cosine",
      M: 16, ef_con: 200, precision: "float32", sparse_dim: 0,
    });
    console.log(`✅ Created index "${name}"`);
    return { index_name: name };
  } catch (err) {
    const body = err.response?.data ? Buffer.from(err.response.data).toString() : err.message;
    if (body.includes("already exists")) {
      console.log(`Index "${name}" already exists`);
      return { index_name: name };
    }
    console.warn(`⚠️ Create: ${body}`);
    return { index_name: name };
  }
}

async function deleteCollection(name) {
  const res = await endee.delete(`/api/v1/index/${name}/delete`);
  return parseResponse(res.data, res.headers);
}

async function upsertVectors(indexName, vectors) {
  const payload = vectors.map((v) => ({
    id: v.id,
    vector: v.values,
    meta: JSON.stringify(v.metadata || {}),
  }));

  // Insert in batches of 5 to avoid timeout
  const BATCH_SIZE = 5;
  for (let i = 0; i < payload.length; i += BATCH_SIZE) {
    const batch = payload.slice(i, i + BATCH_SIZE);
    console.log(`   Inserting batch ${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(payload.length/BATCH_SIZE)} (${batch.length} vectors)...`);
    await endee.post(`/api/v1/index/${indexName}/vector/insert`, batch);
  }
  console.log(`   ✅ Inserted ${payload.length} vectors total`);
  return { inserted: payload.length };
}

async function searchVectors(indexName, queryVector, topK = 5) {
  const res = await endee.post(`/api/v1/index/${indexName}/search`, {
    vector: queryVector,
    k: topK,
  });
  const decoded = parseResponse(res.data, res.headers);
  const raw = Array.isArray(decoded) ? decoded : [];
  const matches = raw.map((item) => {
    const score = item[0] ?? 0;
    const id = item[1] ?? "";
    const metaRaw = item[2];
    let metadata = {};
    try {
      const metaStr = bytesToString(metaRaw);
      if (metaStr) metadata = JSON.parse(metaStr);
    } catch {}
    return { id, score, metadata };
  });
  console.log(`   ✅ Parsed ${matches.length} results`);
  if (matches[0]) console.log(`   First match: id=${matches[0].id}, score=${matches[0].score}, title=${matches[0].metadata?.title}`);
  return { matches };
}

async function deleteVector(indexName, vectorId) {
  const res = await endee.delete(`/api/v1/index/${indexName}/vector/${vectorId}/delete`);
  return parseResponse(res.data, res.headers);
}

module.exports = { listCollections, createCollection, deleteCollection, upsertVectors, searchVectors, deleteVector };