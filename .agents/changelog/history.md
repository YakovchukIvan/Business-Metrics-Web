# Changelog History

## DO NOT read this file further unless explicitly requested

### 11.07.2026, 17:15:42

- Added new rules in `global.md`: restriction on executing actions without explicit instruction ("Execution Intent") and the Changelog rule.
- Updated `on_stop.js` hook: it now checks for the existence of `current_task.txt`, appends its content with the current date and time to `history.md`, and then clears the temporary file.

### 11.07.2026, 17:28:32

- Established rule for commit generation (Option 3): updated `commits.md` so the AI agent always outputs a ready `git commit` command as a bash block in the chat for easy copying, without creating redundant files.

### 11.07.2026, 17:36:30

- Added reference to `commits.md` in `AGENTS.md` (Context Map) for automatic recognition of commit instructions by AI agents.
- Generated commits for all recent project changes.

### 11.07.2026, 17:44:16

- Added clarification to `commits.md`: explicitly enforced the requirement to use heredoc format (`cat <<'EOF'`) for multi-line commits since the developer uses Git Bash. This prevents agents from attempting to generate commits with PowerShell quotes.

### 11.07.2026, 17:47:52

- Removed the heredoc syntax requirement (`cat <<'EOF'`) from `commits.md` due to issues with the user's terminal hanging. Replaced with simple multi-line quotes for convenient copy-pasting.

### 11.07.2026, 21:44:50

- Implemented TASK-2 (Config module (Zod) + Common layer).

### 12.07.2026, 10:50:18

- Updated AGENTS.md and global.md rules: detailed task descriptions now go to state.md, and only 1-line notes go to history.md.

### 12.07.2026, 11:55:47

- Added proactive type imports rule to global.md.

### 12.07.2026, 15:02:02

- Updated state.md with detailed TASK-2 description and shrunk history.md to comply with logging rules.

### 12.07.2026, 15:04:40

- Added Style Consistency rule to global.md and fixed styling inconsistencies in state.md and history.md.

### 12.07.2026, 15:08:07

Translated all remaining Ukrainian documentation in .agents to English and added explicit warning headers to history.md

### 12.07.2026, 15:12:28

Translated api-architecture.md and hook scripts (pre_command.js, pre_edit.js) to English.

### 12.07.2026, 15:15:58

Removed 'Docker First' rule from global.md, updating the workflow to prioritize localhost testing instead.

### 12.07.2026, 17:09:25

Implemented TASK-3: Custom CacheModule with InMemoryCacheService, removed cache-manager dependencies, and added unit tests.

### 12.07.2026, 17:14:25

TASK-3: Fixed multiple strict linting and typecheck errors (bad import path, `any` instead of `unknown`, unused variables, require-await rules, and leftover cache.config.ts). Mistake happened because I skipped running `npm run lint:check && npm run typecheck` before reporting the task as finished.

### 12.07.2026, 17:24:07

TASK-4: Implemented GooglePlacesModule using port/adapter pattern. Created PlaceProfile, IGooglePlacesPort, resolver service (handling maps short links and CID text search fallbacks), mapper, and adapter using native fetch. Integrated with CACHE_SERVICE. Passed strict linting and typechecking.

### 12.07.2026, 23:25:00

TASK-5: Implemented AnalysisModule with 7 pure-function rules based on new SEO research. Orchestrated via AnalysisService. Passed strict lint and typecheck. Also removed config.module.ts, moving its initialization directly to app.module.ts.

### 12.07.2026, 23:50:00

TASK-6: Implemented API layer with Controller and DTOs. Configured rate-limiting using ThrottlerModule. Integrated with AnalysisService and validated Google API integration. Passed strict linting and typecheck.

### 13.07.2026, 12:06:45

TASK-7: Implemented Swagger documentation. Added DocumentBuilder in main.ts, configured env variables, created custom @ApiEnvelopeResponse decorator, and documented AnalysisController and DTOs. Passed strict linting and typecheck.

### 13.07.2026, 13:45:40

Refactored Swagger setup into a separate config file (swagger.config.ts) and removed duplicate logger in main.ts. Passed strict linting and typecheck.

### 13.07.2026, 15:30:05

Implemented comprehensive unit tests (TASK-8) for the rules engine, analysis orchestrator, and the Place ID resolver. Mapped place profile fixtures and ensured all 35 tests pass perfectly. Passed strict linting and typecheck constraints.

### 13.07.2026, 15:50:35

Implemented TASK-9 by writing a comprehensive README.md in apps/api/. Documented the architecture, evaluation algorithm, API limitations, and run instructions.

### 13.07.2026, 17:24:40

Updated web-architecture.md: bumped all library versions to latest stable (Jul 2026). Next.js 15 → 16.2.x, TypeScript → 7.0.x (Go rewrite), Tailwind CSS → 4.3.x, Recharts → 3.9.x, TanStack Query → 5.101.x. Added Version column to the stack table; noted shadcn/ui now defaults to Base UI primitives.

### 13.07.2026, 17:29:03

Created .agents/rules/web.md (Next.js architecture rules for apps/web/). Updated AGENTS.md: Phase 2 marked active, web.md and web-architecture.md added to Context Map.

### 13.07.2026, 17:53:35

