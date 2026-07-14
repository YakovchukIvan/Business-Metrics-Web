# 🎯 ProfileLens (Business Metrics)

ProfileLens is an MVP tool designed to analyze Google Business Profile SEO optimization. By providing a Google Maps link or Place ID, the system calculates a dynamic score (0–100), delivers a detailed analytical breakdown, and generates actionable recommendations.

## 🏗️ Architecture & Scalability (The Monorepo Vision)

This project is engineered as a **Highly Scalable Monorepo** (using npm workspaces). The architecture guarantees a strict separation of concerns, ensuring high maintainability, zero logic bleed, and effortless future-proofing.

The codebase is structured to scale painlessly. As the ecosystem grows, we can seamlessly spin up new specialized applications right alongside the current ones, sharing core types and database configurations without duplicating code.

**Current & Future Architecture Map:**

```text
Business-Metrics-Web (Monorepo)
├── apps/
│   ├── api/        (Current NestJS REST API)
│   ├── web/        (Current Next.js Public Site)
│   ├── worker/     (Future Node.js app for background scraping & cron jobs)
│   └── crm/        (Future Internal Next.js Admin Panel)
└── packages/
    ├── shared-ts/  (Future Shared TypeScript interfaces & types)
    └── database/   (Future Shared ORM configuration)

```

| Module             | Technology | Hosting         | Responsibility                                                                              |
| ------------------ | ---------- | --------------- | ------------------------------------------------------------------------------------------- |
| **API (Backend)**  | NestJS     | Render (Docker) | The single source of truth. Handles business logic, scoring algorithms, and data fetching.  |
| **Web (Frontend)** | Next.js 14 | Vercel          | Pure presentation layer. It never calculates scores, only visualizes the API's JSON output. |

_(Note: Always run commands from the repository root. All scripts orchestrate both apps via `concurrently` and npm workspace forwarding)._

## 🚀 Quick Start (Local Development)

**Prerequisites:** Node.js (v22+), npm, and a valid Google Places API Key.

**Step 1: Install Dependencies**
Run this in the repository root to install packages for all workspaces:

```bash
npm install

```

**Step 2: Environment Variables**
Create `apps/api/.env`:

```env
GOOGLE_PLACES_API_KEY=your_key_here
PORT=5000

```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000

```

**Step 3: Run the Project:**
Run this in the repository root...

```bash
npm run dev

```

## 🧠 Dynamic Scoring Algorithm

The final score is **always exactly 100**, regardless of the business type. We achieve this using a dynamic redistribution method, meaning you never have to manually rebalance points.

**Formula:** `Final Score = (Earned Score / Maximum Score) * 100`

- Every rule has a base weight.
- If a rule does not apply to a specific business type, it is marked `applicable: false` and dropped.
- The weights of the _remaining_ applicable rules are scaled up proportionally so their sum perfectly equals 100.

## 🛠️ Adding or Removing Rules

**To add a new rule:**

1. **Backend:** Create the rule file in `apps/api/src/modules/analysis/rules/`. Add it to the `ANALYSIS_RULES` array and assign a base weight in `RULE_WEIGHTS`.
2. **Frontend:** Add metadata (icon, description) to `WEIGHTED_RULES` in `apps/web`.

**To remove a rule:**
Simply delete the rule from both the backend and frontend. The API will immediately and automatically recalculate the 100-point distribution among the remaining rules.

## ☁️ CI/CD & Deployment

Deployments are fully automated. Direct pushes to the `main` branch are discouraged; use a Pull Request workflow.

- **CI (Continuous Integration):** Managed via GitHub Actions. Creating a Pull Request automatically runs parallel, isolated jobs for linting and testing across both `apps/api` and `apps/web`.
- **CD (Backend):** Render automatically builds and deploys the Docker container upon a merge to `main`.
- **CD (Frontend):** Native Vercel integration generates preview URLs for branches and deploys to production upon a merge to `main`.

## 🪝 Git Hooks (Husky)

This project uses **Husky** + **lint-staged** for pre-commit checks to ensure code quality. Checks only run against staged files to keep commits lightning-fast.

_Windows Users Note:_ If hooks fail to trigger, ensure `.husky/pre-commit` has executable permissions. If Husky breaks your cloud deployments, use the `--ignore-scripts` flag during the build step.

---
