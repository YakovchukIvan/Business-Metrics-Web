# ProfileLens — Backend Architecture & Implementation Plan

> Google Business Profile analyzer: accepts a link to a profile or Place ID, evaluates optimization level (0-100), finds issues, and generates recommendations.

This document describes the backend architecture as if it were not a one-off test task, but the first version of a real product. Every decision below is explicitly explained — why it is what it is, and what exactly allows it to be easily changed or extended in the future without rewriting existing code.

---

## 1. Technology Stack

| Layer                             | Technology                                | Comment                                                        |
| --------------------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| Framework                         | NestJS (REST)                             | modularity and DI out of the box                               |
| Language                          | TypeScript (strict mode)                  |                                                                |
| Config Validation                 | Zod                                       | no direct `process.env` — only typed `ConfigService`           |
| Request Validation                | class-validator + global `ValidationPipe` | standard DTO validation in Nest                                |
| Data Source                       | Google Places API (New)                   | the only publicly available source without profile owner OAuth |
| API Documentation                 | Swagger (`@nestjs/swagger`)               | interactive docs at `/api/docs`, no need for Postman           |
| Containerization                  | Docker + docker-compose                   | from day one, even without a DB                                |
| ORM (planned)                     | Prisma                                    | will arrive together with the DB                               |
| Cache (planned, currently a stub) | Redis                                     | interface is already prepared                                  |
| Queues (planned)                  | BullMQ                                    | when the need for async/bulk processing arises                 |

**Important technical clarification for README:** Google has two different APIs. The Google Business Profile API gives full access to a profile, but only to the owner via OAuth verification. Places API (New) provides public data about any place by Place ID, without owning the profile. ProfileLens is deliberately built on the Places API (New), as the task is to analyze **someone else's** profiles via a link. This means some metrics are technically unavailable and are not included in the analysis — this is a documented limitation, not an oversight. Full list in Section 10.

---

## 2. Key Architectural Decisions

### 2.1 Modules do not know about each other

