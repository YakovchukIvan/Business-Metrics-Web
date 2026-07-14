# ProfileLens — Web Architecture & Implementation Plan

## DO NOT read this file further unless explicitly requested

> Next.js web for the ProfileLens GBP audit tool. Accepts a Google Maps URL or Place ID via a search form, calls the api API, and renders a rich audit result — score, rule breakdown, issues, and recommendations. Designed to mirror the same structural principles as the api: clear boundaries, single points of responsibility, and explicit future extension paths.

---

## 1. Technology Stack

| Layer             | Technology                       | Version (as of Jul 2026) | Comment                                                                                    |
| ----------------- | -------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------ |
| Framework         | Next.js (App Router)             | **16.2.x** (LTS: 15.x)   | Server and Client Components, file-system routing                                          |
| Language          | TypeScript (strict mode)         | **7.0.x**                | TS 7 компілятор переписано на Go — значно швидша збірка; strict mode обов'язковий          |
| Styling           | Tailwind CSS v4                  | **4.3.x**                | Utility-first, co-located with components; конфіг через CSS-змінні (без `tailwind.config`) |
| Component Library | shadcn/ui (Radix)                | CLI `@latest`            | Copied primitives — we own the code. Default primitive: Base UI / Radix UI                 |
| Animations        | tw-animate-css                   | **1.4.x**                | Fluid micro-animations (e.g., staggered fade-ins) without heavy JS libraries.              |
| Notifications     | Sonner                           | **2.0.x**                | Elegant toast notifications for error handling and UX feedback.                            |
| Charts            | Recharts                         | **3.9.x**                | `RadialBarChart` for circular score visualization; requires React 16.8+, TS 5+             |
| Data Fetching     | TanStack Query v5                | **5.101.x**              | `useMutation` for analysis, handles loading/error/success states, request deduping         |
| Env Validation    | `config/env.ts` (custom, no Zod) | —                        | Single typed getter — no scattered `process.env.X!` across the codebase                    |
| Recent History    | `localStorage` (client-side)     | —                        | Deliberate MVP decision — no DB yet; see Section 2.5                                       |
| Deployment        | Vercel                           | —                        | Zero-config for Next.js; `NEXT_PUBLIC_API_URL` set as environment variable                 |
| Shared Types      | Manual mirror of api DTOs        | —                        | Acceptable for MVP; extracted to `packages/shared-types` when types start diverging        |

---

## 2. Key Architectural Decisions

### 2.1 `lib/api/client.ts` — the single point of contact with the api

The same philosophy as `GooglePlacesAdapter` on the api: **one file owns all network calls**. Components and hooks never call `fetch` directly.

`client.ts` is responsible for:

- Reading `NEXT_PUBLIC_API_URL` from `config/env.ts` (not raw `process.env`)
- Parsing the standard `{ success, data, meta }` envelope from every response
- On `success: false` — throwing a typed `ApiError` (defined in `lib/api/errors.ts`)
- On non-JSON or network failure — throwing a normalized `ApiError` with code `SERVICE_UNAVAILABLE`

This means `use-analysis.ts` and all future hooks receive either clean typed data or a structured error — never a raw `Response` or untyped `unknown`.

### 2.2 Error mapping — typed codes → user-friendly messages

The api sends structured errors with HTTP status codes. The web maps them in a single place — `lib/api/errors.ts`:

| HTTP Status | Api code            | Displayed message                                                                     |
| ----------- | ------------------- | ------------------------------------------------------------------------------------- |
| 400         | (bad request)       | "That doesn't look like a Google Business Profile link or Place ID. Check and retry." |
| 404         | `PROFILE_NOT_FOUND` | "No profile found for this link."                                                     |
| 429 / 502   | `QUOTA_EXCEEDED`    | "Google's API is temporarily unavailable. Try again in a moment."                     |

No component contains error strings — they are all centralized in `errors.ts` and looked up by status code. Errors are displayed inline below the search form (not as a toast or a separate page).

### 2.3 Server Components vs Client Components (Strict Boundaries)

The boundary follows Next.js best practices — use Server Components by default, drop to Client only when necessary. Both must strictly respect their constraints:

- **Server Components:** No hooks (`useState`, `useEffect`), no DOM APIs. (Note: do NOT write `'use server'` at the top of a Server Component. That directive is strictly for Server Actions).
- **Client Components:** Defined with `'use client';` at the very top.
- **Import Restrictions:** A Client Component CANNOT import a Server Component directly. If you need a Server Component inside a Client Component, it must be passed down as a `children` prop (Composition Pattern).

| Area                           | Rendering  | Reason                                            |
| ------------------------------ | ---------- | ------------------------------------------------- |
| `app/layout.tsx`               | Server     | Static shell, no interactivity                    |
| `app/docs/page.tsx`            | Server     | Fully static content, no API calls, best for SEO  |
| `app/page.tsx`                 | Server     | Shell only; delegates interactive parts to client |
| `components/analysis/*`        | **Client** | TanStack Query, form state, conditional rendering |
| `components/layout/header.tsx` | **Client** | Recent dropdown reads from `localStorage`         |
| `components/layout/footer.tsx` | Server     | Static content                                    |

