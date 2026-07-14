# ProfileLens API

## Product Overview

ProfileLens is a REST API tool for automated SEO auditing of Google Business Profiles (GBP). The system accepts a Google Maps link or a Place ID, retrieves data via the Google Places API (New), analyzes it against a flexible set of business rules, and generates a detailed score (0-100) with specific recommendations for improving the business's visibility.

What is analyzed:

- Profile completeness (address, phone number, website)
- Rating and number of reviews
- Presence of regular opening hours
- Number of uploaded photos
- Business category (Primary and total count)
- Business status (OPERATIONAL)
- Name spam (keyword stuffing detection)
- Service options (delivery/dine-in for restaurants)
- Specific attributes (e.g., wheelchair accessibility)

## Tech Stack

| Technology     | Role in the project                                                                      |
| -------------- | ---------------------------------------------------------------------------------------- |
| **NestJS**     | Core framework providing strict modular architecture and DI (Dependency Injection).      |
| **TypeScript** | Strict typing (strict mode) to prevent errors at compile time.                           |
| **Zod**        | Configuration safety: strict validation of environment variables at application startup. |
| **Jest**       | Unit testing for business logic and isolated services.                                   |
| **Swagger**    | Automatic generation of interactive REST API documentation.                              |
| **Docker**     | Containerization (multi-stage build) for easy local setup and reliable deployments.      |

## Architecture & Scalability

The project is designed as a highly decoupled module within a broader monorepo. It strictly adheres to **Domain-Driven Design** and **Ports & Adapters (Hexagonal)** principles.

```text
src/
├── common/        # Universal utilities (interceptors, filters, global DTOs). No business logic.
├── config/        # Configuration and Zod validation of environment variables (.env).
└── modules/       # Independent, isolated modules:
    ├── analysis/       # Core module: Evaluation rules (Rules Engine) and orchestration.
    ├── cache/          # Custom in-memory cache (designed for easy swap to Redis).
    ├── google-places/  # Adapter for interacting with Google API (the only place where HTTP requests occur).
    └── health/         # Basic liveness-check for Docker / Kubernetes.
```

**Key Architectural Benefits (The "Cool Factor"):**

- **Microservices-Ready:** The `analysis` module knows nothing about the `google-places` module. It only accepts a standardized `PlaceProfile` interface. If we ever want to move the Google scraping to a background worker microservice, the rules engine can be copied over without rewriting a single line of logic.
- **Pure Functions (Rules Engine):** Every evaluation rule is a pure function. Adding a new rule, changing point balance, or testing takes mere minutes. Thanks to this, the core logic is 100% covered by unit tests (located in `__tests__` folders).
- **Dynamic Scoring Allocation:** The system uses the **Largest Remainder Method**. If a rule is `applicable: false` (e.g., service options for a plumber), the system automatically redistributes those points across the remaining rules so the max score is always exactly 100.

## Evaluation Algorithm (Rules Engine)

| Rule                  | Base Weight | Why it matters                                                                    |
| --------------------- | ----------- | --------------------------------------------------------------------------------- |
| **Rating**            | 30          | High ratings and a large number of reviews are key ranking factors.               |
| **Completeness**      | 20          | Missing fields (phone, website) repel clients and lower Google's trust.           |
| **Business Category** | 20          | Proper primary category and multiple subcategories capture broader search intent. |
| **Opening Hours**     | 15          | Missing opening hours often result in customers going to competitors.             |
| **Business Status**   | 10          | Temporarily or permanently closed businesses are penalized in search results.     |
| **Service Options**   | 8           | Delivery, Takeout, and Dine-in are critical for HoReCa visibility.                |
| **Photos**            | 7           | Profiles with photos receive significantly more engagement (clicks, directions).  |
| **Name Spam**         | 5           | Keyword stuffing in the business name violates Google's guidelines.               |
| **Attributes**        | 3           | Specific attributes (e.g. accessibility) help capture long-tail voice queries.    |

_Note: Base weights are dynamically scaled. If `Service Options` does not apply to a business, its 8 points are proportionally distributed to the other rules._

## What is NOT analyzed (Limitations)

To preserve performance, save costs, and due to API limitations, ProfileLens **deliberately does not analyze**:

- Owner responses to reviews and their frequency (review velocity).
- Posts and the Q&A section.
- The Products and Services section.
- Photo freshness (upload dates are not tracked).
- NAP (Name, Address, Phone) consistency across external sources.

## Technical Nuances

- **`photoCount`:** The Google API limits the number of photos in a single response (pagination). Therefore, we use this field as a boolean threshold (e.g., $\ge$ 3 photos), rather than an exact absolute count.
- **Context-Aware Rules:** Some rules (like `Service Options`) only execute for relevant business types (e.g., HoReCa). If the business is a manufacturer, the rule gracefully skips execution (`applicable: false`).
- **FieldMask (No Reviews):** The Google Places API request uses a strictly defined `FieldMask`. We **deliberately excluded `places.reviews`**, as this field is automatically billed at the highest tier (Enterprise SKU).

## Request Example (POST /analysis)

The endpoint supports Place IDs, short links (`maps.app.goo.gl`), and full Maps URLs.

```bash
curl -X POST http://localhost:3001/api/analysis \
  -H "Content-Type: application/json" \
  -d '{"input": "https://maps.app.goo.gl/abcd123"}'
```

_(See Swagger UI for the full Response Example)_

## Setup Instructions

### Running via Docker (Recommended for Production)

1. Create a `.env` file based on the example.
2. Spin up the containers:

```bash
docker compose up --build -d
```

The application will be available on port 3001 (or as configured).

### Local Setup (Development)

1. Install dependencies from the root monorepo directory:

   ```bash
   npm run install:all
   ```

2. Configure the `.env` file in `apps/api`.

3. Start the server (from root or `apps/api`):

   ```bash
   npm run dev
   ```

4. Open Swagger UI: `http://localhost:3001/api/docs`

## Example `.env`

```env
# ----------------------------------------
# Server Configuration
# ----------------------------------------
NODE_ENV=development
PORT=3001

# ----------------------------------------
# External APIs (Google Places)
# ----------------------------------------
GOOGLE_PLACES_API_KEY=AIzaSyYourGoogleApiKeyHere...

# ----------------------------------------
# Performance & Security
# ----------------------------------------
CACHE_TTL_SECONDS=86400
THROTTLER_TTL_MS=60000
THROTTLER_LIMIT=5

# ----------------------------------------
# Documentation (Swagger)
# ----------------------------------------
SWAGGER_TITLE=ProfileLens API
SWAGGER_DESCRIPTION=API for Google Business Profile optimization analysis
SWAGGER_VERSION=1.0
```

## Consciously Postponed

As part of this MVP, the following components were deliberately postponed:

- User authorization and authentication (Auth).
- Database (Prisma/PostgreSQL) for storing audit histories.
- Asynchronous batch analysis (Redis + BullMQ) for bulk profile checks.
