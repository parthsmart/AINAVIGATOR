# AI Career Navigator — Frontend Architecture & Phase 0 Implementation Plan

A mobile-first, accessible, bilingual (English & Hindi) React + TypeScript frontend for Indian Class 11–12 and college students to discover compatible careers, validate skills through adaptive assessments, plan daily execution, and build verified portfolios.

## User Review & Critical Decisions (Phase 0 Gate)

> [!IMPORTANT]
> Per `CONSTRAINTS.md` and your working rules, **no source files or packages have been modified yet**. Please review and approve the following Phase 0 architectural choices and pinned dependencies before we execute Phase 0:

- **Decision 1 — Refresh Token Storage & Single-Flight Rotation**:
  - *Recommended*: Store the short-lived `access_token` (15 min) strictly in memory (module-scoped closure) and the rotating `refresh_token` in a single dedicated `localStorage` key (`cn_refresh_token`), coordinated across tabs via `navigator.locks` (with `BroadcastChannel('cn_auth_channel')` fallback and token distribution so parallel tabs receive the newly rotated token without triggering reuse revocation).
  - *Alternative Considered*: Memory-only for both tokens (loses session on page reload since `/v1/auth/login` returns JSON `{ access_token, refresh_token }` in the response body rather than setting `HttpOnly` cookies).
- **Decision 2 — Dev Server & API Routing on Port 3000**:
  - *Recommended*: Run Express + Vite middleware (or Vite dev server with `/v1` and `/openapi.json` mounted on port `3000`), while keeping `VITE_API_BASE_URL` (default `/v1`) and `VITE_MOCK=true|false` (MSW v2 browser service worker & Vitest node server) configurable.
- **Decision 3 — Pinned Frontend Dependencies (>14 Days Stable)**:
  - Please confirm approval of the exact pinned packages listed in Section 3 below to be installed and logged in `docs/DEPENDENCIES.md`.

---

## 1. Overview & Core Concept

- **What It Does**: Connects every student's psychometric RIASEC assessment, academic profile, and verified skill tests to concrete Indian entrance exams, accredited colleges, weekly study roadmaps, daily task budgets, mock interviews, and a privacy-first shareable portfolio.
- **Target Audience / Persona**: Indian Class 11–12 students choosing streams/degrees and college undergraduates preparing for technical/professional careers on mobile and desktop devices, including slow 3G/4G networks.
- **Key Value**: Honest, deterministic guidance—every compatibility score, skill level, and catalog metric displays its provenance (`test_assessed` vs. `self_reported`), verification timestamp (`last_verified_at` or `"not verified yet"`), and a calm `"guidance, not a diagnosis"` framing.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  - **Phase 0 (Foundation & Auth)**: Signup (with feature-flagged `VITE_ENABLE_PARENTAL_CONSENT` age & parental consent step), Login, Forgot/Reset Password, Change Password, Logout, Protected Route Guard, Language Switcher (English / हिन्दी), Theme Toggle (Light / Dark), and Global Error/Offline Boundaries.
  - **Phase 1 (Profile & RIASEC Assessment)**: Multi-step onboarding & profile editor with live completeness meter; 30-item Likert assessment with autosave, resume, review-before-submit, missing-answers recovery, Holland code breakdown, Class 11–12 stream recommendations first, top-3 career cards, retake version selector, and 500-char Q&A thread.
  - **Phase 2 (Career Catalog, Compatibility, Shortlist & Compare)**: Debounced typo-tolerant search (max 60 chars), cluster/demand/salary filters, LPA salary ranges, verified college fees/cutoffs, transparent compatibility breakdown with pending/ready/fallback AI polling, shortlist (max 20), and 2–4 career side-by-side comparison.
  - **Phase 3 (Adaptive Skill Tests, Language Advisor & Skill Tracker)**: Server-driven question runner with countdown timer, cooldown handling, deterministic language advisor questionnaire, test history, and skill tracker with condicional 2+ point trend charts and `"declared skills count least"` badges.
  - **Phase 4 (Roadmap, Recommendations, Planner & Progress)**: Phased roadmap generator & status board (`todo`, `in_progress`, `done`, `skipped`), null-safe exam deadlines, confirmed replan modal, personalized opportunity feed, daily budget planner with one-tap friendly rescheduling, and optional gentle streak/effort badges.
  - **Phase 5 (Portfolio, Mock Interviews & Grounded AI Chat)**: Privacy-first portfolio builder (`is_public` OFF by default, provenance labels, AI text suggestion drawer requiring explicit acceptance, print-to-PDF stylesheet, `/p/:slug` public view with `noindex`), 2000-char interview practice runner, and 4-mode grounded AI advisor chat.
  - **Phase 6 (Settings, Accessibility, Security, E2E & Architecture Docs)**: Settings hub, axe a11y audit, CSP meta headers, code splitting, Playwright E2E suite, demo script, and security/architecture documentation (`DEFENSE.md`, `THREAT.md`, `DECISIONS.md`, `ALTERNATIVES.md`).

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Warm Editorial Academic & Precision SaaS Workspace—calm, structured, encouraging, and clutter-free.
  - *Color Palette & Mood (60-30-10 Discipline)*:
    - **60% Canvas**: Warm Alabaster `#F8FAFC` (Light) / Deep Slate `#0B1120` (Dark).
    - **30% Structural Surfaces**: Crisp White `#FFFFFF` with `1px solid #E2E8F0` (Light) / Slate Surface `#111827` with `1px solid #1E293B` (Dark). Single-elevation depth (never nested cards within cards).
    - **10% Accent & Semantic Tokens**: Deep Indigo `#4F46E5` (`--primary` for interactive focus & primary CTAs), Emerald `#16A34A` (`verified` / nominal), Amber `#D97706` (`self_reported` / approaching deadline / fallback notice), Crimson `#DC2626` (form field validation & error state).
  - *Typography & Hierarchy*:
    - **Display & Navigation**: `Plus Jakarta Sans` (600/700, tight tracking, `text-wrap: balance`) for headings and structural clarity.
    - **Body & Bilingual Copy**: `Public Sans` paired with `Noto Sans Devanagari` for high legibility across English and Hindi at 14px–16px.
    - **Metrics, Timers & Scores**: `JetBrains Mono` with `font-variant-numeric: tabular-nums` for compatibility scores, LPA figures, countdown timers, and streaks.
  - *Component Styling & Layout*:
    - Desktop 1440px baseline (`260px` collapsible sidebar + sticky top bar with breadcrumb trail and primary actions + `1120px` max-width workspace container); mobile-first bottom/drawer navigation with $\ge 44\text{px}$ touch targets and $\le 15\%$ sticky viewport height.
    - **Zero-Pill Metadata Discipline**: Provenance labels, verification dates (`last_verified_at`), and categories use quiet inline text with `·` separators rather than candy pill sandwiches.
    - **18 Reusable Design System Primitives**: `Button`, `Input`, `Select`, `Card`, `Tabs`, `Modal`, `Toast`, `ProgressBar`, `Chip`, `Skeleton`, `EmptyState`, `ErrorState`, `Stepper`, `ScoreRing`, `Timeline`, `OfflineBanner`, `ProvenanceLabel`, `AiStatusBanner`.