`QueryClientProvider` is wrapped in a dedicated `app/providers.tsx` Client Component — keeping `layout.tsx` itself a Server Component.

### 2.4 Component boundary — three layers, no cross-contamination

Mirrors the api module isolation (`cache` / `google-places` / `analysis`):

```ts
components/ui/          ← shadcn/ui primitives (Button, Input, etc.)
components/layout/      ← app shell (header, footer, recent dropdown)
components/analysis/    ← feature components (score-card, breakdown, issues)
```

**Rule:** `ui/` never imports from `analysis/` or `layout/`. `layout/` never imports from `analysis/`. Dependency flows in one direction only — feature components build on primitives, never the reverse. ESLint `import/no-restricted-paths` enforces this, same as on the api.

### 2.5 Dynamic Rules Mapping (`scoring.ts` & Tooltips)

The frontend never calculates scores or weights. However, it needs to know how to present the rules beautifully. `src/lib/constants/scoring.ts` is the single source of truth for the UI. It maps each backend `ruleId` to:

- A human-readable `name`
- An `icon` (Lucide React)
- A `description` (rendered in dynamic `HelpTooltip` components)
- A `priority` (High, Medium, Low for color-coding recommendations)

This allows the UI (like `detailed-analysis.tsx` and `app/docs/page.tsx`) to dynamically render rule descriptions and icons without hardcoding them into multiple components.

### 2.6 `localStorage` for Recent search history — a deliberate MVP decision

The "Recent" dropdown in the header shows previously analyzed businesses (name + cached indicator). This data is stored in `localStorage` exclusively on the client side.

**Why:** There is no database in this MVP version. Introducing a api persistence layer for this feature alone would add `AuthModule` + `PrismaModule` + a new endpoint — disproportionate for a list of recent searches.

**What is stored:** `RecentSearch[]` — `{ input: string; businessName: string; cachedAt: number }`. Max 10 entries, deduplicated by `input`, newest first.

**Migration path:** When authentication and a database are introduced in a future iteration, `lib/recent-searches.ts` is the only file that changes — its interface (`getRecentSearches`, `addRecentSearch`) remains identical. The components that consume it require no modifications.

### 2.7 `config/env.ts` — typed environment access

No raw `process.env.NEXT_PUBLIC_API_URL!` scattered across the codebase. A single typed getter centralizes access and provides a clear startup error if the variable is missing:

```ts
// config/env.ts
export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error('NEXT_PUBLIC_API_URL is not defined');
  return url;
}
```

This is the web equivalent of the api's Zod `configSchema` — lighter, but the same principle: fail loudly at the boundary, not silently mid-request.

### 2.8 Shared types — manual mirror, consciously postponed extraction

`lib/types/analysis.ts` contains TypeScript types that manually mirror the api DTOs:

```ts
export interface AnalysisResult {
  businessName: string;
  address: string | null;
  score: number;
  breakdown: RuleBreakdown[];
  issues: RuleIssue[];
}
// ... RuleBreakdown, RuleIssue, ApiError
```

For the MVP, this manual duplication is acceptable — there is no shared package infrastructure yet. When types start diverging between web and api (which they will as the product grows), this becomes `packages/shared-types` in the monorepo.

This is explicitly documented in the web README as "Consciously Postponed."

---

## 3. Project Structure

```bash
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout — Server Component, imports providers.tsx
│   │   ├── providers.tsx                 # Client Component — QueryClientProvider wrapper
│   │   ├── page.tsx                      # Home page shell — Server Component
│   │   ├── globals.css                   # Tailwind base + CSS variables
│   │   └── docs/
│   │       └── page.tsx                  # Static documentation page — Server Component
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui primitives (Button, Input, etc.) — do not add business logic here
│   │   ├── layout/
│   │   │   ├── header.tsx                # Logo, Recent dropdown trigger, "BPA - audit tool · mvp" label
│   │   │   ├── footer.tsx                # Static footer
│   │   │   └── recent-dropdown.tsx       # Reads localStorage, renders recent search history
│   │   └── analysis/
│   │       ├── search-form.tsx           # Input + button + inline loading/error states
│   │       ├── results-panel.tsx         # Conditional wrapper — shown only when data is available
│   │       ├── detailed-analysis.tsx     # Displays raw data with HelpTooltip components
│   │       ├── help-tooltip.tsx          # Reusable hover tooltip for rule descriptions
│   │       ├── score-card.tsx            # Circular chart (Recharts) + businessName + score guide collapsible
│   │       ├── breakdown-card.tsx        # Rule-by-rule progress bars (score / weight)
│   │       ├── issues-list.tsx           # Identified problems with weight badges
│   │       └── recommendations-list.tsx  # Recommendations with "Fixes Xpt penalty" label
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                 # Base fetch wrapper — envelope parsing, error normalization
│   │   │   ├── analysis.ts               # postAnalysis(input: string): Promise<AnalysisResult>
│   │   │   └── errors.ts                 # ApiError type + status code → user message mapping
│   │   ├── types/
│   │   │   └── analysis.ts               # AnalysisResult, RuleBreakdown, RuleIssue — mirrors api DTOs
│   │   ├── constants/
│   │   │   └── scoring.ts                # Maps ruleIds to names, icons, descriptions, and priorities
│   │   ├── recent-searches.ts            # localStorage adapter + RecentSearch type
│   │   └── utils.ts                      # cn() and other shadcn/ui helpers
│   │
│   ├── hooks/
│   │   └── use-analysis.ts               # useMutation wrapper — thin React layer over postAnalysis
│   │
│   └── config/
│       └── env.ts                        # Typed NEXT_PUBLIC_API_URL getter — fails loudly if missing
│
├── public/
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json                          # strict mode enabled
├── components.json                        # shadcn/ui config
└── package.json
```

