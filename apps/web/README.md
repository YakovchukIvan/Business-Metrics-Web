# ProfileLens — Web Interface

ProfileLens is an MVP tool for analyzing Google Business Profile optimization. The web interface allows users to input a Google Maps link or Place ID, calculates a score (0–100), and provides actionable recommendations based on the backend analysis.

Live API Documentation (when running locally): [http://localhost:3001/api/docs](/api/docs)

## Tech Stack

| Technology        | Description                        |
| ----------------- | ---------------------------------- |
| Next.js 16        | React framework (App Router)       |
| React 19          | UI library                         |
| TypeScript 5      | Static typing                      |
| Tailwind CSS v4   | Utility-first CSS framework        |
| shadcn/ui         | UI components                      |
| TanStack Query v5 | Data fetching and state management |
| Base UI           | Accessible unstyled components     |
| Recharts          | Charting library                   |

## Local Setup Instructions

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy the example environment file and configure it if needed.

   ```bash
   cp .env.example .env.local
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Example `.env.local`

```env
# The URL of the ProfileLens API (NestJS backend)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Architecture Overview

- **App Router (`src/app`)**: Contains pages (`page.tsx`, `docs/page.tsx`), layouts, and global providers.
- **Components (`src/components`)**: Reusable UI elements. Includes `ui/` for shadcn/ui and structural elements for the main interface.
- **Hooks (`src/hooks`)**: Custom React hooks, including `use-analysis.ts` which encapsulates TanStack Query mutations for API calls.
- **Lib (`src/lib`)**: Utility functions, API clients (`api/client.ts`), and typed models (`types/models.ts`).
- **Config (`src/config`)**: Environment variable validation and other configuration logic (`env.ts`).

The application strictly separates API logic from web rendering. The API layer handles fetching and parsing strict JSON envelopes (`{ success, data, meta }`), while components focus purely on presentation and state.

## Explicit Note on Local Storage

Recent searches are persisted exclusively on the client side using `localStorage`. We do not use a backend database for user search history. This ensures privacy and minimizes backend complexity for the MVP phase. The `recent-searches.ts` adapter handles safe reading and writing of this data.

## Consciously Postponed

- **Authentication & User Accounts**: Not required for the MVP; all analysis is anonymous.
- **Backend Persistence**: No database is used to store analysis results or histories; everything is on-the-fly and client-cached.
- **Complex Animations / Transitions**: Kept minimal to prioritize core functionality and strict architectural boundaries.
- **Internationalization (i18n)**: English-only for the MVP.
