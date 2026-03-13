# 🔍 SemanticSearch AI — Powered by Endee Vector Database

<div align="center">

![SemanticSearch AI](https://img.shields.io/badge/AI-Semantic%20Search-6366f1?style=for-the-badge&logo=openai&logoColor=white)
![Endee](https://img.shields.io/badge/Vector%20DB-Endee-10b981?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React%2018-61dafb?style=for-the-badge&logo=react&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A production-ready Semantic Search + RAG pipeline using Endee as the vector database.**

[Live Demo](#) · [Report Bug](https://github.com/Sricharan-boggavarapu/endee-semantic-search/issues) · [Request Feature](https://github.com/Sricharan-boggavarapu/endee-semantic-search/issues)

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Problem Statement](#-problem-statement)
- [System Design](#-system-design)
- [How Endee is Used](#-how-endee-is-used)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Developer](#-developer)

---

## 🎯 Project Overview

**SemanticSearch AI** is a full-stack intelligent document search and Q&A system that goes beyond keyword matching. It understands the *meaning* behind your queries and returns contextually relevant results — even when exact keywords aren't present.

Built on top of [Endee](https://github.com/endee-io/endee), an open-source vector database, this system combines:
- **Semantic Search** — find documents by meaning, not just keywords
- **RAG Pipeline** — generate AI-powered answers grounded in your document corpus
- **Real-time Ingestion** — add documents dynamically and search instantly

---

## 🚨 Problem Statement

Traditional keyword-based search fails when:
- Users phrase queries differently than document content
- Synonyms, paraphrases, or conceptual variations exist
- Multi-document reasoning is needed for a comprehensive answer

**SemanticSearch AI** solves this by embedding both documents and queries into high-dimensional vector space, enabling similarity-based retrieval that truly understands language semantics.

---

## 🏗️ System Design

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                          │
│              React 18 + Vite + TailwindCSS                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│                    EXPRESS.JS API                            │
│          /ingest  /search  /ask  /collections               │
└────┬─────────────────┬──────────────────────────────────────┘
     │                 │
┌────▼────┐      ┌─────▼──────────────────┐
│ OpenAI  │      │   ENDEE VECTOR DB      │
│Embedding│      │  ┌──────────────────┐  │
│   API   │      │  │  Collections     │  │
│(ada-002)│      │  │  Vectors + Meta  │  │
└────┬────┘      │  │  ANN Search      │  │
     │           │  └──────────────────┘  │
     └───────────▶  (Local / Dockerized)  │
                 └────────────────────────┘
                       │
              ┌────────▼────────┐
              │   RAG PIPELINE  │
              │  Top-K Chunks   │
              │  → LLM Prompt   │
              │  → AI Answer    │
              └─────────────────┘
```

### Flow

1. **Document Ingestion**: Text is chunked → embedded via OpenAI → stored in Endee with metadata
2. **Semantic Search**: Query is embedded → ANN search in Endee → top-K relevant chunks returned
3. **RAG Q&A**: Top chunks are injected into LLM prompt → coherent answer generated

---

## 🧠 How Endee is Used

Endee serves as the core vector store for this entire application:

| Operation | Endee API Used | Purpose |
|-----------|---------------|---------|
| Create collection | `POST /collections` | Initialize named vector space |
| Store embeddings | `POST /collections/{id}/vectors` | Persist document chunks + embeddings |
| Semantic search | `POST /collections/{id}/search` | ANN similarity search |
| List collections | `GET /collections` | Manage multiple document corpora |
| Delete vectors | `DELETE /collections/{id}/vectors/{vid}` | Remove stale documents |

**Why Endee?**
- Lightweight, self-hosted, no external cloud dependency
- Simple REST API — easy to integrate into any stack
- Supports cosine similarity out of the box
- Fast approximate nearest neighbor search

---

## ⚙️ Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React 18 + Vite | Fast HMR, modern React features |
| Styling | TailwindCSS + shadcn/ui | Utility-first, consistent design |
| Backend | Node.js + Express | Lightweight, async-friendly |
| Vector DB | **Endee** | Open-source, self-hosted vector store |
| Embeddings | OpenAI `text-embedding-ada-002` | High-quality semantic embeddings |
| LLM | OpenAI GPT-4o-mini | Cost-effective RAG answers |
| Containerization | Docker + Docker Compose | One-command deployment |

---

## ✨ Features

- 🔍 **Semantic Search** — meaning-based document retrieval
- 🤖 **RAG Q&A** — ask questions, get AI answers with source citations
- 📁 **Multi-collection** — organize documents into separate collections
- 📄 **Document Ingestion** — paste text or upload `.txt` / `.md` files
- 🎯 **Relevance Scoring** — see similarity scores for each result
- ⚡ **Real-time** — instant results with streaming support
- 🐳 **Docker Ready** — full containerized deployment

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- OpenAI API Key

### 1. Clone & Fork Setup

```bash
# Star and fork https://github.com/endee-io/endee first!
# Then clone YOUR fork:
git clone https://github.com/Sricharan-boggavarapu/endee-semantic-search.git
cd endee-semantic-search
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
ENDEE_BASE_URL=http://localhost:8080
PORT=3001
```

### 3. Start Endee Vector Database

```bash
# Using Docker (recommended)
docker run -d -p 8080:8080 --name endee endee-io/endee:latest

# Or from your forked Endee repo:
cd endee && docker-compose up -d
```

### 4. Install & Run Backend

```bash
cd backend
npm install
npm run dev
```

### 5. Install & Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit: **http://localhost:5173**

### 6. One-Command Docker Deployment

```bash
docker-compose up --build
```

Visit: **http://localhost:5173**

---

## 📁 Project Structure

```
endee-semantic-search/
├── frontend/                  # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Search, Ingest, Collections pages
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # API client, helpers
│   ├── package.json
│   └── vite.config.js
├── backend/                   # Express.js API server
│   ├── routes/
│   │   ├── search.js          # Semantic search endpoint
│   │   ├── ingest.js          # Document ingestion endpoint
│   │   └── collections.js     # Collection management
│   ├── services/
│   │   ├── endeeClient.js     # Endee vector DB client
│   │   ├── embeddings.js      # OpenAI embedding service
│   │   └── rag.js             # RAG pipeline
│   ├── utils/
│   │   └── chunker.js         # Text chunking utilities
│   └── index.js
├── docs/
│   └── architecture.md        # Detailed architecture docs
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📡 API Reference

### Ingest Document
```http
POST /api/ingest
Content-Type: application/json

{
  "collection": "my-docs",
  "title": "Document Title",
  "content": "Full document text content..."
}
```

### Semantic Search
```http
POST /api/search
Content-Type: application/json

{
  "collection": "my-docs",
  "query": "what is machine learning?",
  "topK": 5
}
```

### RAG Q&A
```http
POST /api/ask
Content-Type: application/json

{
  "collection": "my-docs",
  "question": "Explain neural networks in simple terms"
}
```

---

## 👨‍💻 Developer

<div align="center">

**Sricharan Boggavarapu**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/boggavarapu-sricharan)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Sricharan-boggavarapu)

*SDE / ML Engineer Trainee Candidate*
*Building production-ready AI systems with modern infrastructure*

</div>

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built with ❤️ using <a href="https://github.com/endee-io/endee">Endee Vector Database</a>
</div>
