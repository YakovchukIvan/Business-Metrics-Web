# Workflow: Creating a New Nest Module

When asked to create a new module, follow exactly this structure (matches `cache`/`google-places`/`analysis`):

1. **Create the folder:** `apps/api/src/modules/[name]/`.
2. **Define the port first:** If this module will be consumed by others, create `interfaces/[name]-service.interface.ts` (or `[name]-port.interface.ts`) BEFORE writing any implementation. Other modules must only ever depend on this interface.
3. **DI token:** If the module needs to be swappable (like `cache`), create `[name].constants.ts` with a `Symbol`-based token, and register it via `provide`/`useClass` in the module — never let consumers import the concrete class directly.
4. **Implementation:** Put concrete logic in `adapters/` (external integrations) or directly in `[name].service.ts` (pure internal logic).
5. **Testing:** Create `__tests__/` inside the module folder. All `.spec.ts` files related to this module MUST be placed here.
6. **Module file:** `[name].module.ts` — explicit `imports`, `providers`, `exports`. Export only the interface/token, never internal implementation classes.
7. **Register in `app.module.ts`.**
8. **Update ESLint boundaries:** If this module should be isolated from another (like `analysis` from `google-places`), add a zone to `import/no-restricted-paths` in `apps/api/eslint.config.mjs`. Ask the user before doing this if the boundary rule isn't obvious from existing patterns.
9. **Update `.agents/state-api.md`** once the module compiles and its checklist item is done.