Each module (`cache`, `google-places`, `analysis`) is a self-sufficient unit. If you delete one module, the rest continue to compile and work (except for the direct integration point, where it's expected). Modules communicate not directly, but through interfaces (ports) and DI tokens. This is the main reason why `auth`, `reports`, `queue` can be added in the future without touching existing code.

### 2.2 Port/Adapter over Google Places API

Instead of the `analysis` module knowing the Google response format (`displayName.text`, `regularOpeningHours.periods`, etc.), we introduce our own unified type — **`PlaceProfile`**. This is the "port": a contract on which the rest of the system depends.

- `google-places.adapter.ts` — the only place that calls the Google API.
- `google-place.mapper.ts` — maps the raw Google format to `PlaceProfile`.
- The `analysis` module works exclusively with `PlaceProfile` and doesn't even import anything from `google-places` except the interface.

**Why this is important:** if Google changes the response structure tomorrow, or there's a need to connect another data source (e.g., custom scraper or another provider) — only the adapter and mapper change. Rules engine, controllers, DTOs — remain completely untouched.

**FieldMask — deliberately minimal, without `reviews`.** Places API (New) bills the entire request based on the most expensive SKU tier among the requested fields (Essentials / Pro / Enterprise). `places.reviews` falls into the Enterprise tier, yet none of the 8 evaluation rules use the review text — only `rating` and `userRatingCount`. Therefore, `reviews` is deliberately excluded:

```ts
(places.id,
  places.displayName,
  places.types,
  places.formattedAddress,
  places.internationalPhoneNumber,
  places.websiteUri,
  places.rating,
  places.userRatingCount,
  places.regularOpeningHours,
  places.photos,
  places.businessStatus,
  places.editorialSummary,
  places.delivery,
  places.dineIn,
  places.takeout,
  places.wheelchairAccessibleEntrance);
```

**Incoming link resolution is a separate responsibility, not a simple string format check.** Input comes in four formats, each requiring its own processing:

- ready Place ID (`ChIJ...`) — used directly;
- short link (`maps.app.goo.gl/...`) — resolved via HTTP redirect to the full URL;
- full Maps link with CID in hex (`data=!...!1s0x...`) — converted via Text Search by coordinates/name;
- link with `?cid=` — also via Text Search.

Due to network calls and dependency on `IGooglePlacesPort` (for Text Search fallback), the resolver is moved from pure `utils` to a separate service with DI (`place-id-resolver.service.ts`), rather than a static utility.

### 2.3 CacheModule — stub with a correct interface

Currently, the cache is an in-memory `Map`. But we access it exclusively through the `ICacheService` interface, injected via a DI token:

```ts
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export const CACHE_SERVICE = Symbol('CACHE_SERVICE');
```

`CacheModule` currently registers `InMemoryCacheService` under this token. When Redis appears in a month, `RedisCacheService` is added implementing the same interface, and **one line** changes in the module (`useClass: RedisCacheService` instead of `InMemoryCacheService`). No service that injects `CACHE_SERVICE` requires changes.

The cache is used in the `google-places` adapter: the result for a specific Place ID is cached for a TTL (e.g., 1 hour) to avoid wasting Google API quota on repeated requests for the same profile.

### 2.4 Rules engine — pure functions, not services

Each evaluation rule is a pure function with no side effects and no DI:

```ts
export type AnalysisRule = (profile: PlaceProfile) => RuleResult;
```

This is a deliberate decision against "rule = DI provider". Rules have no dependencies, don't call anything external — they only read `PlaceProfile` and return a result. This makes them:

- trivial to unit test (pure function → input/output, no mocks);
- easy to add: new rule = new file + one line of registration in `rules/index.ts`.

```ts
// rules/index.ts
export const ANALYSIS_RULES: AnalysisRule[] = [
  completenessRule,
  ratingRule,
  openingHoursRule,
  photosRule,
  businessCategoryRule,
  descriptionRule,
  attributesRule,
  businessStatusRule,
];
```

No other file changes when adding a new rule (Open/Closed principle).

**Attributes depend on the business category.** `attributesRule` is the only rule that first determines a relevant set of attributes for the profile via the `CATEGORY_TO_RELEVANT_ATTRIBUTES` map (`analysis.constants.ts`): `delivery`/`dineIn`/`takeout` make sense for HoReCa, but not for service businesses. For an unrecognized category — fallback to a universal subset (`wheelchairAccessibleEntrance` and similar). The rule remains a pure function (the map is just another constant, not an external call), but the systematic score lowering for non-HoReCa businesses disappears.

### 2.5 Configuration — only through ConfigModule + Zod

No `process.env.GOOGLE_PLACES_API_KEY` anywhere in the services. All environment variables go through a Zod schema once at application startup:

```ts
// config/config.schema.ts
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  GOOGLE_PLACES_API_KEY: z.string().min(1),
  CACHE_TTL_SECONDS: z.coerce.number().default(3600),
});

export type EnvConfig = z.infer<typeof envSchema>;
```

`ConfigModule.forRoot({ validate: (config) => envSchema.parse(config) })`. If a variable is missing or invalid, the app crashes at startup with a clear error, rather than midway through a request in prod. Services receive values exclusively through typed `ConfigService.get<EnvConfig>(...)`.

### 2.6 Response envelope + route constants

Every successful API response is wrapped in a single format via a global `ResponseInterceptor`:

```json
{
  "success": true,
  "data": { "score": 78, "issues": [...], "recommendations": [...] },
  "meta": { "placeId": "ChIJ...", "analyzedAt": "2026-07-10T12:00:00Z" }
}
```

The same `AllExceptionsFilter` formats errors uniformly as well, with the correct status code depending on the cause:

| Cause                                    | HTTP Status |
| ---------------------------------------- | ----------- |
| Invalid input (not URL and not Place ID) | 400         |
| Profile not found (`ZERO_RESULTS`)       | 404         |
| Google Quota Exceeded / `REQUEST_DENIED` | 429 / 502   |

Google API errors are thrown from the `google-places` adapter as recognizable domain exceptions (`google-places.errors.ts`), rather than raw client HTTP errors — the filter then maps them to status codes, and the controller knows nothing about this.

Endpoint paths are not hardcoded strings in decorators — they are extracted into constants:

```ts
// analysis.routes.ts
export const ANALYSIS_ROUTES = {
  BASE: 'analysis',
} as const;
```

This is the same approach used in my previous production project (QuizForge) — no "magic strings", everything that repeats or might change is in constants.

### 2.7 Docker from Day 1

`docker-compose.yml` currently contains only one service — the app itself (multi-stage `Dockerfile`: build stage with full `node_modules`, production stage with only prod dependencies). Environment variables are injected via `.env`, which is validated by the Zod schema at container startup. When Postgres/Redis arrive, they are added as new services in the same compose file, and the app connects to them by service name (`postgres`, `redis`) instead of `localhost`.

### 2.8 Swagger — interactive documentation from the first business endpoint

`@nestjs/swagger` is connected immediately alongside `POST /analysis`, not deferred for "later". The UI is available at `/api/docs`, with request/response examples right in the browser — so a CTO or someone else can test the endpoint without Postman. `@ApiProperty` on DTOs and `@ApiResponse` for each status code (200, 400, 404, 429) keep the documentation synchronous with actual behavior: it is generated from the same code that executes, rather than written separately and going stale.

### 2.9 Rate limiting — protecting public quota

`POST /analysis` is public and unauthenticated (deliberately — Section 10). This means anyone can call it as much as they want, spending paid Google quota. A basic guard (`@nestjs/throttler`) by IP is globally connected in `main.ts`, alongside other cross-cutting components from `common/`. This is not a replacement for authentication — just a minimal defense against accidental or intentional abuse until the `AuthModule` is implemented (Section 8).

---

## 3. Project Structure

```bash
src/
├── main.ts
├── app.module.ts
│
├── common/
│   ├── constants/
│   │   └── response-message.constant.ts
│   ├── dto/res/
│   │   └── api-response-envelope.dto.ts
│   ├── filters/
│   │   └── all-exceptions.filter.ts       # maps domain exceptions (incl. Google API) to HTTP statuses
│   ├── interceptors/
│   │   └── response.interceptor.ts
│   ├── guards/
│   │   └── throttler.guard.ts             # rate limit by IP, connected globally
│   ├── pipes/
│   │   └── global-validation.pipe.ts
│   └── interfaces/
│       └── api-response.interface.ts
│
├── config/
│   ├── config.schema.ts        # Zod schema + EnvConfig type
│   ├── config.module.ts
│   ├── app.config.ts
│   ├── google-places.config.ts
│   └── cache.config.ts
│
└── modules/
    ├── cache/
    │   ├── cache.module.ts
    │   ├── cache.constants.ts          # CACHE_SERVICE DI token
    │   ├── interfaces/
    │   │   └── cache-service.interface.ts
    │   └── adapters/
    │       └── in-memory-cache.service.ts
    │
    ├── google-places/
    │   ├── google-places.module.ts
    │   ├── interfaces/
    │   │   ├── place-profile.interface.ts        # our unified type (port)
    │   │   └── google-places-port.interface.ts   # adapter contract
    │   ├── adapters/
    │   │   └── google-places.adapter.ts           # Google call with final FieldMask, caching, error mapping
    │   ├── mappers/
    │   │   └── google-place.mapper.ts              # raw Google → PlaceProfile
    │   ├── types/
    │   │   └── google-place-raw.type.ts             # raw Google response types
    │   ├── services/
    │   │   └── place-id-resolver.service.ts          # async: Place ID / short-link / CID / ?cid=
    │   └── errors/
    │       └── google-places.errors.ts                # ZERO_RESULTS, QUOTA_EXCEEDED — domain exceptions
    │
    └── analysis/
        ├── analysis.module.ts
        ├── analysis.controller.ts
        ├── analysis.service.ts        # orchestration: google-places → rules → score
        ├── analysis.routes.ts
        ├── analysis.constants.ts       # rule weights, thresholds, CATEGORY_TO_RELEVANT_ATTRIBUTES
        ├── dto/
        │   ├── req/analyze-profile.req.dto.ts
        │   └── res/analysis-result.res.dto.ts
        ├── interfaces/
        │   ├── rule.interface.ts
        │   └── analysis-result.interface.ts
        └── rules/
            ├── index.ts                     # registry of all rules
            ├── completeness.rule.ts
            ├── rating.rule.ts
            ├── opening-hours.rule.ts
            ├── photos.rule.ts
            ├── business-category.rule.ts
            ├── description.rule.ts
            ├── attributes.rule.ts
            └── business-status.rule.ts
```

**Note regarding monorepo:** currently, this is a standalone Nest project (without Nx/Turborepo — excessive for a single backend). When the frontend is connected, the current code will move to `apps/api`, and `apps/web` will sit alongside it via simple npm/pnpm workspaces. Heavy monorepo tools (Nx) will be connected only if there is a real need for shared packages between apps.

---

## 4. Module Descriptions

### 4.1 `common/`

Cross-cutting concerns that don't belong to any business module: global exception filter (unifies error formatting and maps them to status codes), global validation pipe (incoming DTO validation), response interceptor (response envelope), throttler guard (IP rate limit). These components are globally connected in `main.ts` — no business module "knows" about them or imports them directly.

### 4.2 `config/`

Single source of truth for environment variables. Each domain has its config file (`google-places.config.ts`, `cache.config.ts`), but they all are validated via a single Zod schema at startup.

### 4.3 `cache/`

Infrastructure module. Externally, only the `ICacheService` interface and `CACHE_SERVICE` token are visible. Current implementation is `InMemoryCacheService` (`Map` with TTL via `setTimeout`). Used by the `google-places` module to cache Google API responses by Place ID.

### 4.4 `google-places/`

Adapter to the outside world. Responsible for:

1. Input recognition — ready Place ID, short link, full link with CID, link with `?cid=` (`place-id-resolver.service.ts`, async, details in Section 2.2).
2. Calling Places API (New) with final `FieldMask` (Section 2.2) — only fields that actually go into scoring, without `reviews`.
3. Caching the response via `ICacheService`.
4. Mapping the raw response into the internal `PlaceProfile` type — this is where all the "dirty work" with the Google format is isolated in a single file.
5. Mapping Google errors (`ZERO_RESULTS`, `REQUEST_DENIED`, quota exceeded) into recognizable domain exceptions — later handled by the global `AllExceptionsFilter` (Section 2.6).

`PlaceProfile`:

```ts
export interface PlaceProfile {
  placeId: string;
  displayName: string;
  formattedAddress: string | null;
  phoneNumber: string | null;
  websiteUri: string | null;
  types: string[]; // profile categories; types[0] is roughly "primary"
  businessStatus: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY' | 'FUTURE_OPENING' | 'UNKNOWN';
  rating: number | null;
  userRatingCount: number | null;
  hasOpeningHours: boolean;
  editorialSummary: string | null;
  photoCount: number; // number of photo references in the API response — LIMITED by API quota, not the real number of profile photos
  attributes: Record<string, boolean>; // delivery, dineIn, takeout, wheelchairAccessibleEntrance...
}
```

> `photoCount` and `attributes` have documented data source limitations — see Section 10.

### 4.5 `analysis/`

Product business logic. `AnalysisService` calls `google-places` (via port), gets `PlaceProfile`, runs it through `ANALYSIS_RULES`, aggregates it into a final score, and generates a list of issues/recommendations. The controller is thin — only accepts the DTO and calls the service.

---

## 5. API

### `POST /analysis`

**Request:**

```json
{ "input": "https://maps.app.goo.gl/xxxxx" }
```

(accepts a link of any supported format or a pure Place ID — automatically recognized, Section 2.2)

**Response (success):**

```json
{
  "success": true,
  "data": {
    "score": 78,
    "issues": [
      {
        "ruleId": "opening-hours",
        "message": "Opening hours not provided",
        "recommendation": "Add working hours to your Google Business Profile"
      }
    ],
    "breakdown": [
      { "ruleId": "completeness", "weight": 20, "passed": true },
      { "ruleId": "opening-hours", "weight": 15, "passed": false }
    ]
  },
  "meta": { "placeId": "ChIJ...", "analyzedAt": "2026-07-10T12:00:00Z" }
}
```

**Response (error)** — the same envelope, `success: false`:

```json
{
  "success": false,
  "error": { "code": "PROFILE_NOT_FOUND", "message": "Profile at the provided link was not found" }
}
```

Status codes — Section 2.6.

### `GET /api/docs`

Swagger UI — interactive documentation with request/response examples (Section 2.8).

### `GET /health`

Basic service liveness check (for Docker healthcheck and future monitoring).

---

## 6. Evaluation Algorithm

Sum of weights = 100. Each rule is a separate pure function with a fixed weight.

| Rule                | Weight | What it checks                                            | Why it's important                                                |
| ------------------- | ------ | --------------------------------------------------------- | ----------------------------------------------------------------- |
| `completeness`      | 20     | Phone, website, address are filled                        | Basic contacts are the main reason a client cannot get in touch   |
| `rating`            | 20     | Rating exists and number of reviews ≥ threshold (e.g. 10) | Few reviews = low trust, even with a high rating                  |
| `opening-hours`     | 15     | Opening hours are specified                               | Missing hours is a frequent reason for lost visitors              |
| `photos`            | 15     | Number of photos ≥ threshold (e.g. 3)                     | Profiles with photos get significantly more clicks in Google Maps |
| `business-category` | 10     | Business category/type is specified                       | Affects which searches the profile even appears in                |
| `description`       | 10     | Editorial summary / description exists                    | Helps the user and Google understand the essence of the business  |
| `attributes`        | 5      | Attributes relevant to the business category are filled   | A minor detail that boosts relevance in niche searches            |
| `business-status`   | 5      | Status is `OPERATIONAL`, not `CLOSED_*`                   | Critical error — profile is marked as closed                      |

> **Technical metric limitations:** `photos` — threshold is calculated from the number of photo references returned by the API per request (limited by response quota, not the real number of photos in the profile) — suitable for "has/doesn't have enough", not for a graded scale. `attributes` — only attributes relevant to the business category are checked (`CATEGORY_TO_RELEVANT_ATTRIBUTES`), rather than a fixed HoReCa set for all types.

**Extensibility:** to add a new rule (e.g., checking price level or the presence of `priceRange`), simply create a file in `rules/`, implement the `AnalysisRule` signature, and add one line in `rules/index.ts`. Rule weights are redistributed centrally in `analysis.constants.ts`.

---

## 7. Docker

`docker-compose.yml` currently contains only one service — the app itself (multi-stage `Dockerfile`: build stage with full `node_modules`, production stage with only prod dependencies). Environment variables are injected via `.env`, which is validated by the Zod schema at container startup. When Postgres/Redis arrive, they are added as new services in the same file, and the app connects to them by service name (`postgres`, `redis`) instead of `localhost`.

---

## 8. Scaling Roadmap

| Step                             | When (approx.)                 | What is added                                                                   | Why it doesn't break existing code                                                                      |
| -------------------------------- | ------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Redis instead of in-memory cache | +1 month                       | `RedisCacheService`, implements `ICacheService`                                 | Everything depends on the interface, not `Map`                                                          |
| BullMQ for queues                | +2 weeks after Redis           | `QueueModule`, async/bulk profile processing                                    | Redis is already up and configured                                                                      |
| Auth + guard                     | as needed                      | `AuthModule`, `@UseGuards(JwtAuthGuard)` on relevant controllers                | Guard is a decorator over a controller, not a dependency inside modules                                 |
| PostgreSQL + Prisma              | when history needs to be saved | `PrismaModule`, repository in `analysis/`                                       | `google-places` and rules engine know nothing about the DB                                              |
| Export CSV/PDF/Google Sheets     | as needed                      | new `reports/` module, reads ready `AnalysisResult`                             | Result format is already stable and not tied to data source                                             |
| Custom scoring (selective rules) | as needed                      | `POST /analysis` accepts `selectedRuleIds`, weight recalculation among selected | Rules engine is already isolated — change only in API layer and aggregation, rules themselves untouched |
| Frontend (Next.js)               | UI kickoff                     | `apps/web` alongside `apps/api`                                                 | Backend is already REST with a strict response contract (envelope)                                      |

---

## 9. Testing

- **Rules engine** — prime candidate for unit tests: each function is tested as `expect(rule(mockProfile)).toEqual(...)`, without any mocks, since functions are pure.
- **`attributesRule`** — tested separately for HoReCa category and non-HoReCa, to confirm the correctness of `CATEGORY_TO_RELEVANT_ATTRIBUTES` and fallback behavior.
- **AnalysisService** — tested with a mocked `IGooglePlacesPort` (interface, not concrete adapter) — testing only orchestration and score aggregation.
- **GooglePlacesAdapter** — tested separately, with a mocked HTTP client: verifies correct mapping of raw response and correct mapping of Google errors (`ZERO_RESULTS`, quota) into domain exceptions.
- **`place-id-resolver.service.ts`** — tested separately on all supported input formats (Place ID, short link, full link with CID, `?cid=`).

---

## 10. What deliberately IS NOT included in this version

To avoid overcomplicating the test task, the following are deliberately deferred (not forgotten — see Roadmap):

- authentication — tool is public, analyzes any profile without login (protected only by basic rate-limit, Section 2.9);
- saving analysis history to DB — stateless for now, only Google response caching for a short TTL;
- batch/bulk analysis of multiple profiles at once;
- exporting reports (CSV/PDF/Google Sheets);
- custom scoring (rule selection on frontend) — architecture already supports this via isolated rules engine, implementation as needed (Section 8);
- data unavailable via public Places API (New) — transparently stated in README as a tool limitation:
  - Google Posts activity and Q&A section;
  - Owner responses to reviews and **review velocity** (even distribution of review accumulation over time) — one of the top ranking factors according to SEO practice, but unavailable via public API;
  - **Products/Services** section — a separate profile part, Places API (New) doesn't return it;
  - **Photo freshness** (upload date) — API only returns photo references themselves, without timestamps;
  - **NAP consistency with external sources** (business website, other directories) — only completeness and format of contact data within the profile itself are checked, without matching against website or directories.
