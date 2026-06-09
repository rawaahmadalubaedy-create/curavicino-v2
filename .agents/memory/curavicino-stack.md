---
name: CuraVicino Mobile Stack
description: Architecture decisions for the CuraVicino Expo React Native app (Italian elderly care marketplace).
---

# CuraVicino Mobile — Key Architecture Decisions

## Stack
- Expo ~54, expo-router ~6, React Native 0.81.5, TypeScript
- pnpm workspace monorepo; artifact at `artifacts/mobile`
- No backend DB — AsyncStorage for bookings, mock providers in context

## Tabs layout
- Use simple `Tabs` from expo-router with `expo-symbols` for iOS, `Feather` icons for Android/web
- Do NOT use `expo-glass-effect` or `expo-router/unstable-native-tabs` — not stable in this version
- `KeyboardProvider` from `react-native-keyboard-controller` is installed but optional in _layout; can be omitted to reduce complexity

## Fonts
- `@expo-google-fonts/inter` — Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold
- Always gate render on `fontsLoaded || fontError` before rendering children

## Images
- Use `expo-image` `<Image>` (not RN's Image) for Unsplash URLs — faster, blurhash support
- Unsplash URL pattern: `https://images.unsplash.com/photo-{id}?w=900&q=85&fit=crop`

**Why:** `expo-image` caches aggressively and handles remote URLs much better on mobile.

## Provider Profile
- Parallax hero: `Animated.ScrollView` + `scrollY.interpolate` on `translateY` + `opacity`
- Sticky CTA bar is always-visible (absolute bottom), not conditionally shown — simpler and more reliable on web
- `slide_from_right` animation on the provider/[id] Stack.Screen

## Colors
- Primary green: #009246, Red: #CE2B37, White: #FFFFFF
- `useColors()` hook in `hooks/useColors.ts` — single source of truth for all theme tokens

## i18n / LanguageContext gotcha
- `t(key)` returns the **key string itself** when a translation is missing (not `undefined`/empty).

**Why:** This makes the common `t(key) || fallback` pattern dead code — the fallback is unreachable because the key string is truthy, so a missing key renders as the literal raw key (e.g. `elderlyCarePill`) in the UI.

**How to apply:** Every user-facing key must be defined in BOTH the `en` and `it` objects in `context/LanguageContext.tsx`. Do not rely on a JS `|| fallback`; add the actual key to both languages.
