import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export const searchDocs = (collection, query, topK = 5) =>
  api.post("/search", { collection, query, topK }).then((r) => r.data);

export const askQuestion = (collection, question, topK = 5) =>
  api.post("/search/ask", { collection, question, topK }).then((r) => r.data);

// For text content
export const ingestDoc = (collection, title, content) =>
  api.post("/ingest", { collection, title, content }).then((r) => r.data);

// For file uploads (PDF, txt, md) — sends as FormData
export const ingestFile = (collection, title, file) => {
  const formData = new FormData();
  formData.append("collection", collection);
  formData.append("title", title);
  formData.append("file", file);
  return axios.post("/api/ingest", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

export const getCollections = () =>
  api.get("/collections").then((r) => r.data);

export const createCollection = (name) =>
  api.post("/collections", { name }).then((r) => r.data);

export const deleteCollection = (id) =>
  api.delete(`/collections/${id}`).then((r) => r.data);

export const healthCheck = () =>
  api.get("/health").then((r) => r.data).catch(() => null);
