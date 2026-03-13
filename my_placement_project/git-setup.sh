#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Git Setup Script for SemanticSearch AI
# Developer: Sricharan Boggavarapu
# GitHub: https://github.com/Sricharan-boggavarapu
# ─────────────────────────────────────────────────────────────────────────────

set -e

GITHUB_USERNAME="Sricharan-boggavarapu"
REPO_NAME="endee-semantic-search"
REMOTE_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║          SemanticSearch AI — Git Setup Script           ║"
echo "║          Developer: Sricharan Boggavarapu               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Check git is installed ────────────────────────────────────────────
if ! command -v git &> /dev/null; then
  echo "❌ Git not found. Install Git from https://git-scm.com"
  exit 1
fi

echo "✅ Git found: $(git --version)"

# ── Step 2: Configure git identity (update if needed) ────────────────────────
echo ""
echo "📝 Configuring Git identity..."
git config --global user.name "Sricharan Boggavarapu"
git config --global user.email "your-email@example.com"   # ← UPDATE THIS
echo "   Name:  $(git config --global user.name)"
echo "   Email: $(git config --global user.email)"

# ── Step 3: Initialize repository ─────────────────────────────────────────────
echo ""
echo "🔧 Initializing Git repository..."
git init
git branch -M main

# ── Step 4: Add all files ─────────────────────────────────────────────────────
echo ""
echo "📦 Staging all files..."
git add .
git status --short

# ── Step 5: Initial commit ────────────────────────────────────────────────────
echo ""
echo "💾 Creating initial commit..."
git commit -m "feat: initial commit — SemanticSearch AI with Endee VectorDB

- Full-stack semantic search + RAG pipeline
- React 18 + Vite frontend with modern UI
- Express.js backend with OpenAI embeddings
- Endee as vector database (forked from endee-io/endee)
- Docker Compose for one-command deployment
- Collections, ingest, search, and RAG Q&A features

Developer: Sricharan Boggavarapu
GitHub: https://github.com/Sricharan-boggavarapu
LinkedIn: https://www.linkedin.com/in/boggavarapu-sricharan"

# ── Step 6: Add remote origin ─────────────────────────────────────────────────
echo ""
echo "🔗 Adding remote origin..."

# Remove existing origin if present
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"
echo "   Remote: $REMOTE_URL"

# ── Step 7: Push ──────────────────────────────────────────────────────────────
echo ""
echo "🚀 Pushing to GitHub..."
echo "   (Make sure you've created the repo at: https://github.com/new)"
echo ""

git push -u origin main

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ Successfully pushed to GitHub!                      ║"
echo "║                                                          ║"
echo "║  🔗 https://github.com/${GITHUB_USERNAME}/${REPO_NAME}    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next steps:"
echo "   1. Star the Endee repo: https://github.com/endee-io/endee"
echo "   2. Fork it to your account"
echo "   3. Add your OpenAI API key to .env"
echo "   4. Run: docker-compose up --build"
echo ""
