# Approved Dependencies

This document records all approved Python and Frontend (Node.js / TypeScript) dependencies. No new dependency may be introduced to the project without prior discussion, rationale review, and explicit approval. All versions are pinned to releases at least 14 days old.

**Base Runtime**: Python 3.11+ (Backend) / Node.js 22+ & TypeScript 5.6.2 (Frontend)

---

## 1. Core Framework & Web (Backend)
| Dependency | Version Pin | Architectural Rationale |
| :--- | :--- | :--- |
| `fastapi` | `==0.115.0` | Core high-performance async REST API framework. |
| `uvicorn[standard]` | `==0.32.0` | Production-grade ASGI server with uvloop/httptools support. |
| `pydantic` | `==2.14.1` | Data validation and JSON schema enforcement for APIs and LLM payloads. |
| `pydantic-settings` | `==2.6.0` | Environment variable management and validation using Pydantic V2 models. |
| `python-multipart` | `==0.0.32` | Form data and multipart parsing for authentication (released 2026-06-04; >14 days stable). |

## 2. Database & Migrations (Backend)
| Dependency | Version Pin | Architectural Rationale |
| :--- | :--- | :--- |
| `sqlalchemy` | `==2.0.36` | Industry-standard async ORM and query abstraction layer. |
| `asyncpg` | `==0.30.0` | High-performance asynchronous PostgreSQL database driver for both runtime API and Alembic migrations. |
| `alembic` | `==1.13.3` | Deterministic database schema migration engine configured with native async runner (`run_async_migrations`). |

## 3. Caching, Queue & Background Processing (Backend)
| Dependency | Version Pin | Architectural Rationale |
| :--- | :--- | :--- |
| `redis` | `==5.2.0` | High-performance Redis client for caching, tokens, and rate-limiting. |
| `arq` | `==0.26.1` | Native asyncio job queue built on Redis; robust, fast, and Windows-compatible. |

## 4. Security & Authentication (Backend)
| Dependency | Version Pin | Architectural Rationale |
| :--- | :--- | :--- |
| `PyJWT` | `==2.15.1` | RFC 7519 compliant JWT library for signing and validating access tokens with algorithm pinning (released 2026-09-28; >14 days stable). |
| `bcrypt` | `==5.0.0` | Modern, standalone bcrypt password hashing engine without legacy passlib wrappers (released 2025-09-25; >14 days stable). |

## 5. Artificial Intelligence & LLM Gateway (Backend)
| Dependency | Version Pin | Architectural Rationale |
| :--- | :--- | :--- |
| `google-genai` | `==2.29.0` | Official Google GenAI SDK for Gemini models with structured JSON schema support (released 2026-10-07; >14 days stable). |

## 6. Testing & Code Quality (Backend)
| Dependency | Version Pin | Architectural Rationale |
| :--- | :--- | :--- |
| `pytest` | `==8.3.3` | Testing framework for unit and integration test suites. |
| `pytest-asyncio` | `==0.24.0` | Asyncio test runner support for async FastAPI endpoints and repositories. |
| `httpx` | `==0.28.1` | Async HTTP client for end-to-end API route testing via FastAPI TestClient and provider calls. |
| `ruff` | `==0.7.1` | High-speed Python linter for automated CI pipelines. |

---

## 7. Frontend Runtime Dependencies (Phase 0 Approved)
| Dependency | Version Pin | Architectural Rationale |
| :--- | :--- | :--- |
| `react` | `18.3.1` | Core declarative UI library (>14 days stable). |
| `react-dom` | `18.3.1` | DOM rendering bindings for React 18 (>14 days stable). |
| `react-router-dom` | `6.26.2` | Client-side routing and protected route guards (`ProtectedRoute`). |
| `@tanstack/react-query` | `5.56.2` | Server state management, caching, and bounded exponential backoff polling for AI fields. |
| `react-hook-form` | `7.53.0` | Performant form state management and server `422` field error mapping. |
| `@hookform/resolvers` | `3.9.0` | Schema validation bridge connecting `zod` with `react-hook-form`. |
| `zod` | `3.23.8` | Strict client-side schema validation for forms and API payloads. |
| `i18next` | `23.15.1` | Core internationalization framework for English (`en`) and Hindi (`hi`) locales. |
| `react-i18next` | `15.0.2` | React hooks and components (`useTranslation`, `Translation`) for zero-hardcoded-string enforcement. |
| `lucide-react` | `0.441.0` | Accessible, tree-shakeable SVG icons. |

## 8. Frontend Build, Typing & Testing Dependencies (Phase 0 Approved)
| Dependency | Version Pin | Architectural Rationale |
| :--- | :--- | :--- |
| `typescript` | `5.6.2` | Strict static type checking (`tsc --noEmit`) and AST compatibility with `openapi-typescript`. |
| `vite` | `5.4.8` | Fast frontend bundler and development middleware server. |
| `@vitejs/plugin-react` | `4.3.2` | React Fast Refresh and JSX transformation for Vite. |
| `tailwindcss` | `3.4.13` | Utility-first CSS framework mapped to semantic CSS custom property design tokens. |
| `postcss` | `8.4.47` | CSS transformation pipeline for Tailwind CSS. |
| `autoprefixer` | `10.4.20` | Vendor prefixing for cross-browser compatibility. |
| `openapi-typescript` | `7.4.2` | Generates strict TypeScript definitions (`src/api/schema.d.ts`) directly from `/openapi.json`. |
| `msw` | `2.4.9` | Mock Service Worker v2 for deterministic API mocking in `VITE_MOCK=true` and Vitest suites. |
| `vitest` | `2.1.1` | Unit and component integration test runner. |
| `jsdom` | `25.0.1` | DOM environment simulation for Vitest tests. |
| `@testing-library/react` | `16.0.1` | Accessible user-centric React component testing utilities. |
| `@testing-library/jest-dom` | `6.5.0` | Custom DOM element matchers for Vitest assertions. |
| `@testing-library/user-event` | `14.5.2` | Realistic keyboard and pointer interaction simulation in component tests. |
| `@playwright/test` | `1.47.2` | Headless browser E2E testing and automated 390px mobile / 1280px desktop screenshot verification (released Sept 2024; >14 days stable). |
| `axe-core` | `4.10.0` | Automated WCAG 2.1 AA accessibility engine for verifying zero accessibility violations on `/design` and application screens (released Sept 2024; >14 days stable). |

