# ProfileLens — Web Tasks (Test Assignment)

## DO NOT read this file further unless explicitly requested

> A step-by-step plan for web implementation. Each task corresponds to a single functional layer. Everything related to future scaling (Auth, DB-backed history, export, batch analysis) is deliberately **excluded** — this is strictly the scope of the test assignment MVP.

**Tasks:** 7 · **Pages:** `/` (home), `/docs` · **Stack:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts, TanStack Query, tw-animate-css, Sonner

---

## TASK-1 — Project Initialization

**Type:** Setup / Infra

**Goal:** A working Next.js skeleton with strict TypeScript, Tailwind, shadcn/ui, and a consistent code quality setup — ready to run locally and in Docker.

- [x] `npx create-next-app` (TypeScript, App Router, strict mode in `tsconfig.json`)
- [x] ESLint + Prettier config (consistent with monorepo standards)
- [x] Tailwind CSS configured with custom theme tokens (colors, fonts)
- [x] shadcn/ui initialized (`npx shadcn@latest init`) with Sonner, Lucide React, and tw-animate-css
- [x] `.env.local.example` with `NEXT_PUBLIC_API_URL` variable
- [x] Verification: `npm run dev` starts the app, no TypeScript errors

---

## TASK-2 — Layout & Design System

**Type:** Infra

**Goal:** Global layout, header, footer, and base design tokens in place before building any feature page.

- [x] `components/layout/header.tsx` — logo ("ProfileLens / Business Profile Audit"), "Recent" dropdown trigger, "BPA - audit tool · mvp" label on the right
- [x] `components/layout/footer.tsx` — "Business Profile Audit 2026. All rights reserved."
- [x] `app/layout.tsx` — root layout wrapping all pages with header + footer
- [x] Google Font configured (e.g., Inter) via `next/font`
- [x] Global CSS variables for color palette, consistent with shadcn/ui theme
- [x] Verification: layout renders on all pages without hydration errors

---

## TASK-3 — API Layer (TanStack Query)

**Type:** Infra

**Goal:** A single, typed API client. The rest of the app never calls `fetch` directly — everything goes through this layer.

- [x] Install and configure `@tanstack/react-query` with `QueryClientProvider` in root layout
- [x] `lib/api/client.ts` — base `fetch` wrapper that reads `NEXT_PUBLIC_API_URL`, parses the `{ success, data, meta }` envelope, and throws typed errors on failure
- [x] `lib/api/analysis.ts` — `postAnalysis(input: string)` function
- [x] `lib/types/analysis.ts` — TypeScript types mirroring api DTOs exactly:
  - `AnalysisResult` (`businessName`, `address`, `score`, `breakdown`, `issues`)
  - `RuleBreakdown` (`ruleId`, `weight`, `score`, `passed`)
  - `RuleIssue` (`ruleId`, `message`, `recommendation`, `potentialGain`)
  - `ApiError` (typed error with `statusCode`, `message`)
- [x] `hooks/use-analysis.ts` — `useMutation` wrapper around `postAnalysis`
- [x] Verification: `postAnalysis` called manually returns a correctly typed response

---

## TASK-4 — Home Page: Input Form & States

**Type:** Feature

**Goal:** The user can paste a Google Maps URL or Place ID, submit the form, and see a clear loading or error state before results appear.

- [x] `app/page.tsx` — main home page
- [x] `components/analysis/search-form.tsx` — input field with search icon + "Analyze profile" button
  - [x] Submit on button click and on `Enter` key
  - [x] Input validation: disabled submit on empty input
  - [x] Inline loading indicator beneath the input while the request is in-flight
  - [x] Inline error display beneath the input (handles 400 / 404 / 429 / 502 with user-friendly messages)
- [x] `lib/recent-searches.ts` — localStorage adapter:
  - [x] `getRecentSearches(): RecentSearch[]` — reads and parses from `localStorage`
  - [x] `addRecentSearch(name: string, input: string)` — prepends entry, keeps last 10, deduplicates by input
  - [x] `RecentSearch` type: `{ input: string; businessName: string; cachedAt: number }`
