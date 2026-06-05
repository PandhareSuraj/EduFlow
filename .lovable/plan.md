# Fix "not able to login" (auth lock timeout)

The login failure is caused by a `Navigator LockManager` lock timeout on the Supabase auth token, made worse by the service worker intercepting Supabase requests. Fix both.

## 1. Bypass the Navigator lock — `src/integrations/supabase/client.ts`
Add a custom `lock` to the auth config so `supabase-js` no longer relies on the exclusive cross-tab Web Lock that times out after 10s when multiple tabs / the service worker contend for it. Also set an explicit `storageKey`.

```ts
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    storageKey: 'sb-velhefqnjmevluskffzp-auth-token',
    persistSession: true,
    autoRefreshToken: true,
    // Run the callback immediately instead of waiting on Navigator LockManager,
    // which deadlocks across multiple tabs + the service worker.
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
});
```

This removes the `Acquiring an exclusive Navigator LockManager lock ... timed out` error and lets login proceed.

## 2. Stop the service worker from handling Supabase requests — `public/service-worker.js`
In the `fetch` handler, return early for any `supabase` host so auth/session requests always go straight to the network (no caching, no stale sessions, no `Revalidate fetch failed`). Replace the current `networkFirst` branch:

```js
// Never intercept Supabase (auth/session/data) — always go to network.
if (url.hostname.includes('supabase')) {
  return;
}
```

Also bump the cache version constants (e.g. `v3` -> `v4`) so existing clients drop the old caches that may hold stale Supabase responses.

## Verification
- Build check.
- Reload the preview, confirm the LockManager error is gone from the console, and that signing in succeeds (including with the app open in a second tab).