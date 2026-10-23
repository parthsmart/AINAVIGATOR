# AI Career Navigator – Project Handover & State Ledger

This document tracks the ongoing operational state of the codebase across engineering sessions. Every session logs its latest status on top with the model name and date.

---

## Session: 2026-10-23 (models/gemini-4-argon) – Visual Identity Locked: Direction 2 ("Deccan Basalt & Metro Wayfinding")

### Done
- **Locked Visual Identity in `docs/DESIGN.md` (No App Code Modified)**:
  - Product owner selected **Direction 2: "Deccan Basalt & Metro Wayfinding"**:
    - **Palette**: Limestone Platform (`#F2F3F0`) / Basalt Night (`#141716`), White Tile (`#FFFFFF`) / Slate Coach (`#1D2220`), Charcoal Sign (`#181C1A`) / Ivory Chalk (`#ECEFEC`), Ash Milestone (`#525B56`) / Lichen Grey (`#A0ABA5`), Konkan Teal (`#0F6E56`) / Signal Cyan (`#34D399`), Haldi Ochre (`#9A5B00`) / Amber Marker (`#FBBF24`).
    - **Typography**: `IBM Plex Sans` + `IBM Plex Sans Devanagari` (`400`, `500`, `600`) + `IBM Plex Mono` (`500`).
    - **Signature Element & Rules**: **Junction Route Strip (`[DONE]` / `[NOW]` / `[NEXT]`)**, `60ch` max line width, `44px` minimum touch targets, zero middle-dots (`·`), zero all-caps eyebrows, zero link arrows (`→`), verb-matched button/toast copy, and `prefers-reduced-motion: reduce` compliance.
- **Status**: Presented plan & alternatives for applying Direction 2 + next feature scope; waiting for user approval (or specific next prompt) before writing app code.

---

## Session: 2026-10-23 (models/gemini-4-argon) – Frontend Phase 1: Student Profile & Onboarding, 30-Item RIASEC Assessment Runner, and Results View

### Done
- **OpenAPI Schema & Generated Types (`public/openapi.json`, `src/api/schema.d.ts`)**:
  - Added full Phase 1 schemas (`ProfileResponse`, `ProfileUpdateRequest`, `ProfileProjectItem`, `ProfileCompetitionItem`, `ProfileRecordItem`, `QuestionsListResponse`, `AttemptResponse`, `SaveAnswersRequest`, `AssessmentResultResponse`, `StreamRecommendation`, `RecommendedCareerMatch`, `AssessmentQARequest`, `AssessmentQAResponse`, `ChooseCareerRequest`, `ChooseCareerResponse`) and regenerated `src/api/schema.d.ts` via `npm run generate:types`.
- **Onboarding Wizard & Profile Editor (`src/pages/profile/ProfilePage.tsx`)**:
  - Implemented 4-step onboarding stepper + full profile editor using `react-hook-form` + `zod` covering student details, `education_level` (`class_11_12` or `college`), year, location, comma-separated subjects of interest & hobbies, past work, dynamic field arrays for projects, competitions, and academic records/links, hours/day, hours/week, budget level (`low`, `medium`, `high`), and timezone.
  - Built live 8-section **Completeness Meter** (`ProgressBar` + missing sections chip list) and enforced `http:`/`https:` validation (`isSafeHttpUrl`) with `rel="noopener noreferrer"` on all external links.
- **30-Question RIASEC Assessment Runner (`src/pages/assessment/AssessmentPage.tsx`)**:
  - Built 30-question Likert (1–5) inventory supporting both **5 per page** and **1 at a time** modes, live progress bar, automatic draft resume (`GET /v1/assessment/attempt`), immediate autosave (`PUT /v1/assessment/answers`), **Review-before-submit** screen with one-click jump to unanswered items, and server `422 MISSING_ANSWERS` field error highlighting.
- **Assessment Results & Retake History (`src/pages/assessment/AssessmentResultsPage.tsx`)**:
  - Displays Holland RIASEC code & label, `ScoreRing` with 6D dimension breakdown and `"Guidance, not a diagnosis"` disclaimer, traits, aligned skills, and `AiStatusBlock` (`ready` / `pending` / `fallback`).
  - Enforces **Class 11–12 streams-first ordering**: when `education_level === 'class_11_12'`, recommended academic streams and subjects render **before** the top 3 careers.
  - Includes retake version switcher (`Attempt v2` / `Attempt v1`), `"Choose this career"` target-setting action (`POST /v1/assessment/results/{result_id}/choose`), and per-result follow-up Q&A thread (`POST /v1/assessment/results/{result_id}/ask`) with a strict 500-character limit, live character counter, `fallback` banner, `out_of_scope` notice, and XSS-safe plain-text rendering.
- **Bilingual i18n & Phase 1 Automated Tests (`src/i18n/en.json`, `src/i18n/hi.json`, `src/test/phase1.test.tsx`)**:
  - Added all `profile.*`, `assessment.*`, and `results.*` keys in both English and Hindi.
  - Added `src/test/phase1.test.tsx` (12 total tests passing across `phase0.test.tsx` and `phase1.test.tsx`).

### Assumptions & Mocked Items in Phase 1
- **Assumptions**:
  - `GET /v1/assessment/attempt` returns the current in-progress draft attempt (`answers: Record<question_id, 1..5>`), and `PUT /v1/assessment/answers` merges updated ratings idempotently.
  - `POST /v1/assessment/submit` returns HTTP `422` with `error.code = "MISSING_ANSWERS"` and `error.fields.missing_question_ids` (comma-separated question UUIDs) if any of the 30 questions are unanswered.
