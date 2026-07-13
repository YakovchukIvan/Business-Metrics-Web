# ProfileLens — Api Tasks (Test Assignment)

## DO NOT read this file further unless explicitly requested

> A step-by-step plan for api implementation. Each task corresponds to a single module from the architectural plan. Everything related to future scaling (Redis, BullMQ, Auth, Prisma, export module) is deliberately **excluded** — this is strictly the scope of the test assignment MVP.

**Tasks:** 9 · **Modules:** cache, google-places, analysis · **Stack:** NestJS, TypeScript, Zod, Docker, Google Places API (New), Swagger

---

## TASK-1 — Project Initialization + Docker

**Type:** Setup / Infra

**Goal:** A working NestJS project skeleton that runs immediately inside a Docker container.

- [x] `nest new` (TypeScript, strict mode in `tsconfig.json`)
- [x] ESLint + Prettier config (with `boundaries` and strict rules configured)
- [x] `Dockerfile` — multi-stage build
- [x] `docker-compose.yml` — just one service for now
- [x] `.env.example` with a list of expected variables (without actual values)
- [x] `GET /health` — basic health-check endpoint (plain JSON)
- [x] Verification: `docker compose up` starts the app, `/health` returns 200

---

## TASK-2 — Config module (Zod) + Common layer

**Type:** Infra

**Goal:** No direct `process.env` usage in the code. Global error handling, request validation, and response formatting are wired up before building the first business endpoint.

- [x] `config/config.schema.ts` — Zod schema (`GOOGLE_PLACES_API_KEY`, `PORT`, `CACHE_TTL_SECONDS`, `NODE_ENV`)
- [x] `config/config.module.ts` — `ConfigModule.forRoot({ validate })`
- [x] `config/app.config.ts`, `config/google-places.config.ts`, `config/cache.config.ts`
- [x] `common/filters/all-exceptions.filter.ts`
- [x] `common/pipes/global-validation.pipe.ts`
- [x] `common/interceptors/response.interceptor.ts` — `{ success, data, meta }`
- [x] `common/dto/res/api-response-envelope.dto.ts`
- [x] Global setup in `main.ts`
- [x] Verification: Missing mandatory key in `.env` → application crashes on startup with a clear Zod error

---

## TASK-3 — CacheModule

**Type:** Module

**Goal:** A caching layer with an implementation-agnostic interface.

- [x] `interfaces/cache-service.interface.ts` — `ICacheService` (`get`, `set`, `delete`)
- [x] `cache.constants.ts` — DI token `CACHE_SERVICE`
- [x] `adapters/in-memory-cache.service.ts` — custom in-memory adapter (Map + setTimeout) instead of external dependencies
- [x] `cache.module.ts` — registers `InMemoryCacheService`, `exports: [CACHE_SERVICE]`
- [x] Verification: unit test for `set/get/delete` and TTL expiration

---

## TASK-4 — GooglePlacesModule (Port/Adapter)

**Type:** Module

**Goal:** A single point of contact with Google APIs. The rest of the system operates strictly with a standardized `PlaceProfile`.

- [x] `interfaces/place-profile.interface.ts` — `PlaceProfile`
- [x] `interfaces/google-places-port.interface.ts` — `IGooglePlacesPort` (`resolvePlaceId`, `getPlaceProfile`)
- [x] `place-id-resolver.service.ts` — asynchronous service with network calls:
  - [x] Resolves standard Place IDs (e.g., prefix `ChIJ`)
  - [x] HTTP resolution of short links (`maps.app.goo.gl/...`) via redirects
  - [x] Handling full Maps links with CID (`data=!...!1s0x...`) — conversion via Text Search
  - [x] Explicitly documented limitations (avoiding generic text search to save quota) in `.agents/context/google-places-limitations.md`
- [x] `types/google-place-raw.type.ts` — raw Google Places API (New) response types
- [x] `mappers/google-place.mapper.ts` — raw Google response → `PlaceProfile`
- [x] `adapters/google-places.adapter.ts`:
  - [x] Fetch using an optimized `FieldMask` excluding `places.reviews` (to avoid Enterprise SKU pricing)
  - [x] Response caching via `CACHE_SERVICE` (key — placeId, TTL from config)
  - [x] Exception mapping for Google API errors
- [x] `google-places.module.ts` — imports `CacheModule`, `ConfigModule`; exports `IGooglePlacesPort`

---

## TASK-5 — AnalysisModule: Rules Engine

**Type:** Module (Core)

