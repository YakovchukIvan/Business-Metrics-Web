# Web Architecture (Next.js)

> Paths below are relative to `apps/web/`, since `.agents/` lives at the monorepo root. See `.agents/rules/global.md` for workflow and commit rules that also apply here — not repeated below.

## 1. Core Stack

- **Framework:** Next.js 16 (App Router) + TypeScript 7 (strict mode, `noUncheckedIndexedAccess` enabled).
- **Styling:** Tailwind CSS v4 — config lives entirely in CSS variables inside `globals.css`; no `tailwind.config.ts` file.
- **Components:** shadcn/ui with Radix UI as the default primitive library. Components are copied into `src/components/ui/` — we own the source. Includes Lucide React for icons, tw-animate-css for micro-animations, and Sonner for toast notifications.
- **Charts:** Recharts 3.x — use `RadialBarChart` for the circular score visualization.
- **Data Fetching:** TanStack Query v5 — `useMutation` for the analysis call; never use raw `fetch` inside components.
- **Env:** `src/config/env.ts` typed getter — never access `process.env.NEXT_PUBLIC_*` directly outside this file.

## 2. Strict Architectural Boundaries

- **Component layers — one-directional dependency only:**
  - `components/ui/` — shadcn/ui primitives only. No business logic, no API calls, no imports from `analysis/` or `layout/`.
  - `components/layout/` — app shell (header, footer, recent dropdown). May import from `ui/`. Must NOT import from `analysis/`.
  - `components/analysis/` — feature components. May import from `ui/` and `layout/`. Never import from peer `analysis/` components sideways.
  - **Enforced by ESLint** `import/no-restricted-paths`. If the boundary is wrong, fix the architecture — do not bypass it with re-export barrels.

- **No direct `fetch` in components or hooks:** All network calls go through `src/lib/api/client.ts` → `src/lib/api/analysis.ts`. Hooks call lib functions; components call hooks.

- **No raw `process.env`:** Use only `getApiUrl()` from `src/config/env.ts`. Fail loudly at startup if the variable is missing — not silently mid-request.

- **No inline error strings:** All user-visible error messages live exclusively in `src/lib/api/errors.ts`, looked up by HTTP status code. Components render the message they receive — they never compose it.

- **Server vs Client Components — Strict Boundaries (default to Server):**
  - **Server Components (Default):** Do NOT use `'use server';` at the top (that is for Server Actions, not components). They handle static rendering and server-side logic. They cannot use React hooks (`useState`, `useEffect`) or browser APIs.
  - **Client Components:** Must start with `'use client';`. Used _only_ when interactivity, React hooks, or browser APIs (like `localStorage`) are required.
  - **Strict Import Rule:** You CANNOT import a Server Component directly into a Client Component. If a Client Component needs to render a Server Component, you must pass the Server Component as a `children` prop (Composition Pattern).

  | File / Area                    | Rendering  | Reason                                         |
  | ------------------------------ | ---------- | ---------------------------------------------- |
  | `app/layout.tsx`               | Server     | Static shell — no interactivity                |
  | `app/page.tsx`                 | Server     | Shell only; delegates interactivity to client  |
  | `app/docs/page.tsx`            | Server     | Fully static — best for SEO                    |
  | `app/providers.tsx`            | **Client** | Wraps `QueryClientProvider`                    |
  | `components/analysis/*`        | **Client** | TanStack Query, form state, conditional render |
  | `components/layout/header.tsx` | **Client** | Reads `localStorage` for recent search history |
  | `components/layout/footer.tsx` | Server     | Static content                                 |

- **No Magic Values:** Rule weights, cache TTL, route paths, max recent-history count (10) — always in a `constants.ts` file, never inline.

## 3. Directory Structure Paradigm

- `src/app/` — Next.js App Router pages and layouts. Pages are thin shells; all logic lives in components and hooks.
- `src/components/ui/` — shadcn/ui primitives. Do not add business logic here. Run `npx shadcn@latest add <component>` to extend.
- `src/components/layout/` — App shell: header, footer, recent-dropdown.
- `src/components/analysis/` — Feature components: search-form, results-panel, score-card, breakdown-card, issues-list, recommendations-list.
- `src/lib/api/` — The single network layer: `client.ts` (fetch wrapper + envelope parsing), `analysis.ts` (typed API call), `errors.ts` (status → message map).
- `src/lib/constants/scoring.ts` — Single source of truth mapping backend rule IDs to UI presentation (names, icons, descriptions, priority).
- `src/lib/types/` — TypeScript interfaces that mirror api DTOs (`AnalysisResult`, `RuleBreakdown`, `RuleIssue`). Manual for MVP; extracted to `packages/shared-types` when types diverge.
- `src/lib/recent-searches.ts` — `localStorage` adapter. Interface (`getRecentSearches`, `addRecentSearch`) must stay stable — it is the only file that changes when a DB-backed history is introduced later.
- `src/hooks/` — Thin React wrappers over lib functions (`use-analysis.ts`). No business logic — just state management with TanStack Query.
- `src/config/env.ts` — Typed environment getter. One file, one responsibility.

## 4. Data Flow (non-negotiable order)

```ts
Component → Hook (useMutation) → lib/api/analysis.ts → lib/api/client.ts → Api
```

- Components never skip a layer. A component must not call `lib/api/analysis.ts` directly — it always goes through the hook.
- On success: typed `AnalysisResult` flows up to the component for rendering; `lib/recent-searches.ts` is called to persist to `localStorage`.
- On error: `ApiError` (typed, from `lib/api/errors.ts`) flows up to the component for inline display or via a Sonner toast — never a separate page.

## 5. API Response Contract

The api always returns `{ success: boolean, data: T | null, meta: object }`. `client.ts` is the only place that parses this envelope. On `success: false`, it throws a typed `ApiError`. On network or non-JSON failure, it throws `ApiError` with code `SERVICE_UNAVAILABLE`. Every consumer receives either clean data or a structured error — never a raw `Response`.

## 6. Full Architecture Reference

This file has only the enforceable, day-to-day rules. For full rationale (why `localStorage` for history, why manual type mirror, full data-flow diagram, scaling roadmap), see `.agents/context/web-architecture.md`.
