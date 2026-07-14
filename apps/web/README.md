# ProfileLens — Web Interface

## Product Overview

The Web Interface for ProfileLens is a modern, high-performance **Next.js 16 (App Router)** application. It provides users with a stunning, premium UI to input a Google Maps link or Place ID and visualize their SEO optimization score and detailed breakdown.

**Architectural Golden Rule:** The frontend **NEVER** calculates scores, business logic, or dynamic weights. It acts purely as a highly reactive presentation layer that consumes strict JSON envelopes (`{ success, data, meta }`) from the NestJS API.

## Tech Stack & Design System

We prioritize modern web design aesthetics, micro-interactions, and accessibility.

| Technology           | Role in the project                                                                  |
| -------------------- | ------------------------------------------------------------------------------------ |
| **Next.js 16**       | Core React framework using the App Router for fast, static/dynamic hybrid rendering. |
| **React 19**         | The foundation for UI components and hooks.                                          |
| **TypeScript 5**     | Strict static typing, sharing Data Transfer Objects (DTOs) heavily with the API.     |
| **Tailwind CSS v4**  | Utility-first styling for building dynamic, responsive, and curated design tokens.   |
| **shadcn/ui**        | Premium accessible components built on top of Radix UI / Base UI primitives.         |
| **tw-animate-css**   | Fluid micro-animations (e.g., staggered fade-ins) without heavy JS libraries.        |
| **Sonner (Toaster)** | Elegant toast notifications for error handling and UX feedback.                      |
| **Lucide React**     | Clean, consistent SVG iconography.                                                   |
| **TanStack Query**   | Asynchronous state management, intelligent caching, and mutation handling.           |
| **Recharts**         | Interactive SVG charting for visual data breakdowns.                                 |

## Key UI/UX Features

- **Detailed Data Analysis:** Displays the raw Google Places data parsed by the API. Each metric is accompanied by a **Dynamic Help Tooltip** that explains _why_ a specific rule exists and how it impacts SEO ranking.
- **Rule Breakdown:** Visualizes the score distribution (out of 100). Rules that don't apply to a specific business type (e.g., Service Options for a plumber) are gracefully grayed out (`N/A`) without breaking the UI.
- **Prioritized Recommendations:** Issues are sorted and color-coded by priority (High, Medium, Low), allowing users to see exactly which fixes yield the highest "potential gain" in points.

## Architecture Overview

- **`src/app/`**: Contains page routes (`page.tsx`, `docs/page.tsx`), layouts, and global providers.
- **`src/components/`**:
  - `ui/`: Primitive reusable components (shadcn/ui, Radix).
  - `analysis/`: Complex domain-specific components (`detailed-analysis.tsx`, `breakdown-card.tsx`).
- **`src/lib/constants/scoring.ts`**: The UI mapping layer. Maps backend `ruleId`s to human-readable names, icons, descriptions, and UI priorities.
- **`src/hooks/`**: Encapsulates `TanStack Query` mutations (e.g., `use-analysis.ts`).

## Explicit Note on Local Storage

Recent searches are persisted exclusively on the client side using `localStorage` (via `recent-searches.ts`). We do not use a backend database for user search history. This ensures privacy and minimizes backend infrastructure complexity for the MVP phase.

## Local Setup Instructions

1. **Install dependencies from the root monorepo directory:**

   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   Create an `.env` file in `apps/web/`:

   ```env
   # The URL of the ProfileLens API (NestJS backend)
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Run the development server (from root or apps/web):**

   ```bash
   npm run dev
   ```

4. **Open the app:** Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Consciously Postponed

- **Authentication & User Accounts**: Not required for the MVP; all analysis is anonymous.
- **Backend Persistence**: No database is used to store analysis results or histories.
- **Internationalization (i18n)**: English-only for the MVP.