**Goal:** The heart of the product — profile evaluation and scoring.

- [x] `interfaces/rule.interface.ts` — `AnalysisRule`, `RuleResult`
- [x] `interfaces/analysis-result.interface.ts` — result format including business name and potential points gain
- [x] `analysis.constants.ts` — current weights (Rating: 30, Completeness: 20, Category: 15, Hours: 15, Status: 10, Photos: 7, Attributes: 3) and `CATEGORY_TO_RELEVANT_ATTRIBUTES` map
- [x] `rules/completeness.rule.ts` (weight 20)
- [x] `rules/rating.rule.ts` (weight 30)
- [x] `rules/opening-hours.rule.ts` (weight 15)
- [x] `rules/photos.rule.ts` (weight 7) — boolean threshold (≥3 photos)
- [x] `rules/business-category.rule.ts` (weight 15)
- [x] `rules/attributes.rule.ts` (weight 3) — checks only attributes relevant to the profile's category (e.g., HoReCa vs Universal)
- [x] `rules/business-status.rule.ts` (weight 10)
- [x] `rules/index.ts` — `ANALYSIS_RULES: AnalysisRule[]` (7 implemented rules)
- [x] `analysis.service.ts` — orchestration: score calculation and adding `potentialGain` (weight minus current score) to each found issue
- [x] `analysis.module.ts` — module wiring

---

## TASK-6 — API Layer: Controllers + DTOs

**Type:** API

**Goal:** A public REST contract on top of the `AnalysisService`.

- [x] `analysis.routes.ts` — path constants
- [x] `dto/req/analyze-profile.req.dto.ts`
- [x] `dto/res/analysis-result.res.dto.ts` — extended response (added `businessName`, `address`, `potentialGain`)
- [x] `analysis.controller.ts`
- [x] Explicit error handling (400, 404, 429)
- [x] Basic IP rate limiting (`@nestjs/throttler`)
- [x] Verification: `POST /analysis` works reliably

---

## TASK-7 — Swagger

**Type:** Docs

- [x] Install `@nestjs/swagger`
- [x] `DocumentBuilder` in `main.ts`
- [x] `@ApiTags`, `@ApiOperation`, `@ApiResponse` on `POST /analysis`
- [x] `@ApiProperty` on all DTO fields (including newly added UI fields)
- [x] Custom `@ApiEnvelopeResponse` decorator for standardization
- [x] Swagger UI available at `/api/docs`

---

## TASK-8 — Unit Tests

**Type:** Tests

- [x] Test fixtures (`place-profile.fixture.ts`) adapted for real API interface structures
- [x] Unit tests for each of the 7 rules (`passed`/`failed` cases, error message assertions)
- [x] Unit test for `attributes.rule.ts` specifically separating HoReCa and non-HoReCa flows
- [x] Unit test for score aggregation (`AnalysisService`)
- [x] Unit test for `place-id-resolver` (mocking the global `fetch` API for short links)
- [x] All 35 tests passing (`npm run test`)
- [x] Strict validations (`eslint` and `typecheck`) pass successfully

---

## TASK-9 — README

**Type:** Docs

**Goal:** A CTO drops into the repository and within 5 minutes understands the product, setup, and limitations.

- [x] Product description + what is analyzed
- [x] Architecture overview (modularity, independence, clean rules)
- [x] Honest "What is NOT analyzed" section (Posts, NAP, Q&A, reviews)
- [x] Technical field nuances (`photoCount`, `attributes`)
- [x] Startup instructions: Local and Docker
- [x] Example `.env` configuration
- [x] `POST /analysis` request example + explanation of UI fields (`potentialGain`, `businessName`)
- [x] FieldMask without `places.reviews` explained
- [x] Evaluation algorithm table: Current 7 rules and weights
- [x] "Consciously Postponed" section

---

## Changes from the Initial Plan (Implementation Log)

- **TASK-3:** Dropped `cache-manager` dependency in favor of a lightweight custom `InMemoryCacheService`.
- **TASK-4:** Decided to avoid "Generic Text Search" (e.g., just typing "McDonald's") to save API quota.
- **TASK-5:** Implemented 7 rules (instead of 8). Adjusted rule weights to better reflect real-world SEO priorities.
- **TASK-6:** Added `businessName`, `address`, and `potentialGain` (lost points) to DTOs and the service specifically to support UI mockup rendering requirements.
- **TASK-8:** Fixtures were heavily typed to match the strict real API interface. All tests passing.
