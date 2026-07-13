# ProfileLens — Frontend Tasks (Test Assignment)

## DO NOT read this file further unless explicitly requested

> A step-by-step plan for frontend implementation. Each task corresponds to a single functional layer. Everything related to future scaling (Auth, DB-backed history, export, batch analysis) is deliberately **excluded** — this is strictly the scope of the test assignment MVP.

**Tasks:** 7 · **Pages:** `/` (home), `/docs` · **Stack:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts, TanStack Query

---

## TASK-1 — Project Initialization

**Type:** Setup / Infra

**Goal:** A working Next.js skeleton with strict TypeScript, Tailwind, shadcn/ui, and a consistent code quality setup — ready to run locally and in Docker.

- [ ] `npx create-next-app` (TypeScript, App Router, strict mode in `tsconfig.json`)
- [ ] ESLint + Prettier config (consistent with monorepo standards)
- [ ] Tailwind CSS configured with custom theme tokens (colors, fonts)
- [ ] shadcn/ui initialized (`npx shadcn@latest init`)
- [ ] `.env.local.example` with `NEXT_PUBLIC_API_URL` variable
- [ ] Verification: `npm run dev` starts the app, no TypeScript errors

---

## TASK-2 — Layout & Design System

**Type:** Infra

**Goal:** Global layout, header, footer, and base design tokens in place before building any feature page.

- [ ] `components/layout/header.tsx` — logo ("ProfileLens / Business Profile Audit"), "Recent" dropdown trigger, "BPA - audit tool · mvp" label on the right
- [ ] `components/layout/footer.tsx` — "Business Profile Audit 2026. All rights reserved."
- [ ] `app/layout.tsx` — root layout wrapping all pages with header + footer
- [ ] Google Font configured (e.g., Inter) via `next/font`
- [ ] Global CSS variables for color palette, consistent with shadcn/ui theme
- [ ] Verification: layout renders on all pages without hydration errors

---

## TASK-3 — API Layer (TanStack Query)

**Type:** Infra

**Goal:** A single, typed API client. The rest of the app never calls `fetch` directly — everything goes through this layer.

- [ ] Install and configure `@tanstack/react-query` with `QueryClientProvider` in root layout
- [ ] `lib/api/client.ts` — base `fetch` wrapper that reads `NEXT_PUBLIC_API_URL`, parses the `{ success, data, meta }` envelope, and throws typed errors on failure
- [ ] `lib/api/analysis.ts` — `postAnalysis(input: string)` function
- [ ] `lib/types/analysis.ts` — TypeScript types mirroring backend DTOs exactly:
  - `AnalysisResult` (`businessName`, `address`, `score`, `breakdown`, `issues`)
  - `RuleBreakdown` (`ruleId`, `weight`, `score`, `passed`)
  - `RuleIssue` (`ruleId`, `message`, `recommendation`, `potentialGain`)
  - `ApiError` (typed error with `statusCode`, `message`)
- [ ] `hooks/use-analysis.ts` — `useMutation` wrapper around `postAnalysis`
- [ ] Verification: `postAnalysis` called manually returns a correctly typed response

---

## TASK-4 — Home Page: Input Form & States

**Type:** Feature

**Goal:** The user can paste a Google Maps URL or Place ID, submit the form, and see a clear loading or error state before results appear.

- [ ] `app/page.tsx` — main home page
- [ ] `components/analysis/search-form.tsx` — input field with search icon + "Analyze profile" button
  - [ ] Submit on button click and on `Enter` key
  - [ ] Input validation: disabled submit on empty input
  - [ ] Inline loading indicator beneath the input while the request is in-flight
  - [ ] Inline error display beneath the input (handles 400 / 404 / 429 / 502 with user-friendly messages)
