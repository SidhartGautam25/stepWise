# StepWise — Backend Refactor + Web Dashboard

## Part 1: Backend Architecture Refactor

### Target Structure (Controller → Service → Repository)

```
apps/api/src/
  repositories/               ← pure DB / data-source access (no business logic)
    attemptRepository.ts      ← Prisma: attempts CRUD
    progressRepository.ts     ← Prisma: user_progress CRUD
    userRepository.ts         ← Prisma: users CRUD
    stepRepository.ts         ← Prisma: challenge_steps lookup
    challengeCatalogRepository.ts ← disk-based: reads challenge.json manifests
  services/
    attemptService.ts         ← step unlock, outcome logic (moved from root)
    authService.ts            ← OTP + JWT orchestration (extracted from auth/)
    challengeService.ts       ← challenge catalog, prompt loading
  controllers/
    attemptController.ts      ← parse HTTP → call service → return response
    authController.ts         ← parse HTTP → call service → return response
    challengeController.ts    ← parse HTTP → call service → return response
  middleware/
    authMiddleware.ts         ← requireAuth / optionalAuth (moved from auth/)
  routes/
    index.ts                  ← registers all Fastify routes
  index.ts                   ← createApp() + server start ONLY
```

### Files Modified/Created/Deleted

**[NEW]** `repositories/attemptRepository.ts`
**[NEW]** `repositories/progressRepository.ts`
**[NEW]** `repositories/userRepository.ts`
**[NEW]** `repositories/stepRepository.ts`
**[NEW]** `repositories/challengeCatalogRepository.ts`
**[NEW]** `services/authService.ts`
**[NEW]** `services/challengeService.ts`
**[MOVE+MODIFY]** `services/attemptService.ts` 
**[NEW]** `controllers/attemptController.ts`
**[NEW]** `controllers/authController.ts`
**[NEW]** `controllers/challengeController.ts`
**[NEW]** `middleware/authMiddleware.ts`
**[NEW]** `routes/index.ts`
**[DELETE]** `attemptStore.ts` (→ split into repositories)
**[DELETE]** `auth/otp.ts` (→ authService + userRepository)
**[DELETE]** `auth/routes.ts` (→ authController + routes)
**[DELETE]** `auth/middleware.ts` (→ middleware/authMiddleware.ts)
**[DELETE]** `challengeRoutes.ts` (→ challengeController + routes)
**[MODIFY]** `index.ts` (app setup only)

---

## Part 2: Web Dashboard

### Tech Stack

| What | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| Auth | Custom JWT in httpOnly cookie via Next.js Route Handler |
| API calls | Typed fetch client using `@repo/types` |
| Fonts | Geist (from Google Fonts) |

### Pages

```
/                   ← Hero landing: tagline, features, challenge preview
/challenges         ← Grid of challenge cards  
/challenges/[id]    ← Challenge detail: steps, CLI setup instructions
/login              ← Email → OTP login flow
/dashboard          ← User progress (auth required)
```

### Design: Dark theme, glassmorphism, code-aesthetic

- Background: deep `#0a0a0f` with subtle grid lines
- Cards: `backdrop-blur` glass panels with `border: 1px solid rgba(255,255,255,0.08)`
- Accent: electric indigo `#6c63ff` + emerald `#10b981` for success
- Typography: Geist Mono for code snippets, Geist Sans for UI
- Animations: subtle fade-in, step progress bars

### Web App Structure

```
apps/web/
  src/
    app/
      page.tsx                ← Landing
      login/page.tsx          ← Login (email + OTP)
      challenges/
        page.tsx              ← Challenge list
        [id]/page.tsx         ← Challenge detail
      dashboard/page.tsx      ← User dashboard (protected)
      layout.tsx              ← Root layout with nav
      globals.css
    components/
      NavBar.tsx
      ChallengeCard.tsx
      StepList.tsx
      ProgressBar.tsx
      LoginForm.tsx
      TerminalSnippet.tsx     ← Shows CLI commands in a styled terminal
    lib/
      api.ts                  ← Typed fetch to STEPWISE_API_URL
      auth.ts                 ← Cookie-based auth client
      hooks.ts                ← useAuth, useChallenges
```

---

## Verification Plan

1. `pnpm --filter @repo/db db:push` → schema applied to Neon 
2. `pnpm --filter @repo/db db:seed` → challenge data seeded
3. API type-check passes with zero errors
4. `stepwise login --dev --email test@test.com` → JWT stored
5. `stepwise init promise-basic` → workspace provisioned
6. `stepwise test` → attempt submitted
7. Web dashboard opens, shows challenges, login works