- **Mocked via MSW (`src/mocks/handlers.ts`) & Express Dev Store (`src/index.ts`, `src/store.ts`)**:
  - Seeded 30 RIASEC questions (`5` per dimension across `R, I, A, S, E, C`), 28/30 pre-filled draft answers in MSW for testing both `422 MISSING_ANSWERS` and completion, multi-version results (`v2` college and `v1` class_11_12), Q&A endpoint (`ready`, `fallback`, `out_of_scope`), and `choose` career endpoint.

### Pending Items (Next Phases — Awaiting User Approval)
- **Phase 2**: Career catalog list (filters, pagination, debounced typo-tolerant search max 60 chars), Career detail (LPA salaries, verified college fees/cutoffs, exams, courses, certificates, internships, related careers), Compatibility detail, Shortlist (max 20), and Compare view (2–4 careers).
- **Phase 3**: Adaptive skill test runner (server-driven difficulty, timer, cooldown), Language advisor questionnaire, Test history, and Skill tracker (2+ point trend chart, declared skills form).
- **Phase 4**: Roadmap generator & board (phases, status changes, weekly schedule, backlog, null-safe exam deadlines, replan modal), Recommendations feed, Daily/Weekly Planner (one-tap reschedule), and Progress summary (gentle streak wording, weekly goals, self-reported effort badges).
- **Phase 5**: Portfolio editor & `/p/:slug` public view (privacy-first `is_public` OFF by default, AI text suggestion drawer requiring explicit user acceptance, print stylesheet PDF), Mock Interview runner (2000-char limit, rubric feedback, 2+ session chart), and Grounded 4-mode AI Chat.
- **Phase 6**: Settings screen (language, timezone, hide streaks, change password, export/delete account placeholders), axe accessibility pass, bundle code-splitting, CSP & security audit, Playwright E2E suite, demo script, and security/architecture docs (`DEFENSE.md`, `THREAT.md`, `DECISIONS.md`, `ALTERNATIVES.md`).

### Do not touch
- `CONSTRAINTS.md`: Core product constraints are locked.
- Deterministic scoring rule: AI never calculates scores or ranks careers.
- Question versioning integrity: answers must tether to their attempt's version.

---

## Session: 2026-10-23 (models/gemini-4-argon) – Frontend Phase 0: Foundation, Design System, Typed OpenAPI Client, MSW Mocks & Auth Screens

### Done
- **Project Scaffold & Tooling (`package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `.github/workflows/ci.yml`)**:
  - Configured React 18.3.1 + strict TypeScript 5.6.2 + Vite 5.4.8 + Tailwind CSS 3.4.13 + Vitest 2.1.1 + Testing Library + MSW 2.4.9.
  - Logged all approved pinned dependencies (>14 days old) with architectural rationale in `docs/DEPENDENCIES.md`.
  - Added ADR-029 in `docs/DECISIONS.md` documenting single-flight cross-tab token refresh, OpenAPI schema codegen, and honest data display primitives.
- **Typed OpenAPI Client & Single-Flight Refresh (`public/openapi.json`, `src/api/schema.d.ts`, `src/api/client.ts`)**:
  - Generated `src/api/schema.d.ts` from `/openapi.json` via `openapi-typescript`.
  - Implemented `apiRequest` with `accessTokenMemory` stored strictly in memory (15 min) and `refresh_token` stored in a single place (`cn_refresh_token`).
  - Implemented single-flight refresh (`executeRefreshSingleFlight`) shared across concurrent requests in-tab and across tabs via `navigator.locks` + `BroadcastChannel('cn_auth_channel')`.
  - Enforced single retry after refresh (`_retried: true`, never loops), automatic session clearing on refresh failure, `422` field error extraction, `429 Retry-After` header parsing, and zero logging of PII/tokens/messages.
- **Bounded AI Polling & Security Utilities (`src/hooks/usePollAiStatus.ts`, `src/utils/security.ts`)**:
  - Implemented `usePollAiStatus` with exponential backoff (`pending` → `ready` or `fallback`) and calm `"AI unavailable, showing a standard summary"` fallback banner.
  - Implemented `isSafeHttpUrl` allowing only `http:` and `https:` protocols (`rel="noopener noreferrer"`), and `getFriendlyErrorMessage` for `401`, `404`, `409`, `422`, `429`, and network errors.
- **Bilingual i18n (`src/i18n/en.json`, `src/i18n/hi.json`, `src/i18n/index.ts`)**:
  - Full English (`en`) and Hindi (`hi`) translation dictionaries with zero hardcoded UI strings.
- **Design System & Layout (`src/index.css`, `src/components/ui/primitives.tsx`, `src/components/layout/AppShell.tsx`, `src/components/ErrorBoundary.tsx`)**:
  - Implemented semantic CSS tokens (Light & Dark mode, `tabular-nums`, print stylesheet) and all 18 reusable components.
- **Authentication Screens & Feature-Flagged Parental Consent (`src/pages/auth/*`)**:
  - Built `LoginPage`, `SignupPage` (with feature-flagged `VITE_ENABLE_PARENTAL_CONSENT` age & parental consent placeholder), `ForgotPasswordPage`, `ResetPasswordPage`, and `ChangePasswordModal`.
- **Phase 0 Automated Test Suite (`src/test/phase0.test.tsx`)**:
  - 8 comprehensive Vitest + Testing Library + MSW tests passing.
