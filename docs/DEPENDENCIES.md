# Approved Dependencies

This document records all approved Python and frontend/runtime dependencies. No new dependency may be introduced to the project without prior discussion, rationale review, and explicit approval.

## Frontend foundation (React/Vite)

| Dependency | Version pin | Why |
| :--- | :--- | :--- |
| `react`, `react-dom` | `19.1.1` | Strict TypeScript UI foundation. |
| `react-router-dom` | `7.9.4` | Client-side route composition for the student workspace. |
| `@tanstack/react-query` | `5.90.5` | Server-state caching, retries, and request lifecycle handling. |
| `tailwindcss`, `@tailwindcss/vite` | `4.1.14` | Utility styling with the Vite plugin and responsive tokens. |
| `react-hook-form` | `7.65.0` | Performant form state for assessment flows. |
| `zod`, `@hookform/resolvers` | `4.1.12`, `5.2.2` | Runtime validation shared with form boundaries. |
| `i18next`, `react-i18next` | `25.5.2`, `16.2.4` | English and Hindi translation plumbing. |
| `openapi-typescript` | `7.9.1` | Generated API types from the FastAPI OpenAPI schema. |
| `msw` | `2.6.8` | Explicit mock mode for endpoints not yet available. |
| `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom` | `3.2.4`, `16.3.0`, `6.9.1`, `14.6.1`, `26.1.0` | Unit and accessible component tests. |
| `@playwright/test` | `1.55.0` | Mobile and desktop browser coverage. |

Pins are intentionally kept at stable versions that satisfy the project's 14-day age rule. The scaffold currently has no frontend API calls; generated OpenAPI types and MSW handlers will be added with the first endpoint screen.

---

## Python dependencies

The existing backend dependency register remains below this section.
