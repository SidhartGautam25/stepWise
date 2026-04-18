# CLI Auth Implementation Plan

## The Design Principle: API-First Auth

All auth logic **lives in the API** (`apps/api/src/auth/`). The CLI and web are just clients that exchange credentials for a JWT. When we add the web dashboard later, we only add a new _method_ to get a token (GitHub OAuth via NextAuth) — the token format, validation middleware, and user model remain identical.

```
                 ┌─────────────────────────────────────┐
                 │           STEPWISE API               │
                 │                                      │
  CLI ──────────►│  POST /auth/register                 │
  (email+OTP)   │  POST /auth/login/request  (OTP)     │
                 │  POST /auth/login/verify             │
                 │  ──────────────────────────────────  │
  Web ──────────►│  POST /auth/sync-oauth-user (future) │
  (NextAuth/     │  ──────────────────────────────────  │
   GitHub OAuth) │  GET/POST /attempts/* (JWT-guarded)  │
                 └──────────────┬──────────────────────┘
                                │ JWT signed with JWT_SECRET
                        ┌───────▼────────┐
                        │  packages/auth  │
                        │  jwt.ts        │← shared by API + future web
                        └────────────────┘
```

---

## Tech & Services

| Concern | Choice | Why |
|---|---|---|
| **JWT** | `jose` | Pure JS, works on Node + Edge + browser; what NextAuth uses internally |
| **OTP storage** | Prisma `OtpToken` table | Reuses existing DB; handles expiry, replay attacks |
| **OTP delivery** | Console log (dev) / `nodemailer` (prod) | Zero setup now; pluggable later |
| **CLI credential storage** | `~/.config/stepwise/credentials.json` | XDG-compliant, same as GitHub CLI |
| **API auth middleware** | Fastify `preValidation` hook | Decorates `request.user`; opt-in per route |
| **Web auth (future)** | NextAuth v5 + GitHub Provider | Calls `/auth/sync-oauth-user` on sign-in callback |

---

## Architecture After This Change

```
packages/
  auth/                    ← NEW: shared JWT utilities (API + future web)
    src/jwt.ts             ← signToken(payload), verifyToken(token)
    src/types.ts           ← AuthPayload, AuthContext
    package.json

apps/
  api/src/auth/            ← NEW: auth HTTP layer
    routes.ts              ← POST /auth/register, /auth/login/request, /auth/login/verify
    otp.ts                 ← OTP generation + DB storage
    middleware.ts          ← Fastify preValidation hook → request.user

  cli/src/
    credentials.ts         ← NEW: ~/.config/stepwise/credentials.json R/W
    commands/login.ts      ← NEW: stepwise login (email → OTP → JWT)
    commands/logout.ts     ← NEW: stepwise logout

packages/db/prisma/
  schema.prisma            ← UPDATED: add OtpToken model, User.email required
```

---

## Auth Flow: CLI (`stepwise login`)

```
Student runs: stepwise login
  ↓
Prompt: "What's your email?"
  ↓
POST /auth/login/request { email }
  API: create user if not exists, generate 6-digit OTP,
       store in DB with 10-min expiry,
       console.log OTP (dev) or send email (prod)
  ↓
Prompt: "Enter the 6-digit code sent to your email:"
  ↓
POST /auth/login/verify { email, code }
  API: verify OTP, mark as used, issue JWT (7d expiry)
  ↓
CLI: store JWT in ~/.config/stepwise/credentials.json
  ↓
"✓ Logged in as sidharth@example.com"
```

## Auth Flow: Web (Future — no changes to API needed)

```
User clicks "Sign in with GitHub"
  ↓ NextAuth handles OAuth redirect
  ↓ NextAuth sign-in callback
  ↓
POST /auth/sync-oauth-user { provider, email, name, image }
  API: create/find user, issue JWT
  ↓
NextAuth sets session with JWT
  ↓
Same JWT, same middleware, same DB
```

---

## Proposed Changes

### `packages/db/prisma/schema.prisma` [MODIFY]
Add `OtpToken` model. Add `passwordHash String?` placeholder on `User` (unused for now).

### `packages/auth/` [NEW]
- `/src/jwt.ts` — `signToken`, `verifyToken`, `decodeToken`
- `/src/types.ts` — `AuthPayload { sub, email, username? }`
- `package.json`, `tsconfig.json`

### `apps/api/src/auth/routes.ts` [NEW]
- `POST /auth/register { email, username? }` — create user
- `POST /auth/login/request { email }` — send OTP
- `POST /auth/login/verify { email, code }` — verify OTP, return JWT
- `POST /auth/dev-login { email }` — **dev only**, returns JWT immediately (disabled when `NODE_ENV=production`)

### `apps/api/src/auth/otp.ts` [NEW]
OTP generation, storage, verification.

### `apps/api/src/auth/middleware.ts` [NEW]
Fastify `preValidation` hook. Decodes JWT, sets `request.user`. Used as:
```ts
app.post("/attempts/start", { preValidation: requireAuth }, async (req) => {
  const userId = req.user.sub;
```

### `apps/api/src/index.ts` [MODIFY]
Register auth routes. Add `requireAuth` to attempt routes.

### `apps/cli/src/credentials.ts` [NEW]
Read/write `~/.config/stepwise/credentials.json`.

### `apps/cli/src/commands/login.ts` [NEW]
Interactive `stepwise login`.

### `apps/cli/src/commands/logout.ts` [NEW]
Clears `~/.config/stepwise/credentials.json`.

### `apps/cli/src/commands/init.ts` [MODIFY]
Read userId from stored JWT instead of `"student-local"`.

### `apps/cli/src/commands/test-config.ts` [MODIFY]
Add Bearer token to API requests.

---

## Verification Plan

1. `stepwise login` → OTP printed to console → paste code → JWT stored
2. `stepwise logout` → credentials cleared
3. `stepwise init promise-basic` → uses real userId from JWT
4. `stepwise test` → Bearer token sent to API → attempt created under real user
5. Type-check passes with zero errors
6. Calling attempt routes without token returns `401 Unauthorized`
