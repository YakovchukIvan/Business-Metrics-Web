# Google Places API Limitations

This file documents known limitations and nuances of our Google Places integration.

## 1. photoCount

The `photoCount` property in `PlaceProfile` is derived from the length of the `photos` array returned by the API.
**IMPORTANT:** This is NOT the true total number of photos a business has. The API applies pagination and only returns a subset (e.g., up to 10 photos) per request. Therefore, `photoCount` should be treated as a boolean threshold (sufficient vs. insufficient), not an exact count.

## 2. CID and Shortlink Resolution

The older numeric identifier (CID) found in URLs like `data=!3m1!4b1!4m...` or `?cid=...` is resolved to a `Place ID` via a "best-effort" Text Search fallback. We extract the place name from the URL path and perform a Text Search using the Places API (New).
**IMPORTANT:** This resolution is not guaranteed to be exact, especially for franchise chains with multiple nearby locations.

## Supported Formats in v1

Our `resolvePlaceId` function explicitly supports:

- Raw Place IDs (e.g., `ChIJ...`)
- Google Maps Short Links (`maps.app.goo.gl/...` and `g.page/...`)
- Google Maps Long URLs with CID (`?cid=...` or `data=...`)
- General Google Maps URLs (resolved via text query fallback)
