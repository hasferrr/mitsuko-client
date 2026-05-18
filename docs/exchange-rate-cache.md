# Exchange Rate Cache

## Summary

The USD to IDR exchange rate route caches the upstream API response in the Next.js server Data Cache.

The cache lifetime is controlled by the upstream response `expiresAt` field. The app does not store expiry state in module variables or process memory.

This applies to:

- `/api/exchange-rate/usd-idr`
- pricing UI IDR conversion
- credit pack purchase currency data

## Cached Payload

The upstream response must contain:

- `rate`: positive USD to IDR rate
- `adjustedRate`: positive payment-adjusted USD to IDR rate
- `expiresAt`: expiry timestamp, or `null`

The route validates the upstream payload with Zod. Invalid payloads fall back to the configured environment rate.

The frontend receives:

- `rate`
- `adjustedRate`
- `source`: `"live"` or `"env"`
- `expiresAt`

## Cache Storage

The upstream request uses Next.js server caching:

```ts
fetch(upstreamUrl, {
  cache: "force-cache",
  next: { revalidate: false, tags: [CACHE_TAG] },
})
```

`revalidate: false` keeps the cached upstream response until the route explicitly invalidates its cache tag.

The route does not use local variables, maps, or in-memory timestamps as the cache source of truth.

## Expiry Flow

On each route request:

1. Read the exchange rate through Next.js Data Cache.
2. Check the returned payload `expiresAt`.
3. If `expiresAt` is missing, invalid, or in the past, expire the cache tag.
4. Read through Next.js Data Cache again so the stale entry is replaced by a fresh upstream response.
5. Return the fresh live response, or fall back to the environment rate if refresh fails.

This is why the route can call the cached fetch helper twice. The first read may be a stale cached value. The second read happens only after the tag is expired.

## Fallback Behavior

The route returns the environment fallback rate when:

- `API_SECRET` is missing
- `NEXT_PUBLIC_API_URL` is missing
- upstream returns a non-OK response
- upstream returns an invalid payload
- the cached value is expired and refresh fails

Fallback responses are not used as the upstream cache value.

## Client Behavior

The pricing UI starts with the configured fallback IDR rate.

When IDR pricing is requested, the client calls `/api/exchange-rate/usd-idr`. The server route handles caching and expiry. The client does not cache the exchange rate beyond its component state.