---

## 3. Key Product Decisions, Alternatives & Pinned Dependencies

- **Decision 1: Single-Flight Cross-Tab Token Refresh**
  - *Chosen Approach*: A singleton `AuthTokenManager` in the typed API client holds `accessToken` in memory and `refreshToken` in a single storage key. On `401 Unauthorized`, requests await a shared `refreshPromise`. Cross-tab synchronization uses `navigator.locks.request('cn_token_refresh', ...)` and broadcasts the new token pair over `BroadcastChannel('cn_auth')` so concurrent tabs never reuse a rotated refresh token. Every failed request retries at most once (`_retried = true`).
  - *Why*: Refresh tokens rotate on `/v1/auth/refresh` and reuse revokes the entire token family.
  - *Alternatives Considered*: Per-request independent refresh (causes race condition and immediate session termination on parallel queries); Redux/Zustand persistence of access tokens (violates memory-only access token rule).

- **Decision 2: Generated OpenAPI Types + MSW Dual-Mode Mocking**
  - *Chosen Approach*: Expose the complete `/openapi.json` specification from the backend snapshot (`tests/snapshots/openapi_snapshot.json` / live `/openapi.json` route), generate `src/api/schema.d.ts` via `openapi-typescript`, and wrap `fetch` in a strictly typed client (`apiClient.GET('/v1/careers', ...)`). MSW v2 handlers mirror the exact OpenAPI contract for both `VITE_MOCK=true` browser mode and Vitest unit/integration tests.
  - *Why*: Guarantees zero guessed API shapes and deterministic offline/CI testing.
  - *Alternatives Considered*: Hand-written TypeScript interfaces (error-prone and prohibited by working rules); Axios with untyped interceptors (adds unnecessary bundle weight and weaker OpenAPI path inference).

- **Decision 3: Bounded Exponential Backoff for Pending AI Fields**
  - *Chosen Approach*: Custom `usePollAiStatus` hook powered by TanStack Query `refetchInterval` with bounded backoff (`1.5s → 3s → 6s`, max 4 attempts). While `ai_status === 'pending'`, the UI renders all deterministic scores/facts immediately alongside a non-blocking shimmer on the narrative block. If status resolves to `'fallback'` or exceeds max attempts, it displays the deterministic fallback text with the calm `"AI unavailable, showing a standard summary"` note.
  - *Why*: Never blocks student navigation or deterministic scores on LLM latency.

