/*

file storage -> cloudfare R2
redis -> upstash
package-manaeger -> pnpm
monorepo -> turborepo
orm -> prisma
framework -> frontend -> nextjs
             backend -> fastify
validation -> zod
language -> typescript
job queue -> bullmq
logging -> pino
auth -> next-auth + github oauth
websocket -> socket.io
db -> postgres
db_hosting -> neon
styling -> tailwind
state management -> zustand
server state -> react-query
test harness language -> go
test runner -> separate microservice 


// General Architecture

┌─────────────────────────────────────────────────────┐
│                   USER'S BROWSER                    │
│              Next.js Frontend (Web App)             │
└────────────────────────┬────────────────────────────┘
                         │ REST + WebSocket
┌────────────────────────▼────────────────────────────┐
│               CORE BACKEND (API Server)             │
│                   Node.js + Fastify                 │
│     Auth │ Progress │ Challenges │ Webhooks │ AI    │
└──────┬─────────────┬──────────────────┬─────────────┘
       │             │                  │
  PostgreSQL      Redis             GitHub API
  (main DB)    (queue+cache)
       │             │
       │    ┌────────▼────────┐
       │    │   Job Queue     │  ← BullMQ
       │    │   (BullMQ)      │
       │    └────────┬────────┘
       │             │
┌──────▼─────────────▼──────────────────────────────┐
│              TEST RUNNER SERVICE                   │
│         (Separate Node/Go Microservice)            │
│   Spins Docker containers, runs test harnesses     │
└────────────────────────────────────────────────────┘

LOCAL MODE (runs entirely on user's machine):
┌──────────────────────────────────────────┐
│         CLI Tool (npx yourplatform)      │
│  Node.js CLI → runs tests locally        │
│  Reports results → your API → DB update  │
└──────────────────────────────────────────┘



// monorepo structure (turborepo)

/apps
  /web          → Next.js frontend
  /api          → Fastify backend
  /worker       → BullMQ test runner worker
  /cli          → oclif CLI tool
  /extension    → VS Code extension

/packages
  /ui           → shared shadcn components
  /db           → Prisma schema + client
  /types        → shared TypeScript types
  /validators   → shared Zod schemas
  /test-utils   → shared test harness utilities

/testers
  /redis        → Go test harness for Redis challenge
  /http-server  → Go test harness for HTTP challenge
  /react        → JS test harness for React challenge





*/
