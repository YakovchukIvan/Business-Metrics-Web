# ProfileLens — Backend Architecture & Implementation Plan

> Аналізатор Google Business Profile: приймає посилання на профіль або Place ID, оцінює рівень оптимізації (0–100), знаходить проблеми та формує рекомендації.

Цей документ описує архітектуру бекенду так, ніби це не одноразове тестове, а перша версія реального продукту. Кожне рішення нижче explicitно пояснене — чому воно таке, і що саме дозволяє легко змінити чи розширити в майбутньому без переписування існуючого коду.

---

## 1. Технологічний стек

| Шар                                 | Технологія                                    | Коментар                                                           |
| ----------------------------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| Framework                           | NestJS (REST)                                 | модульність та DI з коробки                                        |
| Мова                                | TypeScript (strict mode)                      |                                                                    |
| Валідація конфігурації              | Zod                                           | жодного прямого `process.env` — тільки типізований `ConfigService` |
| Валідація запитів                   | class-validator + глобальний `ValidationPipe` | стандарт DTO-валідації в Nest                                      |
| Джерело даних                       | Google Places API (New)                       | єдине публічно доступне джерело без OAuth власника профілю         |
| API-документація                    | Swagger (`@nestjs/swagger`)                   | інтерактивна документація на `/api/docs`, без потреби в Postman    |
| Контейнеризація                     | Docker + docker-compose                       | з першого дня, навіть без БД                                       |
| ORM (заплановано, не зараз)         | Prisma                                        | підʼїде разом із БД                                                |
| Кеш (заплановано, зараз — заглушка) | Redis                                         | інтерфейс готовий вже зараз                                        |
| Черги (заплановано)                 | BullMQ                                        | коли зʼявиться потреба в асинхронній/масовій обробці               |

**Важливе технічне уточнення для README:** Google має два різні API. Google Business Profile API дає повний доступ до профілю, але лише власнику через OAuth-верифікацію. Places API (New) — публічні дані про будь-яке місце за Place ID, без володіння профілем. ProfileLens свідомо будується на Places API (New), оскільки завдання — аналізувати **чужі** профілі за посиланням. Це означає, що деякі показники технічно недоступні і в аналіз не входять — це задокументована межа, а не недогляд. Повний перелік — розділ 10.

---

## 2. Ключові архітектурні рішення

### 2.1 Модулі не знають один про одного

Кожен модуль (`cache`, `google-places`, `analysis`) — самодостатня одиниця. Якщо видалити один модуль, решта продовжує компілюватись і працювати (окрім прямої точки інтеграції, де це очікувано). Модулі спілкуються не напряму, а через інтерфейси (порти) та DI-токени. Це головна причина, чому в майбутньому можна додавати `auth`, `reports`, `queue` — не чіпаючи існуючий код.

### 2.2 Порт/адаптер над Google Places API

Замість того, щоб `analysis`-модуль знав формат відповіді Google (`displayName.text`, `regularOpeningHours.periods`, тощо), вводимо власний уніфікований тип — **`PlaceProfile`**. Це і є "порт": контракт, від якого залежить решта системи.

- `google-places.adapter.ts` — єдине місце, яке звертається до Google API.
- `google-place.mapper.ts` — переводить сирий Google-формат у `PlaceProfile`.
- `analysis`-модуль працює виключно з `PlaceProfile` і навіть не імпортує нічого з `google-places`, крім інтерфейсу.

**Чому це важливо:** якщо завтра Google змінить структуру відповіді, або з'явиться потреба підключити інше джерело даних (наприклад, власний скрапер чи інший провайдер) — міняється тільки адаптер і мапер. Rules engine, контролери, DTO — не чіпаються взагалі.

**FieldMask — свідомо мінімальний, без `reviews`.** Places API (New) тарифікує весь запит по найдорожчому SKU-рівню серед запитаних полів (Essentials / Pro / Enterprise). `places.reviews` потрапляє в Enterprise-рівень, при цьому жодне з 8 правил оцінки не використовує текст відгуків — тільки `rating` і `userRatingCount`. Тому `reviews` свідомо виключено:

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

