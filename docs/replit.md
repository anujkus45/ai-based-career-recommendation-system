# AI Career Recommendations System

## Overview

An AI-powered career recommendations web app where users answer 8 questions about their interests, strengths, and goals. The AI analyzes answers and suggests the best career with a complete step-by-step roadmap.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/career-ai)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **AI**: OpenAI GPT-4o via Replit AI Integrations
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── career-ai/          # React + Vite frontend (previewPath: /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   ├── integrations-openai-ai-server/  # OpenAI server integration
│   └── integrations-openai-ai-react/   # OpenAI React hooks
```

## Features

- **8 Question Quiz** covering interests, academics, work style, strengths, goals, environment, challenges, and role models
- **AI-Powered Analysis** using GPT-5.2 to match career based on answers
- **Detailed Career Roadmap** with 5 phases from school to senior level
- **Match Score** showing how well the career fits the user
- **Alternative Careers** suggestions
- **Salary Range & Job Outlook** for Indian market

## API Endpoints

- `GET /api/career/questions` — Returns all 8 quiz questions with options
- `POST /api/career/recommend` — Accepts answers, returns career recommendation + roadmap

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
## run command 

Pehle is folder mein jayein:
```powershell
cd c:\Users\anuj04\Downloads\Career-Compass\Career-Compass
```

Step 1: Backend Server Chalu Karein
```powershell
$env:NODE_ENV="development"; pnpm --filter @workspace/api-server run dev:local
```

Step 2: Frontend Server Chalu Karein (Naya terminal tab khol ke usme bhi same path pe pehle `cd` karein, phir ye run karein)
```powershell
$env:PORT="3000"; $env:BASE_PATH="/"; pnpm --filter @workspace/career-ai run dev:local
```