# ProfileLens (Business Metrics)

## 📌 5-Minute Onboarding

Welcome! This is **ProfileLens**, an MVP tool designed to analyze Google Business Profile optimization. You give it a Google Maps link or Place ID, and it calculates an SEO optimization score (0–100), provides a detailed breakdown, and generates actionable recommendations.

### 🏗️ 1. Architecture & Scalability

This project is engineered as a **Highly Scalable Monorepo** (using npm workspaces). The architecture guarantees strict separation of concerns, ensuring high maintainability, clarity, and future-proofing.

Currently, the system is strictly decoupled into two parts:

- **`apps/api` (Backend):** A **NestJS** REST API. It acts as the "brain," resolving Google Maps links, fetching data, running the Rules Engine, and outputting a predictable JSON envelope (`{ success, data, meta }`).
- **`apps/web` (Frontend):** A **Next.js 14** (App Router) client. It acts purely as a presentation layer, consuming the API's JSON to render a premium interface without coupling to any business logic.

#### **Why this architecture is powerful:**

Because the codebase is strictly decoupled, we are perfectly positioned to expand our ecosystem without causing spaghetti code or breaking existing features. In the future, we can seamlessly spin up new, specialized applications right alongside the current ones (and eventually evolve into distributed microservices if needed).

**Future Scalability Vision:**

```text
Business-Metrics-Web (Monorepo)
├── apps/
│   ├── api/        (Current NestJS REST API)
│   ├── web/        (Current Next.js Public Site)
│   ├── worker/     (Future Node.js app for background scraping & cron jobs)
│   └── crm/        (Future Internal Next.js Admin Panel)
└── packages/
    ├── shared-ts/  (Shared TypeScript interfaces & types)
    └── database/   (Shared ORM configuration)
```

**Key Benefits (The "Cool Factor"):**

1. **Zero Logic Bleed:** The frontend (`web`) never calculates scores. The backend (`api`) never worries about CSS.
2. **Effortless Scaling:** Need a background worker to analyze 10,000 places a night? Just create `apps/worker`. It can reuse the same exact analysis rules from the API without duplicating code.
3. **Painless Onboarding:** A new frontend developer can work exclusively in `apps/web` without needing to understand the complex NestJS architecture, and vice versa.
4. **Resilience:** Expanding the platform (e.g., adding a CRM) won't risk breaking the public-facing Web app.

_Golden Rule: The frontend NEVER calculates scores. The API is the single source of truth for all business logic._

---

### 🚀 2. How to Run the Project Locally

**Prerequisites:** Node.js (v20+), npm, and a valid Google Places API Key.

1. **Install dependencies from the root:**

   ```bash
   npm run install:all
   ```

2. **Environment Variables:**
   - Create `apps/api/.env`:

   - ```env
     GOOGLE_PLACES_API_KEY=your_google_api_key
     PORT=3001
     ```

   - Create `apps/web/.env`:

   - ```env
     NEXT_PUBLIC_API_URL=http://localhost:3001/api
     ```

3. **Start development servers:**

```bash
 npm run dev
```

_(This starts the API on port 3001 and the Web client on port 3000)._

---

### 🧠 3. How the Scoring Algorithm Works

The system is built to be strictly dynamic. The final score is **always exactly 100**, regardless of what type of business is analyzed. We achieve this using the **Largest Remainder Method** alongside a proportional calculation.

**The Math (Concrete Formula):**

```text
               earnedScore
finalScore = ────────────── × 100
               maximumScore
```

1. **Base Weights:** Every rule has a configured base weight (e.g., Photos = 15, Rating = 10).
2. **Applicability:** Not all rules apply to all businesses (e.g., "Service Options" like delivery/takeout apply to HoReCa, but not to plumbers). If a rule doesn't apply, it is marked `applicable: false`.
3. **Redistribution:** The weights of the _remaining applicable rules_ are scaled up proportionally so their sum perfectly equals 100 (`maximumScore`).
4. **Scoring (`successRatio`):** Each rule's logic returns a `successRatio` (0.0 to 1.0). The final score for that rule is `Math.round(successRatio * dynamic_weight)`. The sum of all these rounded scores perfectly equals the `finalScore`.

---

### 🛠️ 4. How to Add or Remove a Rule

Thanks to the dynamic scoring algorithm, adding or removing rules is incredibly easy. **You never have to manually rebalance the 100 points.**

#### **Adding a New Rule:**

**Backend (API):**

1. Create `[rule-name].rule.ts` in `apps/api/src/modules/analysis/rules/`.
2. Implement the logic (it takes a `PlaceProfile` and returns a `successRatio` + `issues`).
3. Export it in `index.ts` and add it to the `ANALYSIS_RULES` array.
4. Add a base weight to `RULE_WEIGHTS` in `apps/api/src/modules/analysis/constants/analysis.constants.ts`.
5. _Don't forget to write a test in `apps/api/src/modules/analysis/__tests__/rules/`._

**Frontend (Web):**

1. Add the rule's metadata (icon, priority, description) to `WEIGHTED_RULES` in `apps/web/src/lib/constants/scoring.ts`.
2. In `apps/web/src/components/analysis/detailed-analysis.tsx`, add a `switch` case for your rule's ID to display the raw data visually.

#### **Removing a Rule:**

1. Delete the rule file and its test on the backend.
2. Remove it from `ANALYSIS_RULES` and `RULE_WEIGHTS`.
3. Remove it from `WEIGHTED_RULES` and `detailed-analysis.tsx` on the frontend.
   _(The API will immediately recalculate the 100 points among the remaining rules. No further configuration is needed!)_