**Розпізнавання вхідного посилання — окрема відповідальність, не проста перевірка формату рядка.** Вхід буває чотирьох форматів, кожен вимагає своєї обробки:

- готовий Place ID (`ChIJ...`) — використовується напряму;
- короткий лінк (`maps.app.goo.gl/...`) — резолвиться через HTTP-редірект до повного URL;
- повний Maps-лінк з CID у hex (`data=!...!1s0x...`) — конвертується через Text Search за координатами/назвою;
- лінк з `?cid=` — так само через Text Search.

Через мережеві виклики і залежність від `IGooglePlacesPort` (для Text Search-фолбеку) resolver винесений з чистих `utils` в окремий сервіс із DI (`place-id-resolver.service.ts`), а не статична утиліта.

### 2.3 CacheModule — заглушка з правильним інтерфейсом

Зараз кеш — це `Map` в памʼяті. Але звертаємось ми до нього виключно через інтерфейс `ICacheService`, підключений через DI-токен:

```ts
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export const CACHE_SERVICE = Symbol('CACHE_SERVICE');
```

`CacheModule` зараз реєструє `InMemoryCacheService` під цим токеном. Коли за місяць зʼявиться Redis — додається `RedisCacheService`, що реалізує той самий інтерфейс, і в модулі міняється **одна стрічка** (`useClass: RedisCacheService` замість `InMemoryCacheService`). Жоден сервіс, який інжектить `CACHE_SERVICE`, не потребує змін.

Кеш використовується в `google-places`-адаптері: результат по конкретному Place ID кешується на TTL (наприклад, 1 година), щоб не витрачати квоту Google API на повторні запити того самого профілю.

### 2.4 Rules engine — чисті функції, не сервіси

Кожне правило оцінки — чиста функція без побічних ефектів і без DI:

```ts
export type AnalysisRule = (profile: PlaceProfile) => RuleResult;
```

Це свідоме рішення проти "правило = provider з DI". Правила не мають залежностей, нічого не викликають ззовні — тільки читають `PlaceProfile` і повертають результат. Це робить їх:

- тривіальними для unit-тестів (чиста функція → вхід/вихід, без моків);
- легкими для додавання: нове правило = новий файл + один рядок реєстрації в `rules/index.ts`.

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

Жоден інший файл при додаванні нового правила не змінюється (Open/Closed principle).

**Атрибути залежать від категорії бізнесу.** `attributesRule` — єдине правило, яке спершу визначає релевантний для профілю набір атрибутів через мапу `CATEGORY_TO_RELEVANT_ATTRIBUTES` (`analysis.constants.ts`): `delivery`/`dineIn`/`takeout` мають сенс для HoReCa, але не для сервісних бізнесів. Для нерозпізнаної категорії — fallback на universal-підмножину (`wheelchairAccessibleEntrance` та подібні). Правило лишається чистою функцією (мапа — просто ще одна константа, не зовнішній виклик), але систематичне заниження скору для бізнесів поза HoReCa зникає.

### 2.5 Конфігурація — тільки через ConfigModule + Zod

Жодного `process.env.GOOGLE_PLACES_API_KEY` десь у сервісах. Всі змінні середовища проходять через Zod-схему один раз при старті застосунку:

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

`ConfigModule.forRoot({ validate: (config) => envSchema.parse(config) })`. Якщо змінної нема або вона невалідна — застосунок падає при старті з чіткою помилкою, а не десь посеред запиту в проді. Сервіси отримують значення виключно через типізований `ConfigService.get<EnvConfig>(...)`.

### 2.6 Response envelope + route-константи

Кожна успішна відповідь API обгортається в єдиний формат через глобальний `ResponseInterceptor`:

```json
{
  "success": true,
  "data": { "score": 78, "issues": [...], "recommendations": [...] },
  "meta": { "placeId": "ChIJ...", "analyzedAt": "2026-07-10T12:00:00Z" }
}
```

Той самий `AllExceptionsFilter` формує єдиний формат і для помилок, з коректним статус-кодом залежно від причини:

| Причина                                   | HTTP-статус |
| ----------------------------------------- | ----------- |
| Невалідний вхід (не URL і не Place ID)    | 400         |
| Профіль не знайдено (`ZERO_RESULTS`)      | 404         |
| Квота Google вичерпана / `REQUEST_DENIED` | 429 / 502   |