- [ ] `lib/recent-searches.ts` — localStorage adapter:
  - [ ] `getRecentSearches(): RecentSearch[]` — reads and parses from `localStorage`
  - [ ] `addRecentSearch(name: string, input: string)` — prepends entry, keeps last 10, deduplicates by input
  - [ ] `RecentSearch` type: `{ input: string; businessName: string; cachedAt: number }`
- [ ] `components/layout/recent-dropdown.tsx` — "Recent" button in header that opens a dropdown list with cached business names and a "Cached 24h" label; clicking an entry re-runs the analysis
- [ ] Verification: submit → loading state visible → error renders inline on bad input

> **Design Decision:** Recent search history is stored in `localStorage` (client-side only). This was a deliberate choice for the MVP scope — there is no database on the backend at this stage. When user authentication and a database are introduced in a future iteration, this can be migrated to server-side persistence without changing the UI contract.

---

## TASK-5 — Results Section

**Type:** Feature (Core)

**Goal:** After a successful analysis, the user sees a rich results panel with a score, rule breakdown, and actionable issues — all matching the design mockup.

- [ ] `components/analysis/results-panel.tsx` — conditional render: shown only when data is available
- [ ] `components/analysis/score-card.tsx`:
  - [ ] Circular progress chart (Recharts `RadialBarChart`) colored by score range (green ≥ 80, yellow ≥ 50, red < 50)
  - [ ] Score number in the center (`XX / 100`)
  - [ ] Business name and "Google Business Profile" subtitle beneath the chart
  - [ ] Collapsible "Score guide" section (shadcn `Collapsible`)
- [ ] `components/analysis/breakdown-card.tsx`:
  - [ ] Title "Rule breakdown (N)" where N = number of rules
  - [ ] For each rule: colored dot (green/yellow/red by `passed` + score ratio), rule name, progress bar, `score / weight` label
  - [ ] Scrollable list if rules overflow the card height
- [ ] `components/analysis/issues-list.tsx`:
  - [ ] Title "Identified problems (N)"
  - [ ] Each issue card: rule name as title, `message` as body, weight badge ("W: X") in top-right corner
- [ ] `components/analysis/recommendations-list.tsx`:
  - [ ] Title "Recommendations"
  - [ ] Each card: `recommendation` text, "Fixes Xpt penalty" label in red (using `potentialGain` from the API)
- [ ] Verification: full mock API response renders all four panels correctly

---

## TASK-6 — Documentation Page

**Type:** Feature

**Goal:** A static `/docs` page that transparently explains what the tool analyzes, what it does not, and how the score is calculated — matching the spirit of the backend README.

- [ ] `app/docs/page.tsx` — documentation page
- [ ] Section: "How it works" — short product description, input formats supported (Place ID, short link, full Maps URL)
- [ ] Section: "Scoring algorithm" — table with all 7 rules, weight, and why it matters (mirrors backend README table)
- [ ] Section: "What is NOT analyzed" — Posts, Q&A, NAP consistency, review velocity, photo freshness
- [ ] Section: "Technical notes" — `photoCount` API limitation, `attributes` category dependency
- [ ] Navigation link to `/docs` in the header
- [ ] Verification: page renders statically with no API calls

---

## TASK-7 — README

**Type:** Docs

**Goal:** A developer drops into `apps/web/` and within 5 minutes understands the product, setup, and key decisions.

- [ ] Product description + link to live backend (`/api/docs`)
- [ ] Tech stack table (Next.js, TypeScript, Tailwind, shadcn/ui, TanStack Query, Recharts)
- [ ] Local setup instructions (`npm install` + `npm run dev`)
- [ ] Example `.env.local` with `NEXT_PUBLIC_API_URL`
- [ ] Architecture overview: page/component/hook structure
- [ ] **Explicit note on `localStorage` for Recent history:** Explain that server-side persistence was deliberately skipped in this MVP because there is no database yet. `localStorage` was chosen as the simplest solution that keeps the feature fully functional without introducing a backend dependency.
- [ ] "Consciously Postponed" section (Auth, DB-backed history, E2E tests, export)
