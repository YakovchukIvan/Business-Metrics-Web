# ProfileLens — API Implementation State

> Source of truth for what's already built. Update after every completed checklist item — tick the box, add date + short note. Do not skip ahead of the current task without explicit instruction.

Reference: `profilelens-api-tasks.md` for full task descriptions.

## TASK-1 — Project Initialization + Docker

- [x] `nest new` — done
- [x] ESLint + Prettier — done, with `import/no-restricted-paths` boundaries and `consistent-type-imports`
- [x] Dockerfile (multi-stage, prod-only) — done
- [x] docker-compose.yml — done
- [x] .env.example — done
- [x] GET /health — done (simplified to plain JSON, Terminus dropped as overkill for current dependency-free state)
- [x] Docker verification — done
- [x] Husky pre-commit/pre-push at monorepo root — done, `core.hooksPath` set to `.husky` at repo root
- [x] tsconfig.json — strict mode enabled, TS6 `baseUrl` deprecation fixed, `types: ["node","jest"]` added, `tsc-alias` wired for path aliases
- [x] Passed strict `eslint` and `typecheck` validations — done

## TASK-2 — Config module (Zod) + Common layer

- [x] Zod validation schema (`config.schema.ts`) for all env variables — done
- [x] Hybrid ConfigModule (pure `getAppConfig` for main.ts, `registerAs` for APIs, `AsyncOptions` for infra) — done
- [x] Global AllExceptionsFilter — done
- [x] Global ResponseInterceptor (standard success/error envelope) — done
- [x] ApiResponseEnvelope DTO with Swagger decorators — done
- [x] GlobalValidationPipe with strict validation — done
- [x] Wiring global components in main.ts — done
- [x] Passed strict `eslint` and `typecheck` validations — done

## TASK-3 — CacheModule

- [x] `ICacheService` interface — done
- [x] DI token `CACHE_SERVICE` — done
- [x] `InMemoryCacheService` (Map + setTimeout) — done
- [x] `CacheModule` exported and registered in `app.module.ts` — done
- [x] Unit tests for set/get/delete and TTL expiration — done
- [x] Passed strict `eslint` and `typecheck` validations — done

## TASK-4 — GooglePlacesModule (port/adapter)

- [x] `PlaceProfile` interface and raw types — done
- [x] `IGooglePlacesPort` and `GOOGLE_PLACES_PORT` DI token — done
- [x] `PlaceIdResolverService` (handles short links, CIDs via Text Search fallback) — done
- [x] `GooglePlacesAdapter` (with caching, fieldMask logic without reviews, error mapping) — done
- [x] Documented limitations (photoCount, CID resolution) in `.agents/context/google-places-limitations.md` — done
- [x] Module registration and ESLint boundaries verified — done
- [x] Passed strict `eslint` and `typecheck` validations — done

## TASK-5 — AnalysisModule: rules engine

- [x] `interfaces/rule.interface.ts` and `analysis-result.interface.ts`
- [x] `analysis.constants.ts` (weights updated: rating 30, completeness 20, category 20, hours 15, status 10, service-options 8, photos 7, name-spam 5, attributes 3)
- [x] `rules/rating.rule.ts` (weight 30)
- [x] `rules/completeness.rule.ts` (weight 20)
- [x] `rules/business-category.rule.ts` (weight 20)
- [x] `rules/opening-hours.rule.ts` (weight 15)
- [x] `rules/business-status.rule.ts` (weight 10)
- [x] `rules/service-options.rule.ts` (weight 8)
- [x] `rules/photos.rule.ts` (weight 7)
- [x] `rules/name-spam.rule.ts` (weight 5)
- [x] `rules/attributes.rule.ts` (weight 3)
- [x] `rules/categories-count.rule.ts` (Removed and merged into business-category)
- [x] `rules/index.ts` (ANALYSIS_RULES aggregator)
- [x] `analysis.service.ts` (orchestration via Largest Remainder Method)
- [x] `analysis.module.ts` (registration)
- [x] Passed strict `eslint` and `typecheck` validations — done

## TASK-6 — API layer: controllers + DTOs

- [x] Passed strict `eslint` and `typecheck` validations — done

## TASK-7 — Swagger

- [x] DocumentBuilder in main.ts
- [x] @ApiTags, @ApiOperation, @ApiResponse on analysis controller
- [x] @ApiProperty on all DTOs
- [x] Custom @ApiEnvelopeResponse decorator
- [x] Swagger UI on /api/docs
- [x] Environment variables for Swagger config
- [x] Passed strict `eslint` and `typecheck` validations — done

## TASK-8 — Unit-tests

- [x] Test fixtures (`place-profile.fixture.ts`) — done
- [x] Unit tests for all 9 rules — done
- [x] Unit test for `attributes.rule.ts` with HoReCa and generic paths — done
- [x] Unit test for score aggregation (`AnalysisService` testing) — done
- [x] Unit test for `PlaceIdResolverService` (fetch mock for short links and redirects) — done
- [x] Reorganized all `.spec.ts` files into module-specific `__tests__` directories for cleaner structure — done
- [x] `npm run test` is completely green — done
- [x] Passed strict `eslint` and `typecheck` validations — done

## TASK-9 — README

- [x] Опис продукту + що аналізується — done
- [x] Короткий опис архітектури (Scalable Monorepo, Microservices-Ready, Domain-Driven Design) — done
- [x] Чесний розділ "Що НЕ аналізується" (Posts, NAP, Q&A, reviews) — done
- [x] Технічні нюанси полів (`photoCount`, `attributes`, Context-Aware Rules) — done
- [x] Інструкція запуску: локально і Docker — done
- [x] Приклад `.env` (порт оновлено на 3001) — done
- [x] Приклад запиту до `POST /analysis` + пояснення нових полів (`potentialGain`, `businessName`) — done
- [x] FieldMask без `places.reviews` — done
- [x] Таблиця алгоритму оцінки: поточні 9 правил та їх ваги — done
- [x] Розділ "Свідомо відкладено". Реалізуй і створи це в apps/api/README.md. — done
- [x] Passed strict `eslint` and `typecheck` validations — done
