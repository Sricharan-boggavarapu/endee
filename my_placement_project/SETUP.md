# 🚀 Quick Setup Guide

## In VS Code (Local Development)

### 1. Mandatory: Star & Fork Endee

Before anything else:
1. ⭐ [Star the Endee repo](https://github.com/endee-io/endee)
2. 🍴 [Fork it](https://github.com/endee-io/endee/fork) to your account

### 2. Environment

```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 3. Start Endee Vector DB

```bash
docker run -d -p 8080:8080 --name endee endee-io/endee:latest
```

### 4. Backend

```bash
cd backend
npm install
npm run dev
# → Running on http://localhost:3001
```

### 5. Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

---

## Push to GitHub

```bash
chmod +x git-setup.sh
./git-setup.sh
```

Or manually:

```bash
git init
git add .
git commit -m "feat: initial commit — SemanticSearch AI with Endee VectorDB"
git remote add origin https://github.com/Sricharan-boggavarapu/endee-semantic-search.git
git push -u origin main
```

---

## Docker (One Command)

```bash
docker-compose up --build
# → http://localhost:5173
```

---

## VS Code Extensions Recommended

- **ESLint** — JavaScript linting
- **Prettier** — code formatting
- **Tailwind CSS IntelliSense** — class autocomplete
- **Docker** — container management
- **Thunder Client** — API testing

---

*Developer: [Sricharan Boggavarapu](https://github.com/Sricharan-boggavarapu)*
