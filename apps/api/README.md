# ProfileLens API

## Product Overview

ProfileLens is a REST API tool for automated SEO auditing of Google Business Profiles (GBP). The system accepts a Google Maps link or a Place ID, retrieves data via the Google Places API (New), analyzes it against a set of business rules, and generates a detailed score (0-100) with specific recommendations for improving the business's visibility.

What is analyzed:

- Profile completeness (address, phone number, website)
- Rating and number of reviews
- Presence of regular opening hours
- Number of uploaded photos
- Business category
- Business status (OPERATIONAL)
- Specific attributes (e.g., delivery/dine-in for restaurants, or wheelchair accessibility for others).

## Tech Stack

| Technology     | Role in the project                                                                      |
| -------------- | ---------------------------------------------------------------------------------------- |
| **NestJS**     | Core framework providing strict modular architecture and DI (Dependency Injection).      |
| **TypeScript** | Strict typing (strict mode) to prevent errors at compile time.                           |
| **Zod**        | Configuration safety: strict validation of environment variables at application startup. |
| **Jest**       | Unit testing for business logic and isolated services.                                   |
| **Swagger**    | Automatic generation of interactive REST API documentation.                              |
| **Docker**     | Containerization (multi-stage build) for easy local setup and reliable deployments.      |

## Architecture & Structure

The project is designed with a focus on **scalability and easy maintenance**. We use a strict modular system (in the style of hexagonal architecture / Ports & Adapters), where each module is isolated and independent.

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

**Key Architectural Decisions:**

- **Absolute Independence:** The `analysis` module (which calculates points) knows nothing about the Google API. It strictly accepts a standardized `PlaceProfile` interface. This allows testing logic easily without depending on external services.
- **Easy Scalability:** If we need to store audit history in the future, we simply add a `database` module (with Prisma/PostgreSQL) without touching existing business logic.
- **Pure Functions (Rules Engine):** Every evaluation rule is a "pure function". Adding a new rule, changing point balance, or testing takes mere minutes. Thanks to this, the logic is covered by unit tests at 100%.

## Evaluation Algorithm (Rules Engine)

| Rule                  | Weight | Why it matters                                                                    |
| --------------------- | ------ | --------------------------------------------------------------------------------- |
| **Rating**            | 30     | High ratings and a large number of reviews are key ranking factors.               |
| **Completeness**      | 20     | Missing fields (phone, website) repel clients and lower Google's trust.           |
| **Business Category** | 15     | Without a category, the profile won't show up in relevant search queries.         |
| **Opening Hours**     | 15     | Missing opening hours often result in customers going to competitors.             |
| **Business Status**   | 10     | Temporarily or permanently closed businesses are penalized in search results.     |
| **Photos**            | 7      | Profiles with photos receive significantly more engagement (clicks, directions).  |
| **Attributes**        | 3      | Specific attributes (e.g. delivery) help capture niche, long-tail search queries. |

## What is NOT analyzed (Limitations)

To preserve performance, save costs, and due to API limitations, ProfileLens **deliberately does not analyze**:

- Owner responses to reviews and their frequency (review velocity).
- Posts and the Q&A section.
- The Products and Services section.
- Photo freshness (upload dates are not tracked).
- NAP (Name, Address, Phone) consistency across external sources (websites, directories).

## Technical Nuances

- **`photoCount`:** The Google API limits the number of photos in a single response (pagination). Therefore, we use this field as a boolean threshold (e.g., $\ge$ 3 photos), rather than an exact absolute count of photos in the profile.
- **`attributes`:** The set of available attributes heavily depends on the category. For HoReCa (restaurants), we check `dineIn`, `takeout`, `delivery`. For other categories, a universal fallback is used (e.g., wheelchair accessible entrance).
- **FieldMask (No Reviews):** The Google Places API request uses a strictly defined `FieldMask`. We **deliberately excluded `places.reviews`**, as this field is automatically billed at the highest tier (Enterprise SKU), which would make every audit unjustifiably expensive.

## Request Example (POST /analysis)

The endpoint supports Place IDs, short links (`maps.app.goo.gl`), and full Maps URLs.

```bash
curl -X POST http://localhost:5000/api/analysis \
  -H "Content-Type: application/json" \
  -d '{"input": "https://maps.app.goo.gl/abcd123"}'
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    "businessName": "Acme Corp",
    "address": "123 Main St, NY",
    "score": 93,
    "breakdown": [
      { "ruleId": "rating", "weight": 30, "passed": true, "score": 30 },
      { "ruleId": "photos", "weight": 7, "passed": false, "score": 0 }
    ],
    "issues": [
      {
        "ruleId": "photos",
        "message": "Profile has insufficient photos (2 detected)",
        "recommendation": "Upload at least 3 high-quality photos.",
        "potentialGain": 7
      }
    ]
  },
  "meta": {
    "path": "/analysis",
    "timestamp": "2026-07-13T12:00:00.000Z"
  }
}
```

## Setup Instructions

### Running via Docker (Recommended for Production)

1. Create a `.env` file based on the example.
2. Spin up the containers:

```bash
   docker compose up --build -d
```

The application will be available on port 3000.

### Local Setup (Development)

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the `.env` file.
3. Start the server:

```bash
  npm run start:dev
```

4. Open Swagger UI: `http://localhost:5000/api/docs`

## Example `.env`

```env
# All values below are defaults.
# You can copy them to your local .env file.

# ----------------------------------------
# Server Configuration
# ----------------------------------------
NODE_ENV=development
PORT=5000

# ----------------------------------------
# External APIs (Google Places)
# ----------------------------------------
GOOGLE_PLACES_API_KEY=AIzaSyYourGoogleApiKeyHere...

# ----------------------------------------
# Performance & Security
# ----------------------------------------
# Cache for 24 hours
CACHE_TTL_SECONDS=86400

# Limit: 5 requests per minute
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

As part of this MVP (test assignment), the following components were deliberately postponed for future iterations:

- User authorization and authentication (Auth).
- Database (Prisma/PostgreSQL) for storing audit histories.
- Asynchronous batch analysis (Redis + BullMQ) for bulk profile checks.
- Export module (generating PDF/CSV reports).
- The ability to toggle or customize the weight of individual rules from the client side.
