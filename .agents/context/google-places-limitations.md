# Google Places API Limitations

This file documents known limitations, nuances, and deliberate architectural exclusions of our Google Places API (New) integration.

## 1. photoCount Limitation

The `photoCount` property in our `PlaceProfile` is derived strictly from the length of the `photos` array returned by the API.
**IMPORTANT:** This is NOT the true total number of photos a business has. The API applies hard pagination and only returns a subset of photo references (usually up to 10) per single request. Therefore, our Rules Engine treats `photoCount` as a boolean threshold (sufficient vs. insufficient, e.g., ≥3), rather than attempting to grade an exact count.

## 2. Missing Attributes & "Undefined" Values

The Google Places API does not consistently return a `false` value for attributes a business hasn't configured. Instead, it **completely omits** the attribute from the response array.
**IMPORTANT:** Our system expects this behavior. If a relevant attribute (like `wheelchairAccessibleEntrance`, `delivery`, or `dineIn`) is missing from the Google response, the Rules Engine correctly interprets its absence as `false` (not optimized / not configured) and issues a penalty, rather than treating it as `N/A`.

## 3. Exclusion of Reviews (FieldMask)

Google Places API (New) determines billing based on the most expensive FieldMask requested. The `places.reviews` field falls under the highest billing tier (Enterprise SKU), making requests incredibly expensive.
**IMPORTANT:** We deliberately exclude `places.reviews` from our FieldMask. Our `rating.rule.ts` relies solely on `rating` and `userRatingCount` (Basic SKU). We do not analyze review sentiment, text, or owner responses (review velocity).

## 4. CID and Shortlink Resolution

The older numeric identifier (CID) found in URLs like `data=!3m1!4b1!4m...` or `?cid=...` is resolved to a `Place ID` via a "best-effort" Text Search fallback. We extract the place name from the URL path and perform a Text Search using the Places API.
**IMPORTANT:** This resolution is not guaranteed to be exact, especially for massive franchise chains with multiple nearby locations sharing the same name.

### Supported Formats in v1:

Our `resolvePlaceId` function explicitly supports:

- Raw Place IDs (e.g., `ChIJ...`)
- Google Maps Short Links (`maps.app.goo.gl/...` and `g.page/...`)
- Google Maps Long URLs with CID (`?cid=...` or `data=...`)

## 5. Generic Text Search Exclusion

Generic free-text search (e.g., just typing "McDonald's" or "КТС Луцьк" as input) is deliberately NOT supported as a fallback scenario in the `PlaceIdResolverService`.
**This is a conscious architectural decision made to:**

1. Prevent auditing the wrong business profile due to Google's ambiguous sorting of multiple matches (e.g., auditing the wrong branch of a local store).
2. Protect the paid Google Places API (New) quota from being drained by irrelevant generic queries, bots, or typos.

Users are strictly required to provide valid Google Maps URLs or exact Place IDs to ensure 100% accuracy in the SEO audit.
