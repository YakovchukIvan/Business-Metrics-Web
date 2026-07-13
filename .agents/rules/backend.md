# Backend Architecture (NestJS)

> Paths below are relative to `backend/`, since `.agents/` lives at the monorepo root. See `.agents/rules/global.md` for workflow, commit, and Docker rules that also apply here — not repeated below.

## 1. Core Stack

- **Framework:** NestJS 11 + TypeScript (strict mode, `noUncheckedIndexedAccess` enabled).
- **Validation:** class-validator (DTOs), Zod (environment config via `config/config.schema.ts`).

## 2. Strict Architectural Boundaries

- **Module Independence:** Modules (`cache`, `google-places`, `analysis`) MUST be completely decoupled. They communicate ONLY via interfaces (ports) and DI tokens. If you delete one module, the rest of the application must still compile.
- **Enforced by ESLint, not just convention.** `backend/eslint.config.mjs` has `import/no-restricted-paths` rules that fail the build on cross-module imports that bypass `interfaces/`. Do not work around this via re-export barrels — fix the architecture, or ask the user.
- **No `process.env`:** Never use it directly. Everything goes through the typed `ConfigService`.
- **Pure Rules Engine:** Every rule in `src/modules/analysis/rules/` is a pure function (`(profile: PlaceProfile) => RuleResult`). No side effects, no DI inside rule files.
- **Pricing Guardrail:** NEVER request `places.reviews` from Places API (New) — see `.agents/skills/google-places.md` for the full approved FieldMask.
- **Path aliases:** if you use `@/`, the build script (`nest build && tsc-alias`) must run, or `node dist/main.js` fails at runtime with `Cannot find module '@/...'`.

## 3. Directory Structure Paradigm

- `src/common/`: Global cross-cutting concerns (exception filters, response interceptor for the `{ success, data, meta }` envelope, throttler guards). Business modules don't know this layer exists.
- `src/config/`: Zod schemas + `ConfigService` wiring.
- `src/modules/cache/`: Exposes only `ICacheService` via the `CACHE_SERVICE` DI token. In-memory now, swappable to Redis later with a single provider-line change — no consumer code should change when that happens.
- `src/modules/google-places/`: The Adapter. Resolves input (Place ID / short link / full Maps link with CID), calls Google Places API (New), caches results via `CACHE_SERVICE`, and maps raw responses into the strict `PlaceProfile` interface.
- `src/modules/analysis/`: The Business Core. Depends EXCLUSIVELY on `PlaceProfile` — must never import anything Google-specific. Route paths and rule weights/thresholds live in `analysis.constants.ts` and `analysis.routes.ts`, never inline.

## 4. Full Architecture Reference

This file has only the enforceable, day-to-day rules. For the full rationale behind each pattern (why port/adapter, why pure functions, roadmap for Redis/BullMQ/Auth/Prisma), see `docs/architecture.md` in this repo.
