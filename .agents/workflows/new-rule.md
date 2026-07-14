# Workflow: Creating a New Analysis Rule

When asked to create a new evaluation rule, follow exactly these steps in both the backend (API) and frontend (Web) parts of the monorepo.

## Step 1: Backend (apps/api)

1. **Create the File:** Create `apps/api/src/modules/analysis/rules/[name].rule.ts`.
2. **Implement Pure Function:**
   - Implement the rule matching the `AnalysisRule` signature. DO NOT inject any services.
   - Return `{ applicable: boolean, successRatio: number, issues: [...] }`.
   - Use `applicable: false` if the rule doesn't make sense for a specific business category.
   - `successRatio` must be a decimal between `0.0` and `1.0`. The engine will dynamically calculate the final score.
3. **Set Base Weight:** Add the rule's `ruleId` and base weight to `RULE_WEIGHTS` in `apps/api/src/modules/analysis/constants/analysis.constants.ts`.
4. **Register:** Import and add the rule to the `ANALYSIS_RULES` array in `apps/api/src/modules/analysis/rules/index.ts`.
5. **Test:** Create a corresponding `.spec.ts` file in `apps/api/src/modules/analysis/__tests__/rules/`. Cover all edge cases (full success, partial success, not applicable) using mocked `PlaceProfile` objects.

## Step 2: Frontend (apps/web)

1. **Map Rule Metadata:** Add the new rule's configuration to the `WEIGHTED_RULES` array in `apps/web/src/lib/constants/scoring.ts`.
   - Provide a human-readable name, icon, description, and impact priority.
2. **Update Detailed Analysis UI:** In `apps/web/src/components/analysis/detailed-analysis.tsx`, locate the `switch` statement that renders the raw data values. Add a `case` for your new rule's ID so the frontend can properly visualize the metric.