Помилки Google API прокидаються з `google-places`-адаптера як розпізнавані домен-винятки (`google-places.errors.ts`), а не сирі HTTP-помилки клієнта — фільтр вже мапить їх на статус-коди, контролер про це нічого не знає.

Шляхи ендпоінтів не хардкодяться рядками в декораторах — виносяться в константи:

```ts
// analysis.routes.ts
export const ANALYSIS_ROUTES = {
  BASE: 'analysis',
} as const;
```

Це той самий підхід, що і в моєму попередньому production-проєкті (QuizForge) — жодних "магічних рядків", все, що повторюється або може змінитись, — в константах.

### 2.7 Docker з першого дня

`docker-compose.yml` піднімає застосунок у контейнері вже зараз, навіть без жодної БД чи Redis поруч. Причина: коли за місяць додасться Postgres, а ще через два тижні — Redis, вони просто додаються як нові сервіси в той самий compose-файл. Сам застосунок вже вміє жити в контейнері, змінні середовища вже йдуть через `.env` + Zod-валідацію — тобто перенесення на будь-який сервер (VPS, хмара) зводиться до `docker compose up` з правильним `.env`.

### 2.8 Swagger — інтерактивна документація з першого бізнес-ендпоінта

`@nestjs/swagger` підключається одразу разом з `POST /analysis`, не відкладається на "потім". UI доступний на `/api/docs`, з прикладами запиту/відповіді прямо в браузері — щоб СТО чи хтось інший міг протестувати ендпоінт без Postman. `@ApiProperty` на DTO і `@ApiResponse` для кожного статус-коду (200, 400, 404, 429) тримають документацію синхронною з реальною поведінкою: вона генерується з того самого коду, що виконується, а не пишеться окремо і не застаріває.

### 2.9 Rate limiting — захист публічної квоти

`POST /analysis` публічний і без авторизації (свідомо — розділ 10). Це означає, що будь-хто може викликати його скільки завгодно разів, витрачаючи платну Google-квоту. Базовий guard (`@nestjs/throttler`) по IP підключається глобально в `main.ts`, поруч з іншими наскрізними компонентами з `common/`. Це не заміна authentication — мінімальний захист від випадкового чи навмисного зловживання, поки `AuthModule` не впроваджено (розділ 8).

---

## 3. Структура проєкту

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
│   │   └── all-exceptions.filter.ts       # мапить домен-винятки (у т.ч. Google API) на HTTP-статуси
│   ├── interceptors/
│   │   └── response.interceptor.ts
│   ├── guards/
│   │   └── throttler.guard.ts             # rate limit по IP, підключений глобально
│   ├── pipes/
│   │   └── global-validation.pipe.ts
│   └── interfaces/
│       └── api-response.interface.ts
│
├── config/
│   ├── config.schema.ts        # Zod-схема + тип EnvConfig
│   ├── config.module.ts
│   ├── app.config.ts
│   ├── google-places.config.ts
│   └── cache.config.ts
│
└── modules/
    ├── cache/
    │   ├── cache.module.ts
    │   ├── cache.constants.ts          # DI-токен CACHE_SERVICE
    │   ├── interfaces/
    │   │   └── cache-service.interface.ts
    │   └── adapters/
    │       └── in-memory-cache.service.ts
    │
    ├── google-places/
    │   ├── google-places.module.ts
    │   ├── interfaces/
    │   │   ├── place-profile.interface.ts        # наш уніфікований тип (порт)
    │   │   └── google-places-port.interface.ts   # контракт адаптера
    │   ├── adapters/
    │   │   └── google-places.adapter.ts           # звернення до Google з фінальним FieldMask, кешування, мапінг помилок
    │   ├── mappers/
    │   │   └── google-place.mapper.ts              # raw Google → PlaceProfile
    │   ├── types/
    │   │   └── google-place-raw.type.ts             # типи сирої відповіді Google
    │   ├── services/
    │   │   └── place-id-resolver.service.ts          # асинхронний: Place ID / short-лінк / CID / ?cid=
    │   └── errors/
    │       └── google-places.errors.ts                # ZERO_RESULTS, QUOTA_EXCEEDED — домен-винятки
    │
    └── analysis/
        ├── analysis.module.ts
        ├── analysis.controller.ts
        ├── analysis.service.ts        # оркестрація: google-places → rules → score
        ├── analysis.routes.ts
        ├── analysis.constants.ts       # ваги правил, пороги, CATEGORY_TO_RELEVANT_ATTRIBUTES
        ├── dto/
        │   ├── req/analyze-profile.req.dto.ts
        │   └── res/analysis-result.res.dto.ts
        ├── interfaces/
        │   ├── rule.interface.ts
        │   └── analysis-result.interface.ts
        └── rules/
            ├── index.ts                     # реєстр усіх правил
            ├── completeness.rule.ts
            ├── rating.rule.ts
            ├── opening-hours.rule.ts
            ├── photos.rule.ts
            ├── business-category.rule.ts
            ├── description.rule.ts
            ├── attributes.rule.ts
            └── business-status.rule.ts
