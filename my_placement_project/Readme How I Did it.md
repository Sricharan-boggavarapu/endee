# SemanticSearch AI 🔍

A full-stack **Semantic Search + RAG (Retrieval Augmented Generation)** application built on top of the [Endee](https://endee.io) open-source vector database.

Built by **[Sricharan Boggavarapu](https://www.linkedin.com/in/boggavarapu-sricharan)** as part of the Endee placement evaluation.

🌐 **Live Demo:** https://endee-chi.vercel.app

---

## What does it do?

Instead of searching by keywords, this app understands the **meaning** of your query and finds the most relevant documents. You can also ask questions and get AI-generated answers backed by your own documents.

### Features
- 🔍 **Semantic Search** — find documents by meaning, not just keywords
- 🤖 **Ask AI (RAG)** — ask questions, get answers with source citations
- 📄 **Chat with PDF** — upload any PDF and have a conversation about it
- 📥 **Ingest Docs** — add documents to your knowledge base
- 🗂️ **Collections** — organize documents into separate vector spaces
- 🔒 **Privacy** — PDF sessions are isolated per user and auto-deleted on close

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Vector Database | [Endee](https://endee.io) (self-hosted via Docker) |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` (free) |
| LLM | Groq `llama-3.3-70b-versatile` (free) |
| Backend | Node.js + Express |
| Frontend | React + Vite + Tailwind CSS |
| Deployed on | Vercel (frontend) + Render (backend + Endee) |

---

## Live Deployment

| Service | URL |
|---------|-----|
| Frontend | https://endee-chi.vercel.app |
| Backend | https://endee-1-3blp.onrender.com |
| Endee Vector DB | https://endee-mbwm.onrender.com |

---

## How to Use

### Option 1 — Use the Live App
Just go to **https://endee-chi.vercel.app** — no setup needed!

1. Click **Ingest Docs** → paste any text or upload a PDF
2. Click **Semantic Search** → type a query → get results with similarity scores
3. Click **Ask AI** → ask a question → get an AI answer with citations
4. Click **Chat with PDF** → upload a PDF → ask anything about it

---

### Option 2 — Run Locally

#### Prerequisites
- [Docker Desktop](https://docs.docker.com/get-docker/)
- [Node.js](https://nodejs.org/) v18+
- Free API keys (HuggingFace + Groq)

#### Get Free API Keys

**HuggingFace** (embeddings):
1. Sign up at https://huggingface.co/join
2. Go to https://huggingface.co/settings/tokens
3. Create token with **Read** permission → copy it (`hf_...`)

**Groq** (AI answers):
1. Sign up at https://console.groq.com
2. Go to https://console.groq.com/keys
3. Create API key → copy it (`gsk_...`)

#### Setup
```bash
# 1. Clone the repo
git clone https://github.com/Sricharan-boggavarapu/endee.git
cd endee

# 2. Start Endee Vector DB
docker-compose up -d

# 3. Setup backend
cd my_placement_project/backend
cp ../../.env.example .env
# Edit .env and add your API keys
npm install
npm run dev

# 4. Setup frontend (new terminal)
cd my_placement_project/frontend
npm install
npm run dev
```

Open **http://localhost:5173** 🚀

#### Environment Variables
Create `my_placement_project/backend/.env`:
```env
HF_API_KEY=hf_your_key_here
GROQ_API_KEY=gsk_your_key_here
ENDEE_BASE_URL=http://localhost:8080
PORT=3001
```

---

## Project Structure
```
my_placement_project/
├── backend/
│   ├── index.js
│   ├── routes/
│   │   ├── ingest.js        # Document ingestion
│   │   ├── search.js        # Search + Ask AI
│   │   └── collections.js   # Collections management
│   └── services/
│       ├── endeeClient.js   # Endee vector DB client
│       ├── embeddings.js    # HuggingFace embeddings
│       └── rag.js           # RAG pipeline with Groq
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── SearchPage.jsx
│       │   ├── AskPage.jsx
│       │   ├── IngestPage.jsx
│       │   ├── CollectionsPage.jsx
│       │   └── ChatWithPDF.jsx
│       └── utils/
│           └── api.js
└── endee-render/
    └── Dockerfile           # Endee Docker config for Render
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

Built on top of [Endee](https://github.com/endee-io/endee) — Apache License 2.0.
