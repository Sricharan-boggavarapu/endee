# SemanticSearch AI 🔍

A full-stack **Semantic Search + RAG (Retrieval Augmented Generation)** application built on top of the [Endee](https://endee.io) open-source vector database.

Built by **[Sricharan Boggavarapu](https://www.linkedin.com/in/boggavarapu-sricharan)** as part of the Endee placement evaluation.

---

## What does it do?

Instead of searching by keywords, this app understands the **meaning** of your query and finds the most relevant documents. You can also ask questions and get AI-generated answers backed by your own documents.

### Features
- 🔍 **Semantic Search** — find documents by meaning, not just keywords
- 🤖 **Ask AI (RAG)** — ask questions, get answers with source citations
- 📄 **Chat with PDF** — upload any PDF and have a conversation about it
- 📥 **Ingest Docs** — add documents (text or files) to your knowledge base
- 🗂️ **Collections** — organize documents into separate vector spaces

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Vector Database | [Endee](https://endee.io) (self-hosted via Docker) |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` (free) |
| LLM | Groq `llama-3.3-70b-versatile` (free) |
| Backend | Node.js + Express |
| Frontend | React + Vite + Tailwind CSS |

---

## How to Run It Locally

### Prerequisites
- [Docker Desktop](https://docs.docker.com/get-docker/) installed and running
- [Node.js](https://nodejs.org/) v18 or higher
- Free API keys (instructions below)

---

### Step 1 — Get Free API Keys

**HuggingFace** (for embeddings):
1. Sign up at https://huggingface.co/join
2. Go to https://huggingface.co/settings/tokens
3. Create a new token with **Read** permission
4. Copy the token (starts with `hf_`)

**Groq** (for AI answers):
1. Sign up at https://console.groq.com
2. Go to https://console.groq.com/keys
3. Create a new API key
4. Copy the key (starts with `gsk_`)

---

### Step 2 — Clone the repo

```bash
git clone https://github.com/Sricharan-boggavarapu/endee.git
cd endee/my_placement_project
```

---

### Step 3 — Start Endee Vector Database

```bash
cd endee   # go back to root of repo
docker-compose up -d
```

Wait for the container to be healthy:
```bash
docker ps   # should show endee-oss running on port 8080
```

---

### Step 4 — Set up the Backend

```bash
cd my_placement_project/backend
```

Create a `.env` file:
```env
HF_API_KEY=hf_your_huggingface_token_here
GROQ_API_KEY=gsk_your_groq_key_here
ENDEE_BASE_URL=http://localhost:8080
PORT=3001
```

Install dependencies and start:
```bash
npm install
npm run dev
```

Backend runs at **http://localhost:3001**

---

### Step 5 — Set up the Frontend

Open a new terminal:
```bash
cd my_placement_project/frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

### Step 6 — Open the App

Go to **http://localhost:5173** in your browser.

**Quick test:**
1. Click **Ingest Docs** → paste any text → click Ingest
2. Click **Semantic Search** → type a query → click Search
3. Click **Ask AI** → ask a question → get an AI answer with citations
4. Click **Chat with PDF** → upload a PDF → ask questions about it

---

## Project Structure

```
my_placement_project/
├── backend/
│   ├── index.js              # Express server entry point
│   ├── routes/
│   │   ├── ingest.js         # Document ingestion API
│   │   ├── search.js         # Search + Ask AI API
│   │   └── collections.js    # Collections management API
│   ├── services/
│   │   ├── endeeClient.js    # Endee vector DB client
│   │   ├── embeddings.js     # HuggingFace embeddings
│   │   └── rag.js            # RAG pipeline with Groq
│   └── utils/
│       └── chunker.js        # Text chunking utility
└── frontend/
    └── src/
        ├── pages/
        │   ├── SearchPage.jsx
        │   ├── AskPage.jsx
        │   ├── IngestPage.jsx
        │   ├── CollectionsPage.jsx
        │   └── ChatWithPDF.jsx
        └── utils/
            └── api.js        # API client
```

---

## How It Works

```
User Query
    ↓
Embed with HuggingFace (384-dim vector)
    ↓
Search Endee Vector DB (cosine similarity)
    ↓
Retrieve top-K matching chunks
    ↓
Send context + question to Groq (Llama 3.3)
    ↓
Return answer with source citations
```

---

## Developer

**Sricharan Boggavarapu**
- GitHub: [github.com/Sricharan-boggavarapu](https://github.com/Sricharan-boggavarapu)
- LinkedIn: [linkedin.com/in/boggavarapu-sricharan](https://www.linkedin.com/in/boggavarapu-sricharan)

---

## License

This project is built on top of [Endee](https://github.com/endee-io/endee) which is licensed under the Apache License 2.0.