- [x] `components/layout/recent-dropdown.tsx` — "Recent" button in header that opens a dropdown list with cached business names and a "Cached 24h" label; clicking an entry re-runs the analysis
- [x] Verification: submit → loading state visible → error renders inline on bad input

> **Design Decision:** Recent search history is stored in `localStorage` (client-side only). This was a deliberate choice for the MVP scope — there is no database on the api at this stage. When user authentication and a database are introduced in a future iteration, this can be migrated to server-side persistence without changing the UI contract.

---

## TASK-5 — Results Section

**Type:** Feature (Core)

**Goal:** After a successful analysis, the user sees a rich results panel with a score, rule breakdown, and actionable issues — all matching the design mockup and Rule Engine 2.0 (Percentages).

- [x] `components/analysis/results-panel.tsx` — conditional render: shown only when data is available
- [x] `components/analysis/score-card.tsx`:
  - [x] Circular progress chart (Recharts `RadialBarChart`) colored by score range (green ≥ 80, yellow ≥ 50, red < 50)
  - [x] Score number in the center (`XX / 100`)
  - [x] Business name and "Google Business Profile" subtitle beneath the chart
  - [x] Collapsible "Score guide" section (shadcn `Collapsible`)
- [x] `components/analysis/breakdown-card.tsx`:
  - [x] Title "Rule breakdown (N)" where N = number of rules
  - [x] For each rule: colored dot (green/yellow/red by `passed` + score ratio), rule name, progress bar, `score % / weight %` label
  - [x] Scrollable list if rules overflow the card height
- [x] `components/analysis/detailed-analysis.tsx` & `help-tooltip.tsx`:
  - [x] Title "Detailed Data Analysis"
  - [x] Dynamic rule mapping using `WEIGHTED_RULES` from `scoring.ts`
  - [x] Hovering on a metric shows a dynamic tooltip with the rule's specific description
  - [x] Unused rules correctly display as `N/A`
- [x] `components/analysis/issues-list.tsx`:
  - [x] Title "Identified problems (N)"
  - [x] Each issue card: rule name as title, `message` as body, priority badge in top-right corner
- [x] `components/analysis/recommendations-list.tsx`:
  - [x] Title "Recommendations"
  - [x] Each card: `recommendation` text, "Fixes X% penalty" label in red (using `potentialGain` from the API)
- [x] Verification: full mock API response renders all panels correctly

---

## TASK-6 — Documentation Page

**Type:** Feature

**Goal:** A static `/docs` page that transparently explains what the tool analyzes, what it does not, and how the score is calculated — mirroring the api README.

- [x] `app/docs/page.tsx` — documentation page
- [x] Section: "How it works" — short product description, input formats supported
- [x] Section: "Scoring algorithm" — dynamic table iterating over `WEIGHTED_RULES` showing 9 rules, icons, descriptions, and dynamic % weights
- [x] Section: "What is NOT analyzed" — Posts, Q&A, NAP consistency, review velocity, photo freshness
- [x] Section: "Technical notes" — `photoCount` API limitation, `attributes` category dependency
- [x] Navigation link to `/docs` in the header
- [x] Verification: page renders statically with no API calls

---

## TASK-7 — README

**Type:** Docs

**Goal:** A developer drops into `apps/web/` and within 5 minutes understands the product, setup, and key decisions.

- [x] Product description + link to live api (`/api/docs`)
- [x] Tech stack table (Next.js, TypeScript, Tailwind, shadcn/ui, TanStack Query, Recharts, tw-animate-css, Sonner)
- [x] Local setup instructions (`npm run install:all` + `npm run dev`)
- [x] Example `.env` with `NEXT_PUBLIC_API_URL`
- [x] Architecture overview: pure presentation layer concept, UI components
- [x] **Explicit note on `localStorage` for Recent history:** Explain that server-side persistence was deliberately skipped in this MVP.
- [x] "Consciously Postponed" section (Auth, DB-backed history, E2E tests, export)
