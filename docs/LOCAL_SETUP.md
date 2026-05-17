# AI Career Recommendations System — Local Setup Guide

## Prerequisites

Make sure you have these installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 20+ (recommended 22+) | https://nodejs.org |
| pnpm | 9+ | `npm install -g pnpm` |
| PostgreSQL | 14+ | https://www.postgresql.org/download |

---

## Step 1 — Download the Code

Download this project as a ZIP from Replit and extract it, or clone it if you have git access.

---

## Step 2 — Create Your `.env` File

In the **root folder** of the project, create a file called `.env` (copy from `.env.example`):

```bash
cp .env.example .env
```

Then open `.env` and fill in your values:

```env
# Your OpenAI API key — get one at https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# PostgreSQL connection string
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/career_ai
```

### Getting an OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click **"Create new secret key"**
4. Copy the key and paste it into `.env`

### Setting Up PostgreSQL

1. Install PostgreSQL from https://www.postgresql.org/download
2. Open your terminal and run:
   ```bash
   psql -U postgres
   ```
3. Create the database:
   ```sql
   CREATE DATABASE career_ai;
   \q
   ```
4. Update `DATABASE_URL` in your `.env` with your password.

---

## Step 3 — Install Dependencies

In the root folder of the project, run:

```bash
pnpm install
```

> **Common issue:** If you get `ERR_PNPM_UNSUPPORTED_ENGINE`, update Node.js to v20+.

---

## Step 4 — Set Up the Database

Push the database schema (creates all needed tables):

```bash
pnpm --filter @workspace/db run push
```

---

## Step 5 — Start the App

You need to run **two terminals** — one for the backend API and one for the frontend.

### Terminal 1 — Start the API Server

```bash
pnpm --filter @workspace/api-server run dev:local
```

You should see:
```
Server listening on port 8080
```

### Terminal 2 — Start the Frontend

```bash
pnpm --filter @workspace/career-ai run dev:local
```

You should see:
```
VITE v7.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

---

## Step 6 — Open the App

Open your browser and go to:

```
http://localhost:3000
```

> **Note on Login:** When running locally, login is automatically bypassed — you will be logged in as "Dev User" without needing to sign in. This is intentional for local development. On the live Replit deployment, real login/auth is used.

---

## How It Works

```
Browser (localhost:3000)
    ↓ API calls (/api/...)
Vite Dev Server (localhost:3000) — proxies /api → localhost:8080
    ↓
Express API Server (localhost:8080)
    ↓                    ↓
PostgreSQL DB      OpenAI API (gpt-4o)
```

---

## Project Structure

```
/
├── artifacts/
│   ├── api-server/         # Express backend (Node.js)
│   │   └── src/
│   │       └── routes/
│   │           ├── career/      # Career quiz & recommendation routes
│   │           └── skill-gap/   # Skill gap analysis routes
│   └── career-ai/          # React frontend (Vite)
│       └── src/
│           ├── pages/      # Home, Results, SkillGap, Login pages
│           └── context/    # QuizContext (state)
├── lib/
│   ├── api-spec/           # OpenAPI spec + orval codegen config
│   ├── api-client-react/   # Auto-generated React Query hooks
│   ├── api-zod/            # Auto-generated Zod validators
│   └── db/                 # Drizzle ORM schema + client
└── LOCAL_SETUP.md          # This file
```

---

## Troubleshooting

### `pnpm: command not found`
```bash
npm install -g pnpm
```

### `Cannot find package 'openai'` or similar
Make sure you ran `pnpm install` from the **root folder** (not inside a subfolder).

### `Database connection refused`
- Check that PostgreSQL is running: `pg_isready`
- Verify `DATABASE_URL` in your `.env` is correct
- Make sure the database exists: `createdb career_ai`

### API returns 500 / AI not working
- Check `OPENAI_API_KEY` in `.env` is valid
- Make sure you have credits on your OpenAI account

### Port already in use
Change the port in `.env`:
```env
PORT=8081
```

---

## Modifying the Questions

Quiz questions are in:
```
artifacts/api-server/src/routes/career/questions.ts
```

## Modifying the AI Prompt

The AI career recommendation prompt is in:
```
artifacts/api-server/src/routes/career/index.ts
```

The skill gap analysis prompt is in:
```
artifacts/api-server/src/routes/skill-gap/index.ts
```