---

## 4. Pages & Components

### 4.1 Home Page (`/`)

The primary user flow: paste a link → submit → see the result on the same page.

**States:**

- **Empty** — "Enter a profile link to begin the audit." placeholder text
- **Loading** — inline spinner/skeleton beneath the input while the request is in-flight
- **Error** — inline error card beneath the input (see Section 2.2 for error mapping)
- **Success** — `ResultsPanel` appears below the form with score, breakdown, issues, and recommendations

The form never navigates away — result renders on the same page. Each successful analysis appends to `localStorage` via `lib/recent-searches.ts`.

### 4.2 Documentation Page (`/docs`)

Static Server Component. Explains the tool to the user directly in the app — mirrors the api README content but written for end users, not developers:

- "How it works" — accepted input formats (Place ID, short link, full Maps URL)
- "Scoring algorithm" — table of 7 rules, weights, and why they matter
- "What is NOT analyzed" — Posts, Q&A, NAP consistency, review velocity, photo freshness
- "Technical notes" — `photoCount` API limitation, `attributes` category dependency

## 5. Data Flow

```ts
User input
    │
    ▼
search-form.tsx
    │  calls
    ▼
use-analysis.ts (useMutation)
    │  calls
    ▼
lib/api/analysis.ts → postAnalysis()
    │  calls
    ▼
lib/api/client.ts → fetch(NEXT_PUBLIC_API_URL + '/analysis')
    │
    ├─ success → AnalysisResult (typed) → results-panel.tsx renders
    │                                   → lib/recent-searches.ts saves to localStorage
    │
    └─ error → ApiError (typed) → lib/api/errors.ts maps to message → search-form.tsx shows inline
```

No component makes a network call directly. No component contains error message strings. Every step has a single, named responsibility.

---

## 6. Deployment

The web is deployed to **Vercel**. No CORS configuration is required — in production, `NEXT_PUBLIC_API_URL` points to the deployed api (e.g., a VPS or Railway). Locally, it points to `http://localhost:3000`.

```env
# .env.local.example
NEXT_PUBLIC_API_URL=http://localhost:3000
```

The api's `THROTTLER_LIMIT` (5 req/min) and `CACHE_TTL_SECONDS` (86400) are the primary mechanism protecting the Google API quota. The web has no additional rate-limiting logic — this is intentional for the MVP.

---

## 7. Scaling Roadmap

| Step                            | When (approx.)             | What is added                                                        | Why it doesn't break existing code                                             |
| ------------------------------- | -------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Shared types package            | When types start diverging | `packages/shared-types` in monorepo root                             | `lib/types/analysis.ts` is replaced by an import — component code is unchanged |
| DB-backed recent history        | After Auth + DB            | New api endpoint; `lib/recent-searches.ts` swaps `localStorage` impl | Hook and component interfaces remain identical                                 |
| User authentication             | As needed                  | Auth provider wraps `providers.tsx`; guarded routes via middleware   | Existing pages are unaffected unless explicitly guarded                        |
| E2E tests (Playwright)          | As needed                  | Test against real API or mock server                                 | Component structure is already testable — no logic hidden in JSX               |
| Multiple result pages / history | After Auth + DB            | `/analysis/[id]` route; shareable links                              | Api already caches by Place ID — web just needs a new route                    |

---

## 8. What is Deliberately NOT included in this version

- **Authentication** — the tool is publicly accessible, no login required
- **Server-side recent history** — `localStorage` only; see Section 2.5
- **E2E or component tests** — deliberately skipped for MVP scope
- **Export (PDF/CSV)** — requires api `reports/` module first
- **Custom rule selection UI** — api architecture already supports it; web deferred
- **Shared types package** — manual mirror is acceptable until types diverge; see Section 2.7
