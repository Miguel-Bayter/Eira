<div align="center">

# Eira

**Mental Health & Wellness Web Application**

_A full-stack therapeutic platform that combines AI-powered support, mood science, and mindfulness tools to help users build healthier emotional habits._

[![CI](https://github.com/Miguel-Bayter/Eira/actions/workflows/ci.yml/badge.svg)](https://github.com/Miguel-Bayter/Eira/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![OWASP Compliant](https://img.shields.io/badge/OWASP-Top%2010%20Compliant-blue)](https://owasp.org/www-project-top-ten/)
[![pnpm](https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

[Live Demo](https://eira-woad.vercel.app) · [API Health](https://eira-55bk.onrender.com/api/health) · [Report a Bug](https://github.com/Miguel-Bayter/Eira/issues)

---

> **Important:** Eira is not a substitute for professional mental health treatment. If you are in crisis, please contact your local emergency services or a mental health professional.

</div>

---

## Table of Contents

- [Overview](#overview)
- [Why I Built This](#why-i-built-this)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Security](#security)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Eira is a production-grade mental wellness platform that provides users with a private, safe space to track their emotional well-being over time. It combines reactive frontend UX with a clean hexagonal backend architecture, dual-provider AI (Google Gemini + Groq fallback), and evidence-based therapeutic tools.

The project was designed with the same engineering standards used in commercial SaaS products: typed end-to-end, tested at unit/integration/E2E levels, CI-gated, OWASP-hardened, and deployed across a modern cloud stack.

**Live:** https://eira-woad.vercel.app | **API:** https://eira-55bk.onrender.com

---

## Why I Built This

Mental health applications are among the most technically demanding products to build responsibly. They require:

- **Privacy by design** — users share deeply personal information; data handling must be airtight
- **Resilience** — AI features cannot fail silently; a fallback provider must kick in transparently
- **Accessibility** — emotional distress reduces cognitive load; the UI must be clear under stress
- **Crisis awareness** — the chat system must detect crisis language and surface real resources, never just AI responses

I chose this domain deliberately because it forced me to solve hard engineering problems: secure httpOnly cookie auth, AI provider failover, anonymous community moderation, and therapeutic games built on Canvas/SVG — all within a hexagonal architecture that keeps domain logic completely decoupled from infrastructure concerns.

The result is a codebase I am confident presenting to technical reviewers: it reflects how I approach production software, not just how I write demos.

---

## Features

### Core Wellness Tools

- 🧠 **Mood Tracker** — Daily mood logging (1–10 scale) with emotion tags, notes, and trend history
- 📓 **Personal Journal** — Rich-text entries with AI-powered emotional analysis (Gemini 2.0 Flash, Groq Llama 3.3 70B fallback)
- 💬 **AI Chat** — Conversational support with real-time crisis keyword detection and immediate resource surfacing
- 📊 **Analytics Dashboard** — Weekly mood charts (Recharts), activity heatmap, emotional pattern insights, wellness score

### Mindfulness & Therapeutic Games

- 🌬️ **Guided Breathing** — Animated 4-7-8 breathing exercise with layered gradient circles, phase-specific color transitions (teal / violet / sky), and animated cycle progress indicators
- 🫧 **Bubble Pop** — Stress-relief game with satisfying tactile interactions
- 🪴 **Zen Garden** — Canvas-based karesansui sand garden for focused relaxation
- 🎨 **Mandala Coloring** — Procedurally generated SVG mandalas (4 unique designs, random per session)

### Community

- 🌿 **Anonymous Community** — Post anonymously with AI content moderation and graceful fallback
- ⏱️ **Daily Limit Enforcement** — Server-enforced post limits to prevent compulsive usage patterns

### Platform

- 🌐 **Bilingual i18n** — Full Spanish/English UI with browser-detected locale (react-i18next)
- 📱 **Responsive Design** — Mobile-first TailwindCSS layout with `dvh` units (dynamic viewport height) for correct full-screen sizing on iOS Safari and Android Chrome
- ⚡ **PWA Ready** — Service worker via vite-plugin-pwa for offline capability
- ♿ **Accessible** — Radix UI primitives, ARIA labels, keyboard navigation

---

## Architecture

Eira uses **Hexagonal Architecture** (Ports & Adapters) on the backend. The domain layer has zero knowledge of Express, Prisma, or any AI SDK — all external concerns are adapters injected at the composition root.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React 19)                       │
│  TanStack Query · Zustand · React Hook Form · Motion · Recharts  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS / REST
┌───────────────────────────▼─────────────────────────────────────┐
│                    EXPRESS HTTP LAYER                            │
│  Helmet CSP · CORS · Rate Limit · CSRF · Cookie-Parser · Pino   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              APPLICATION LAYER (Use Cases)               │   │
│  │  CreateMoodEntry · AnalyzeJournal · ModerateCommunity    │   │
│  │  SendChatMessage · GetDashboardStats · RecordGameSession  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │                 DOMAIN LAYER                       │  │   │
│  │  │  Entities: User · MoodEntry · JournalEntry         │  │   │
│  │  │  ChatConversation · CommunityPost · GameSession    │  │   │
│  │  │  Repositories (interfaces only — no impl here)     │  │   │
│  │  │  Value Objects: MoodScore · WellnessScore · Email  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                    INFRASTRUCTURE LAYER                          │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────────────────┐  │
│  │  Prisma ORM  │  │ MultiProvider  │  │  Supabase Auth      │  │
│  │  (PostgreSQL)│  │ AI Service     │  │  + Email (Resend)   │  │
│  │              │  │ Gemini → Groq  │  │                     │  │
│  └──────────────┘  └────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**AI Failover Pattern:**

```
Request → GeminiAiAdapter
              │
         Success? ──Yes──► Return response
              │
             No (429 / 503 / timeout)
              │
         GroqAiAdapter (Llama 3.3 70B)
              │
         Success? ──Yes──► Return response
              │
             No
              │
         Return safe fallback message (never expose error to user)
```

**Monorepo layout (pnpm workspaces):**

```
eira/
├── apps/
│   ├── api/          — Express + Hexagonal backend
│   └── web/          — React 19 + Vite frontend
├── packages/
│   └── shared/       — Shared Zod schemas, TypeScript types
└── .github/
    └── workflows/    — CI (lint + typecheck + test + security checks)
```

---

## Tech Stack

### Frontend

| Technology             | Version | Purpose                           |
| ---------------------- | ------- | --------------------------------- |
| React                  | 19.0    | UI framework                      |
| TypeScript             | 5.4     | Static typing                     |
| Vite                   | 5.3     | Build tool & dev server           |
| TailwindCSS            | 3.4     | Utility-first styling             |
| Radix UI               | various | Accessible headless components    |
| TanStack Query         | 5       | Server state management & caching |
| Zustand                | 4.5     | Client state management           |
| Motion (Framer Motion) | 12      | Animations & transitions          |
| React Hook Form        | 7.51    | Form state management             |
| Zod                    | 3.23    | Schema validation                 |
| React Router           | 6.23    | Client-side routing               |
| Recharts               | 2.12    | Data visualization                |
| i18next                | 25      | Internationalization (ES/EN)      |
| canvas-confetti        | —       | Celebration feedback              |

### Backend

| Technology         | Version | Purpose                      |
| ------------------ | ------- | ---------------------------- |
| Node.js            | 20      | Runtime                      |
| Express            | 4.19    | HTTP framework               |
| TypeScript         | 5.4     | Static typing                |
| Prisma ORM         | 5.15    | Database access & migrations |
| Supabase           | 2.43    | PostgreSQL + Auth provider   |
| Helmet             | 7.1     | HTTP security headers + CSP  |
| express-rate-limit | 7.3     | Rate limiting per IP/user    |
| Zod                | 3.23    | Request validation           |
| Pino               | 9.3     | Structured JSON logging      |
| Resend             | 3.3     | Transactional email          |

### AI

| Provider      | Model         | Role                                                   |
| ------------- | ------------- | ------------------------------------------------------ |
| Google Gemini | 2.0 Flash     | Primary — journal analysis, chat, community moderation |
| Groq          | Llama 3.3 70B | Automatic fallback (sub-1s latency)                    |

### Infrastructure & DevOps

| Tool                | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| Vercel              | Frontend hosting (CDN, global edge)             |
| Render              | API hosting (Docker, health check endpoint)     |
| Supabase            | Managed PostgreSQL                              |
| GitHub Actions      | CI: lint + typecheck + unit + integration tests |
| Docker              | API containerization (node:20-slim)             |
| pnpm workspaces     | Monorepo package management                     |
| Husky + lint-staged | Pre-commit quality gates                        |

### Testing

| Tool                      | Scope                                |
| ------------------------- | ------------------------------------ |
| Vitest                    | Unit & integration tests (API + Web) |
| Playwright                | E2E browser tests                    |
| @testing-library/react    | Component tests                      |
| MSW (Mock Service Worker) | API mocking in tests                 |

---

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- A Supabase project (free tier at supabase.com)
- Google Gemini API key (free at aistudio.google.com)
- Groq API key (free at console.groq.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Miguel-Bayter/Eira.git
cd Eira

# 2. Install all workspace dependencies
pnpm install

# 3. Set up environment variables
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your credentials

# 4. Generate Prisma client and run migrations
pnpm --filter @eira/api db:generate
pnpm --filter @eira/api db:migrate

# 5. Start both dev servers
pnpm dev:api   # API on http://localhost:3001
pnpm dev:web   # Frontend on http://localhost:5173
```

---

## Environment Variables

### `apps/api/.env`

```env
# Server
NODE_ENV=development
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@host:5432/eira

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Providers (Gemini primary, Groq fallback)
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key

# Email
RESEND_API_KEY=your-resend-api-key
```

### `apps/web/.env`

```env
VITE_API_URL=http://localhost:3001
```

> **Never commit `.env` files.** They are excluded via `.gitignore`. Production secrets are injected via the hosting platform's environment configuration.

---

## Running Tests

```bash
# Run all tests (API + Web)
pnpm test

# Backend only
pnpm --filter @eira/api test

# Frontend component tests
pnpm --filter @eira/web test

# E2E tests (requires running dev servers)
pnpm --filter @eira/web test:e2e

# Coverage report
pnpm --filter @eira/api test:coverage

# Type checking (both workspaces)
pnpm typecheck
```

The CI pipeline runs on every push to `master`/`main` and enforces:

- ✅ No inline CSS (`style={{`) — Tailwind utilities only
- ✅ No `console.log` in source — Pino structured logger only
- ✅ TypeScript strict mode pass on both workspaces
- ✅ All unit and integration tests passing
- ✅ Prisma client generated before type-checking

---

## Deployment

### Architecture

```
git push → GitHub Actions CI
               │
           All checks pass?
               │
       ┌───────┴───────┐
       ▼               ▼
    Vercel          Render
  (Frontend)         (API)
  Auto-deploy     Auto-deploy
                  via Docker
```

### Frontend — Vercel

1. Connect your GitHub repository to Vercel
2. Set **Root Directory** to `apps/web`
3. Set **Build Command** to `cd ../.. && pnpm install && pnpm --filter @eira/web build`
4. Set **Output Directory** to `dist`
5. Add environment variable: `VITE_API_URL=https://your-api.onrender.com`

### API — Render

1. New Web Service → Docker environment
2. Set **Dockerfile Path** to `apps/api/Dockerfile`
3. Add all environment variables from `apps/api/.env`
4. Set `NODE_ENV=production`, `PORT=3001`
5. Health check: `GET /api/health`

### Keep-Alive (Free Tier)

To prevent Render's free tier from sleeping after 15 minutes of inactivity, set up an UptimeRobot monitor:

- **URL:** `https://your-api.onrender.com/api/health`
- **Interval:** 5 minutes

A GitHub Actions workflow also pings Supabase every 3 days to prevent the free-tier database from pausing.

---

## Security

Eira is built with OWASP Top 10 compliance as a design requirement, not an afterthought.

| Threat                              | Mitigation                                                                                                                                                                                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Injection (A03)**                 | Prisma ORM parameterized queries — no raw SQL. Zod validates all inputs at the request boundary before they reach the domain. UUID validation on all route params.                                                                                                                                     |
| **Broken Authentication (A07)**     | Supabase-managed auth, httpOnly + Secure cookies. `SameSite=None` in production for cross-domain cookie delivery (Vercel → Render) while CSRF protection via custom header is maintained. RLS enabled on all Supabase tables — direct DB access is denied to any client not using the `postgres` role. |
| **Sensitive Data Exposure (A02)**   | HTTPS enforced via HSTS, secrets in environment variables only, query strings stripped from error logs, no PII in API error responses.                                                                                                                                                                 |
| **XSS (A03)**                       | Helmet CSP with strict directives, React's built-in JSX escaping on all rendered content, HTML tags stripped from AI responses before storage, no `dangerouslySetInnerHTML`.                                                                                                                           |
| **CSRF (A01)**                      | Custom header `x-eira-csrf` required on all state-mutating cookie-authenticated requests, combined with Origin/Referer validation.                                                                                                                                                                     |
| **Rate Limiting (A04)**             | `express-rate-limit` on all routes; stricter per-user limits on auth (10/15min), AI analysis (10/day), and chat (50/day).                                                                                                                                                                              |
| **Security Misconfiguration (A05)** | Helmet sets X-Frame-Options, X-Content-Type-Options, HSTS (31536000s), and Referrer-Policy. Stack traces disabled in production.                                                                                                                                                                       |
| **Broken Access Control (A01)**     | JWT from httpOnly cookie validated on every protected route. Users can only access their own resources — enforced at the use-case layer, not just middleware.                                                                                                                                          |
| **Vulnerable Dependencies (A06)**   | pnpm lockfile pinned versions, GitHub Dependabot alerts enabled.                                                                                                                                                                                                                                       |

---

## Project Structure

```
eira/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   └── schema.prisma          # Database schema (7 models)
│   │   └── src/
│   │       ├── domain/
│   │       │   ├── entities/          # User, MoodEntry, JournalEntry, etc.
│   │       │   ├── repositories/      # Repository interfaces (ports)
│   │       │   ├── services/          # IAiService, IAuthProvider (ports)
│   │       │   ├── value-objects/     # MoodScore, WellnessScore, Email, Emotion
│   │       │   └── errors/            # Typed domain errors
│   │       ├── application/
│   │       │   └── use-cases/         # One class per use case
│   │       ├── infrastructure/
│   │       │   ├── http/
│   │       │   │   ├── controllers/
│   │       │   │   ├── middlewares/   # auth, csrf, validation, errorHandler
│   │       │   │   └── routes/
│   │       │   ├── ai/                # GeminiAdapter, GroqAdapter, MultiProvider
│   │       │   ├── db/                # Prisma repository implementations
│   │       │   ├── auth/              # SupabaseAuthProvider
│   │       │   ├── email/             # ResendEmailAdapter
│   │       │   └── logging/           # Pino logger
│   │       ├── container.ts           # Dependency injection composition root
│   │       └── bootstrap.ts           # App entry point
│   └── web/
│       └── src/
│           ├── components/            # Reusable UI components
│           │   ├── games/             # BreathingGame, BubblePopGame, ZenGardenGame, ColoringGame
│           │   ├── journal/
│           │   ├── chat/
│           │   ├── community/
│           │   └── ui/                # Button, Input, Card, etc.
│           ├── pages/                 # Dashboard, MoodTracker, Journal, Chat, Games, Community
│           ├── hooks/                 # useGames, useMood, useJournal, useChat, useCommunity
│           ├── store/                 # Zustand: authStore, uiStore
│           ├── locales/               # en.json, es.json
│           └── lib/                   # api.ts, utils.ts
└── packages/
    └── shared/
        └── schemas/                   # Shared Zod schemas (auth, mood, journal, chat, community)
```

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository and create a branch from `master`
2. Run `pnpm install` to set up the workspace
3. Make your changes — ensure all types, tests, and lint rules pass
4. Run `pnpm test && pnpm typecheck && pnpm lint` before committing
5. Open a pull request with a clear description of the change

Pre-commit hooks (Husky + lint-staged) enforce formatting and lint on every commit.

Please open an issue before starting work on large features to align on approach.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with care by [Miguel Bayter](https://github.com/Miguel-Bayter)

_If you find this project useful, consider giving it a ⭐_

</div>