```

**Примітка щодо монорепо:** зараз це самостійний Nest-проєкт (без Nx/Turborepo — для одного бекенду це надлишково). Коли підключиться фронтенд, поточний код переїде в `apps/api`, а `apps/web` стане поруч через прості npm/pnpm workspaces. Важкі монорепо-інструменти (Nx) підключимо, тільки якщо реально зʼявиться потреба в спільних пакетах між застосунками.

---

## 4. Опис модулів

### 4.1 `common/`

Наскрізні речі, що не належать жодному бізнес-модулю: глобальний exception filter (уніфікує формат помилок і мапить їх на статус-коди), глобальний validation pipe (валідація вхідних DTO), response interceptor (обгортка відповіді), throttler guard (rate limit по IP). Ці компоненти підключаються в `main.ts` глобально — жоден бізнес-модуль про них "не знає" і не імпортує напряму.

### 4.2 `config/`

Єдина точка правди для змінних середовища. Кожен домен має свій конфіг-файл (`google-places.config.ts`, `cache.config.ts`), але всі вони валідуються через одну Zod-схему при старті.

### 4.3 `cache/`

Інфраструктурний модуль. Зовні видно тільки інтерфейс `ICacheService` та токен `CACHE_SERVICE`. Поточна реалізація — `InMemoryCacheService` (`Map` з TTL через `setTimeout`). Використовується `google-places`-модулем для кешування відповідей Google API за Place ID.

### 4.4 `google-places/`

Адаптер до зовнішнього світу. Відповідає за:

1. Розпізнавання вхідних даних — готовий Place ID, короткий лінк, повний лінк з CID, лінк з `?cid=` (`place-id-resolver.service.ts`, асинхронний, деталі — розділ 2.2).
2. Звернення до Places API (New) з фінальним `FieldMask` (розділ 2.2) — тільки поля, що реально йдуть в оцінку, без `reviews`.
3. Кешування відповіді через `ICacheService`.
4. Мапінг сирої відповіді у внутрішній тип `PlaceProfile` — саме тут вся "брудна робота" з форматом Google ізольована в одному файлі.
5. Мапінг помилок Google (`ZERO_RESULTS`, `REQUEST_DENIED`, вичерпана квота) у розпізнавані домен-винятки — далі обробляються глобальним `AllExceptionsFilter` (розділ 2.6).

`PlaceProfile`:

```ts
export interface PlaceProfile {
  placeId: string;
  displayName: string;
  formattedAddress: string | null;
  phoneNumber: string | null;
  websiteUri: string | null;
  types: string[]; // категорії профілю; types[0] умовно "primary"
  businessStatus: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY' | 'FUTURE_OPENING' | 'UNKNOWN';
  rating: number | null;
  userRatingCount: number | null;
  hasOpeningHours: boolean;
  editorialSummary: string | null;
  photoCount: number; // кількість фото-референсів у відповіді API — ОБМЕЖЕНА лімітом, не реальна кількість фото в профілі
  attributes: Record<string, boolean>; // delivery, dineIn, takeout, wheelchairAccessibleEntrance...
}
```

> `photoCount` і `attributes` мають задокументовані обмеження джерела даних — див. розділ 10.

### 4.5 `analysis/`

Бізнес-логіка продукту. `AnalysisService` викликає `google-places` (через порт), отримує `PlaceProfile`, проганяє через `ANALYSIS_RULES`, агрегує в підсумковий скор і формує список проблем/рекомендацій. Контролер тонкий — тільки приймає DTO і викликає сервіс.

---

## 5. API

### `POST /analysis`

**Запит:**

```json
{ "input": "https://maps.app.goo.gl/xxxxx" }
```

(приймає посилання будь-якого підтримного формату або чистий Place ID — розпізнається автоматично, розділ 2.2)

**Відповідь (успіх):**

```json
{
  "success": true,
  "data": {
    "score": 78,
    "issues": [
      {
        "ruleId": "opening-hours",
        "message": "Не вказано години роботи",
        "recommendation": "Додайте графік роботи в Google Business Profile"
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

**Відповідь (помилка)** — той самий envelope, `success: false`:

```json
{
  "success": false,
  "error": { "code": "PROFILE_NOT_FOUND", "message": "Профіль за вказаним посиланням не знайдено" }
}
```

Статус-коди — розділ 2.6.

### `GET /api/docs`

Swagger UI — інтерактивна документація з прикладами запиту/відповіді (розділ 2.8).

### `GET /health`

Базова перевірка живучості сервісу (для Docker healthcheck і майбутнього моніторингу).

---

## 6. Алгоритм оцінювання

Сума ваг = 100. Кожне правило — окрема чиста функція з фіксованою вагою.

| Правило             | Вага | Що перевіряє                                       | Чому важливо                                                      |
| ------------------- | ---- | -------------------------------------------------- | ----------------------------------------------------------------- |
| `completeness`      | 20   | Телефон, сайт, адреса заповнені                    | Базові контакти — головна причина, чому клієнт не може зв'язатись |
| `rating`            | 20   | Рейтинг є і кількість відгуків ≥ порогу (напр. 10) | Мало відгуків = низька довіра, навіть при високому рейтингу       |
| `opening-hours`     | 15   | Години роботи вказані                              | Відсутність годин — часта причина втрачених відвідувачів          |
| `photos`            | 15   | Кількість фото ≥ порогу (напр. 3)                  | Профілі з фото отримують значно більше кліків у Google Maps       |
| `business-category` | 10   | Вказано категорію/тип бізнесу                      | Впливає на те, за якими запитами профіль взагалі показується      |
| `description`       | 10   | Є editorial summary / опис                         | Допомагає користувачу і Google зрозуміти суть бізнесу             |
| `attributes`        | 5    | Заповнені атрибути, релевантні категорії бізнесу   | Дрібниця, яка підвищує релевантність у нішевих запитах            |
| `business-status`   | 5    | Статус `OPERATIONAL`, не `CLOSED_*`                | Критична помилка — профіль позначений закритим                    |

> **Технічні обмеження показників:** `photos` — поріг рахується від кількості фото-референсів, повернутих API за один запит (обмежено лімітом відповіді, не реальна кількість фото в профілі) — придатне для «є/нема достатньо», не для градуйованої шкали. `attributes` — перевіряються тільки атрибути, релевантні категорії бізнесу (`CATEGORY_TO_RELEVANT_ATTRIBUTES`), а не фіксований HoReCa-набір для всіх типів.

**Розширюваність:** щоб додати нове правило (наприклад, перевірку ціннового рівня чи наявності `priceRange`), достатньо створити файл у `rules/`, реалізувати сигнатуру `AnalysisRule` і додати один рядок у `rules/index.ts`. Ваги правил перерозподіляються централізовано в `analysis.constants.ts`.

---

## 7. Docker

`docker-compose.yml` зараз містить лише один сервіс — сам застосунок (multi-stage `Dockerfile`: build-стадія з повним `node_modules`, production-стадія — тільки прод-залежності). Змінні середовища прокидаються через `.env`, який валідується Zod-схемою при старті контейнера. Коли зʼявляться Postgres/Redis — вони додаються новими сервісами в той самий файл, застосунок під'єднується до них за назвою сервіса (`postgres`, `redis`) замість `localhost`.

---

## 8. Дорожня карта масштабування

| Крок                                       | Коли (орієнтовно)                     | Що додається                                                                     | Чому це не ламає існуюче                                                                      |
| ------------------------------------------ | ------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Redis замість in-memory cache              | +1 місяць                             | `RedisCacheService`, реалізує `ICacheService`                                    | Все залежить від інтерфейсу, а не від `Map`                                                   |
| BullMQ для черг                            | +2 тижні після Redis                  | `QueueModule`, асинхронна/масова обробка профілів                                | Redis вже піднятий і сконфігурований                                                          |
| Auth + guard                               | за потреби                            | `AuthModule`, `@UseGuards(JwtAuthGuard)` на потрібних контролерах                | Guard — декоратор поверх контролера, не залежність усередині модулів                          |
| PostgreSQL + Prisma                        | коли треба зберігати історію аналізів | `PrismaModule`, репозиторій в `analysis/`                                        | `google-places` і rules engine нічого не знають про БД                                        |
| Export CSV/PDF/Google Sheets               | за потреби                            | новий `reports/`-модуль, читає готовий `AnalysisResult`                          | Формат результату вже стабільний і не привʼязаний до джерела даних                            |
| Кастомізований скоринг (вибіркові правила) | за потреби                            | `POST /analysis` приймає `selectedRuleIds`, перерахунок ваг серед обраних правил | Rules engine вже ізольований — зміна тільки в API-шарі й агрегації, самі правила не чіпаються |
| Frontend (Next.js)                         | старт UI                              | `apps/web` поруч з `apps/api`                                                    | Бекенд вже REST з чітким контрактом відповіді (envelope)                                      |

---

## 9. Тестування

- **Rules engine** — головний кандидат на unit-тести: кожна функція тестується як `expect(rule(mockProfile)).toEqual(...)`, без жодних моків, оскільки функції чисті.
- **`attributesRule`** — окремо тестується для HoReCa-категорії і для не-HoReCa, щоб підтвердити коректність `CATEGORY_TO_RELEVANT_ATTRIBUTES` і fallback-поведінку.
- **AnalysisService** — тестується з замоканим `IGooglePlacesPort` (інтерфейс, не конкретний адаптер) — перевіряємо тільки оркестрацію і агрегацію скору.
- **GooglePlacesAdapter** — тестується окремо, з замоканим HTTP-клієнтом: перевіряє коректність мапінгу сирої відповіді і коректність мапінгу помилок Google (`ZERO_RESULTS`, квота) у домен-винятки.
- **`place-id-resolver.service.ts`** — окремо тестується на всіх підтримних форматах входу (Place ID, короткий лінк, повний лінк з CID, `?cid=`).

---

## 10. Що свідомо НЕ входить у цю версію

Щоб не переускладнювати тестове, свідомо відкладено (а не забуто — див. Дорожню карту):

- авторизація — інструмент публічний, аналізує будь-який профіль без входу (захищений лише базовим rate-limit, розділ 2.9);
- збереження історії аналізів у БД — поки stateless, тільки кеш відповіді Google на короткий TTL;
- пакетний/масовий аналіз кількох профілів одразу;
- експорт звітів (CSV/PDF/Google Sheets);
- кастомізований скоринг (вибір правил на фронтенді) — архітектура це вже підтримує через ізольований rules engine, реалізація — за потреби (розділ 8);
- дані, недоступні через публічний Places API (New) — прозоро зазначається в README як межа інструменту:
  - активність Google Posts та розділ Q&A;
  - відповіді власника на відгуки та **review velocity** (рівномірність накопичення відгуків у часі) — один із топ-факторів ранжування за оцінками SEO-практики, але недоступний через публічний API;
  - секція **Products/Services** — окрема частина профілю, Places API (New) її не повертає;
  - **свіжість фото** (дата завантаження) — API повертає лише самі референси фото, без часових міток;
  - **NAP-консистентність із зовнішніми джерелами** (сайт бізнесу, інші довідники) — перевіряється лише повнота й формат контактних даних усередині самого профілю, без звірки з сайтом чи каталогами.
