# Workflow: Creating a New Web Component (Next.js)

When asked to create a new UI component or feature on the web, always follow this workflow to ensure strict adherence to Next.js best practices and our architectural boundaries.

## 1. Determine Component Type (Server vs Client)

By default, **ALL** components must be Server Components.
You must ONLY drop down to a Client Component if you need:

- React Hooks (`useState`, `useEffect`, `useRef`, etc.)
- Browser APIs (`localStorage`, `window`, etc.)
- Interactivity (event listeners like `onClick`, `onChange`)
- Third-party libraries that rely on context (e.g., TanStack Query)

**Constraints:**

- **Server Component:** Does NOT use `'use server'`. Do NOT put `'use server'` at the top of a Server Component (that is for Server Actions only).
- **Client Component:** MUST start with `'use client';` at the very top of the file.
- **Import Rule:** A Client Component **CANNOT** import a Server Component directly. If a Client Component needs to wrap a Server Component, you must pass the Server Component via the `children` prop (Composition Pattern).

## 2. Determine Location

Place the component in the correct directory (paths relative to `apps/web/`):

- `src/components/ui/` — shadcn/ui generic primitives (Button, Input, Card). No business logic.
- `src/components/layout/` — Shell elements (Header, Footer, Navigation).
- `src/components/analysis/` — Feature-specific business components (ScoreCard, IssuesList).

**Strict Dependency Flow:**

- `ui/` CANNOT import from anywhere else.
- `layout/` CAN import `ui/` but NOT `analysis/`.
- `analysis/` CAN import `ui/` and `layout/`.

## 3. Data Fetching & State

- **Do not use `fetch()` directly in components.** All API calls must go through `src/lib/api/client.ts` and `src/hooks/`.
- Use TanStack Query (`useMutation` or `useQuery`) for API interactions (which requires a Client Component).
- Manage local state with `useState` or `useReducer`, but keep it as close to where it's needed as possible.

## 4. Implementation Steps

1. **Analyze Requirements:** Does it need state? If yes, it's a Client Component.
2. **Create the File:** e.g., `src/components/analysis/my-feature.tsx`.
3. **Add Directives:** Add `'use client';` if required.
4. **Build the UI:** Use primitives from `src/components/ui/` (Tailwind classes for layout).
5. **Add Types:** Interface/type definitions for props at the top of the file.
6. **Export:** Export as a `default` or `named` export (standardize across the team).

## Example: Client Component wrapping a Server Component (Composition)

```tsx
// Server Component (parent)
import ClientWrapper from './client-wrapper';
import StaticServerData from './static-server-data';

export default function Page() {
  return (
    <ClientWrapper>
      <StaticServerData />
    </ClientWrapper>
  );
}

// Client Component (client-wrapper.tsx)
('use client');
import { useState } from 'react';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div onClick={() => setOpen(!open)}>{open && children}</div>;
}
```
