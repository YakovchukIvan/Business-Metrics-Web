# Domain Knowledge: Google Places API (New)

## Core Concepts

- **Place ID:** Unique textual identifier for a place (e.g., `ChIJ...`). This is our primary key.
- **CID:** Older numeric identifier found in full Maps URLs (`...data=!...!1s0x...`). Must be resolved to a Place ID via Text Search fallback — this resolution is best-effort, not guaranteed exact, especially for chains with multiple nearby locations. Document this limitation to the user; do not silently assume a match is correct.
- **Short links** (`maps.app.goo.gl/...`): resolve via HTTP redirect to get the full URL, then extract Place ID or CID from it.

## Approved FieldMask

Do not add fields outside this list without checking pricing first:

- places.id
- places.displayName
- places.types
- places.formattedAddress
- places.internationalPhoneNumber
- places.websiteUri
- places.rating
- places.userRatingCount
- places.regularOpeningHours
- places.photos
- places.businessStatus
- places.editorialSummary
- places.delivery
- places.dineIn
- places.takeout
- places.wheelchairAccessibleEntrance

`places.reviews` is intentionally excluded — Enterprise SKU pricing tier, no rule uses review text.

## Known Limitations (must be documented in README, not hidden)

- **`photoCount`** is the number of photo references returned in one API response (capped by pagination), NOT the real number of photos on the profile. Treat as a boolean threshold (≥3 photos = 100% rule success), never as an exact count.
- **Service Options & Attributes** (`delivery`, `dineIn`, etc.) are only relevant for certain business categories (like restaurants). Check `CATEGORY_TO_RELEVANT_ATTRIBUTES` in `analysis.constants.ts`. If they do not apply, the rule MUST return `{ applicable: false }` — the Rule Engine 2.0 (Percentage System) will automatically redistribute its weight.

## Error Handling Expectations

Map these Google API conditions to domain exceptions (not raw HTTP client errors) before they reach the controller:

- `ZERO_RESULTS` → 404
- `REQUEST_DENIED` / quota exhausted → 429 or 502
- Invalid input (not a URL, not a Place ID) → 400, caught before calling Google at all
