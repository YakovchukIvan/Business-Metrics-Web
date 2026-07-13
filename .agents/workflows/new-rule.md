# Workflow: Creating a New Analysis Rule

When asked to create a new evaluation rule, follow exactly these steps:

1. **Create the File:** Create `src/modules/analysis/rules/[name].rule.ts`.
2. **Pure Function:** Implement the rule as a pure function matching the `AnalysisRule` signature. DO NOT inject any services.
3. **Set Weight:** Add the rule's metadata (weight, thresholds) to `analysis.constants.ts`.
4. **Register:** Import and add the rule to the `ANALYSIS_RULES` array in `src/modules/analysis/rules/index.ts`.
5. **Test:** Create a corresponding `.spec.ts` file covering a `passed` and `failed` scenario using mocked `PlaceProfile` objects.