Fixed husky pre-push hook to gracefully handle missing upstreams. Fixed web prettier errors and added 'typecheck' script to web/package.json. Committed changes.

### 13.07.2026, 18:03:52

Updated .gitignore with Next.js specific directories (.next/, out/, .vercel/) and local env files.

### 13.07.2026, 18:08:53

Ignored next-env.d.ts in root .prettierignore and apps/web/eslint.config.mjs to resolve auto-generated Next.js double-quotes conflict with Prettier.

### 13.07.2026, 18:15:59

Created initial empty file structure for apps/web/ following the web architecture rules (components, lib, hooks, config, app routes).

### 13.07.2026, 18:21:35

Removed all mentions of ui-kit/page.tsx from docs and deleted the directory apps/web/src/app/ui-kit/ as per user request.

### 13.07.2026, 18:27:49

Refactored Dockerfiles and docker-compose.yml files in api and web to properly use the dynamic PORT env variables for port mapping and healthchecks, ensuring universal deployment capabilities.

### 13.07.2026, 18:42:11

Added explicit Server vs Client component boundaries to web rules and architecture docs, clarifying Next.js composition patterns. Created `.agents/workflows/new-web-component.md` for consistent component creation.

### 13.07.2026, 19:14:18

Renamed new-module.md to new-api-module.md and updated AGENTS.md to reference the correct api/web workflows.

### 13.07.2026, 19:18:31

Analyzed web web state and updated state.md with new tasks (TASK-10, TASK-11, TASK-12) to reflect current progress and missing pieces.

### 13.07.2026, 19:33:05

Split state.md into state-api.md and state-web.md to properly reflect the monorepo architecture, and updated AGENTS.md to point to the new files.

### 13.07.2026, 19:34:48

Executed global text replacement in all .agents/ docs: replaced 'backend'/'Backend' with 'api'/'Api' and 'frontend'/'Frontend' with 'web'/'Web'.

### 13.07.2026, 21:19:30

Stage 1 (UI Primitives): Verified and initialized basic UI dependencies (`clsx`, `tailwind-merge`, `lucide-react`, and `cn` utility) for transferring design components. Discovered that the design `App.tsx` exclusively uses pure HTML + Tailwind instead of Shadcn UI components, meaning no UI components needed to be copied. Stage 1 is fully complete.

### 13.07.2026, 21:22:36

Stage 2 (Layout Framework): Successfully transferred the global layout from the design mockup. Created `Header` and `RecentDropdown` as Client Components (`'use client'`) to handle navigation state and dropdown interactions. Created `Footer` as a Server Component. Integrated these into `app/layout.tsx` alongside Next.js layout structure and styling defaults. Updated `state-web.md`.

### 13.07.2026, 21:24:42

Stage 3 (Static Pages & Forms): Extracted the `SearchForm` into a Client Component (`components/analysis/search-form.tsx`) that manages its own input state and displays the loading animation. Extracted the entire `Documentation` section into a statically rendered Next.js Server Component page (`app/docs/page.tsx`), replacing `onNavigate` custom logic with Next.js `<Link>` components.

### 13.07.2026, 21:27:06

Stage 4 (Results Components): Extracted the analysis results UI into small, modular components (`score-card.tsx`, `breakdown-card.tsx`, `issues-list.tsx`, `transparency-panel.tsx`, `results-panel.tsx`). Assembled `app/page.tsx` utilizing these components with temporary mock data and a simulated timeout to allow for immediate visual testing of the UI against the main `globals.css` theme. Checked off related items in `state-web.md`.

### 13.07.2026, 21:32:12

Stage 5 (API Integration): Replaced mock logic with real TanStack Query implementations. Created API types (`analysis.ts`), HTTP client wrapper (`client.ts`), and standard hooks (`use-analysis.ts`). Integrated `QueryClientProvider` into root layout. Wired `page.tsx` to actually send requests to `NEXT_PUBLIC_API_URL`. Implemented LocalStorage history tracking in `recent-searches.ts` and connected it to `RecentDropdown`.

### 14.07.2026, 09:38:00

Fixed CORS issue by enabling `app.enableCors()` in the API's `main.ts`. Fixed double `/api/api` path issue in frontend requests by correcting `NEXT_PUBLIC_API_URL` in web `.env` and `.env.example` to point to `http://localhost:5000` without the trailing `/api`.

### 14.07.2026, 10:25:00

Fixed Zod schema deprecation warnings, cleaned up unnecessary CORS headers, fixed frontend API request path (`/api/analysis`), updated Docker build to accept `NEXT_PUBLIC_API_URL`, and fixed DTO property mismatch (`url` -> `input`).

### 14.07.2026, 10:35:00

Refactored `ResultsPanel` to render `IssueCard` and `RecommendationCard` in a shared responsive grid, ensuring Problem and Recommendation cards strictly match heights row-by-row on desktop, and interleave logically on mobile.

### 14.07.2026, 10:40:00

Created reusable `HelpTooltip` component. Integrated it into `ScoreCard` and `RecentDropdown`. Fixed `page.tsx` to auto-trigger analysis when navigating to `/?url=...` from the Recent Dropdown.

### 14.07.2026, 12:54:50

Updated apps/web/README.md for TASK-7 and fixed a Prettier formatting issue in docs/page.tsx.
