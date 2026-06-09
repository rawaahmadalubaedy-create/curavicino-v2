---
name: CuraVicino Backend Integration
description: JWT auth setup, Drizzle ORM schema, Express API routes, mobile service layer — decisions and gotchas
---

## lib/db declaration rebuilds
After adding new schema files to lib/db, run `pnpm run typecheck:libs` from workspace root to rebuild composite declarations before typechecking api-server. Without this, api-server sees stale exports and reports "has no exported member" errors.

**Why:** lib/db is a composite project — api-server reads its .d.ts files, not source. The declarations only update on an explicit build.

**How to apply:** Any time you add a table to lib/db/src/schema/, run `pnpm run typecheck:libs` first, then typecheck api-server.

## req.params type narrowing for Drizzle eq()
Express types `req.params.id` as `string | string[]`. Drizzle's `eq()` only accepts `string`. Always extract and cast: `const fooId = String(req.params.id)` before using in a where clause.

**Why:** Drizzle strict typing; no implicit widening.

## Mobile API base URL
In services/api.ts, the base URL is constructed as `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`. EXPO_PUBLIC_DOMAIN is wired by the Expo workflow as `$REPLIT_DEV_DOMAIN`. No trailing slash on domain.

## Token storage keys
- Access token: `cv_access_token`
- Refresh token: `cv_refresh_token`
- Cached user JSON: `curavicino_user`
- Cached bookings: `cv_bookings_cache`
- Cached notifications: `cv_notifs_cache`

## Provider seeding
6 seed providers are defined in `artifacts/api-server/src/routes/providers.ts` as `SEED_PROVIDERS`. POST /api/providers/seed is idempotent (upsert on id). The mobile BookingContext calls `ProvidersService.seed()` on mount to ensure providers are always in the DB.

## Auth fallback pattern
All auth and booking API calls have a graceful offline fallback: if `err.status` is undefined (network error, not an HTTP error), the app creates a mock local user/booking instead of throwing. HTTP errors (4xx/5xx) are re-thrown so the UI can show the server's error message.

## EXPO_PUBLIC_DOMAIN is bundle-time injected (gotcha)
The mobile `EXPO_PUBLIC_DOMAIN` is set by the Expo dev/build scripts (`mobile/package.json` dev script = `$REPLIT_DEV_DOMAIN`; `scripts/build.js` for prod) and inlined by Metro at bundle time. It is NOT present in the bash tool's own env, so `node -e process.env.EXPO_PUBLIC_DOMAIN` from a shell misleadingly shows it unset. The app reaches the API at `https://<REPLIT_DEV_DOMAIN>/api` (and WS at `wss://<domain>/api/ws`).
**Why:** misreading the shell env led to a wrong "domain unset" root cause. The real persistence bug was the silent mock fallback.
**How to apply:** never fall back to `http://localhost:80/api` in mobile code (a device/web client can't resolve the server's localhost). Auth (login/register/social) now throws on failure instead of creating throwaway local mock users; screens catch and show `t("loginFailed"|"registerFailed"|"connectionError")`.
