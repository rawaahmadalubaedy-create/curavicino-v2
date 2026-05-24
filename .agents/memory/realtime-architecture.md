---
name: WebSocket realtime architecture
description: How the CuraVicino real-time WS layer is structured — server, mobile client, and context wiring.
---

## Rule
The WS server lives at `/api/ws` (same HTTP server as the REST API, attached via `realtime.attach(server)` in `index.ts`). Authentication is done by passing the JWT access token as a query-string parameter: `?token=<jwt>`. The server verifies it with `verifyToken()` before accepting the upgrade.

**Why:** Expo/RN's native WebSocket implementation does not support custom HTTP headers during the upgrade handshake, so the Authorization header pattern cannot be used.

## How to apply
- Server singleton: `artifacts/api-server/src/lib/realtime.ts` — `realtime.emitToUser(userId, event)` / `emitToUsers(ids, event)`
- Mobile singleton: `artifacts/mobile/services/realtime.ts` — `realtimeClient.on(type, handler)` / `realtimeClient.connect()` / `realtimeClient.disconnect()`
- RealtimeContext (`context/RealtimeContext.tsx`) wraps the app and exposes `status` + `subscribe()` for UI components.
- BookingContext subscribes directly to `realtimeClient` (the singleton) — **not** via `useRealtime()` — because `BookingProvider` is a parent of `RealtimeProvider` in the component tree and cannot use a child context.
- AuthContext calls `realtimeClient.connect()` after every successful login/register, and `realtimeClient.disconnect()` on logout.

## Provider tree order (app/_layout.tsx)
```
AuthProvider > BookingProvider > RealtimeProvider > Stack
```
Do not move `RealtimeProvider` above `BookingProvider` — BookingContext must keep its direct singleton subscription pattern.

## Event types (both ends must stay in sync)
`connected` | `booking_update` | `provider_arrived` | `service_started` | `service_completed` | `new_message` | `new_notification` | `wallet_update` | `ping` | `pong`

## Connection status indicator
A small 8×8 dot in the Notifications screen header (`app/(tabs)/notifications.tsx`) shows green/amber/red based on `useRealtime().status`.