- **Proposed Pinned Dependencies for Approval (`docs/DEPENDENCIES.md`)**:
  *(All versions released >14 days prior to October 2026)*
  - **Runtime**:
    - `react`: `18.3.1` & `react-dom`: `18.3.1` — Core UI library
    - `react-router-dom`: `6.26.2` — Client-side routing & protected route layouts
    - `@tanstack/react-query`: `5.56.2` — Async server state, caching & bounded AI polling
    - `react-hook-form`: `7.53.0` — Performant form state & field-level 422 error mapping
    - `@hookform/resolvers`: `3.9.0` — Zod schema integration for `react-hook-form`
    - `zod`: `3.23.8` — Strict client-side validation & schema parsing
    - `i18next`: `23.15.1` & `react-i18next`: `15.0.2` — Bilingual English (`en`) & Hindi (`hi`) internationalization
    - `lucide-react`: `0.441.0` — Accessible SVG iconography
  - **Development & Testing**:
    - `vite`: `5.4.8` & `@vitejs/plugin-react`: `4.3.2` — Frontend bundler & dev server
    - `tailwindcss`: `3.4.13`, `postcss`: `8.4.47`, `autoprefixer`: `10.4.20` — Design token styling & print stylesheet support
    - `openapi-typescript`: `7.4.2` — Generates strict TypeScript definitions from `/openapi.json`
    - `msw`: `2.4.9` — Mock Service Worker for `VITE_MOCK=true` and Vitest API tests
    - `vitest`: `2.1.1`, `@vitest/coverage-v8`: `2.1.1`, `jsdom`: `25.0.1` — Unit & integration test runner
    - `@testing-library/react`: `16.0.1`, `@testing-library/jest-dom`: `6.5.0`, `@testing-library/user-event`: `14.5.2` — Accessible DOM & interaction testing
    - `@playwright/test`: `1.47.2` — End-to-end browser verification
    - `eslint`: `9.11.1` & `typescript-eslint`: `8.7.0` — Strict static analysis

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Browser Client (React 18 + Vite)                      │
│                                                                              │
│  ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────┐  │
│  │   AppShell & Nav     │   │  i18n Provider       │   │ Theme & Settings │  │
│  │  (Responsive + A11y) │   │  (en / hi locales)   │   │ (Dark/Light/Hide)│  │
│  └──────────┬───────────┘   └──────────┬───────────┘   └────────┬─────────┘  │
│             └──────────────────────────┼────────────────────────┘            │
│                                        ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                 Design System Primitives (18 Components)               │  │
│  │  Button · Input · Select · Card · Tabs · Modal · Toast · ProgressBar   │  │
│  │  Chip · Skeleton · EmptyState · ErrorState · Stepper · ScoreRing       │  │
│  │  Timeline · OfflineBanner · ProvenanceLabel · AiStatusBanner           │  │
│  └─────────────────────────────────────┬──────────────────────────────────┘  │
│                                        ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │              TanStack Query Hooks & Bounded AI Poller                  │  │
│  │     (Loading Skeletons · Empty States · 422 Form Mapper · 429 Timer)   │  │
│  └─────────────────────────────────────┬──────────────────────────────────┘  │
│                                        ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │           Typed OpenAPI Client (schema.d.ts from /openapi.json)        │  │
│  │  • In-memory accessToken (15m) + Single-key refreshToken               │  │
│  │  • Single-Flight Refresh Lock (navigator.locks + BroadcastChannel)     │  │
│  │  • Single retry after refresh (never loops) · Zero PII/token logging   │  │
│  └──────────────────┬──────────────────────────────────┬──────────────────┘  │
└─────────────────────┼──────────────────────────────────┼─────────────────────┘
                      │ (VITE_MOCK=false)                │ (VITE_MOCK=true / Vitest)
                      ▼                                  ▼
        ┌───────────────────────────┐      ┌───────────────────────────┐
        │   Backend API (/v1/*)     │      │   MSW v2 Service Worker   │
        │  & /openapi.json Schema   │      │  (Deterministic Handlers) │
        └───────────────────────────┘      └───────────────────────────┘
```

### Interactive Component & State Mapping (Phase 0 Scope)
- **Authentication & Session Guards**:
  - `SignupPage`: Validates email, password strength, education level (`class_11_12` or `college`), and renders a feature-flagged (`VITE_ENABLE_PARENTAL_CONSENT`) Age & Parental Consent step; maps `409 EMAIL_EXISTS` and `422` field errors directly onto inputs.
  - `LoginPage`: Authenticates against `POST /v1/auth/login`, stores tokens in `AuthTokenManager`, and redirects to the intended protected route.
  - `ForgotPasswordPage` & `ResetPasswordPage`: Handles `POST /v1/auth/forgot-password` (with `429 Retry-After` countdown button lock) and `POST /v1/auth/reset-password`.
  - `ChangePasswordModal` & `LogoutAction`: Calls `POST /v1/auth/change-password` and `POST /v1/auth/logout` / `/logout-all`, wiping memory and broadcasting session clear across all open tabs.
- **Phase 0 Verification Suite (Vitest + Testing Library)**:
  - Component tests for Loading (`Skeleton`), `EmptyState`, `ErrorState` (with retry callback), and `OfflineBanner`.
  - Form validation & `422` server field error mapping tests on Auth screens.
  - Single-flight token refresh test proving 5 concurrent `401` requests trigger `POST /v1/auth/refresh` exactly once and retry once.
  - `429 Too Many Requests` test verifying `Retry-After` countdown and disabled submit control.
  - Pending-then-ready AI polling hook test.
  - XSS safety test verifying `<img src=x onerror=alert(1)>` renders strictly as escaped plain text across components.
