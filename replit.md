# CuraVicino

A professional bilingual (EN/IT) mobile marketplace for elderly care and home services in Italy. Connects customers with verified service providers across three categories: Elderly & Medical Care, Delivery & Shopping, and Home Services.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — start the Expo dev server (Metro bundler)
- `pnpm --filter @workspace/api-server run dev` — start the Express API server (port 8080)
- Scan the QR code in the Expo log with **Expo Go** (Android) or the **Camera app** (iOS) to run on device

## Stack

- **Framework:** Expo ~54, expo-router ~6 (file-based navigation)
- **Language:** TypeScript 5.9
- **UI:** React Native 0.81.5, `expo-image`, `expo-linear-gradient`, `expo-blur`, `@expo/vector-icons`
- **Fonts:** Inter (400/500/600/700) via `@expo-google-fonts/inter`
- **State:** React Context (AuthContext, BookingContext, LanguageContext) + AsyncStorage persistence
- **API:** Express 5 backend (currently unused in app — all data is mocked in context)
- **Workspace:** pnpm monorepo

## Where things live

```
artifacts/mobile/
├── app/                    # expo-router file-based routes
│   ├── (tabs)/             # Bottom tab screens (home, bookings, notifications, profile)
│   ├── auth/               # Login, register-type, customer-register, provider-register
│   ├── services/[category] # Category service listing + booking modal
│   ├── provider/[id]       # Premium provider profile (parallax hero, gallery, CTA bar)
│   ├── booking/[id]        # Booking detail + review submission
│   ├── tracking/[id]       # Animated live tracking screen
│   ├── support.tsx         # Support + FAQ
│   ├── complaints.tsx      # Complaint submission form
│   ├── terms.tsx           # Terms & Conditions
│   └── qr-code.tsx         # Provider QR code identity card
├── components/             # Shared UI: ProviderCard, BookingCard, StarRating, etc.
├── constants/colors.ts     # Design tokens (Italian flag palette)
├── context/                # AuthContext, BookingContext (mock data + AsyncStorage), LanguageContext
├── hooks/useColors.ts      # Color scheme hook
└── assets/images/          # icon.png, elderly_care.png, delivery.png, home_services.png
```

## Architecture decisions

- **Mock-first data**: All providers and bookings are stored in React Context + AsyncStorage. No API calls from the mobile app yet — the Express server is scaffolded for future backend work.
- **Italian flag palette**: Green `#009246`, Red `#CE2B37`, White `#FFFFFF` used consistently across all screens.
- **expo-router file routing**: All screens are files; no manual navigation stack needed.
- **expo-image over RN Image**: Used throughout for faster remote image loading and built-in caching.
- **Safe area handled per-screen**: `useSafeAreaInsets()` used directly, with `Platform.OS === "web"` fallback of `67px` top / `34px` bottom.

## Product

**For Customers:**
Book elderly care (Alzheimer, dementia, disability support), pharmacy & grocery delivery, and home services (plumbing, cleaning, gardening). Real-time booking tracking, review system, complaint filing, multilingual (EN/IT) interface.

**For Service Providers:**
Register with document verification (ID, medical certificate, criminal record), choose withdrawal preference (daily/weekly/monthly), access QR identity card, manage bookings.

**Service Fees:** Elderly & Medical Care 23% · Delivery & Shopping 25% · Home Services 22%

**Payments:** PayPal and Stripe (credit/debit card)

## User preferences

- Italian flag colors only — no other brand colors
- Bilingual EN/IT throughout — all user-facing strings go through `t()` from LanguageContext
- No emoji in UI — professional healthcare aesthetic
- Elderly-friendly: large text, high contrast, spacious touch targets

## Gotchas

- Always run the app through the Expo workflow — do not run `pnpm dev` at workspace root
- `expo-symbols` is iOS-only; tabs layout falls back to `@expo/vector-icons` Feather on Android/web
- `expo-glass-effect` / `NativeTabs` from `expo-router/unstable-native-tabs` are not stable in expo-router v6 — do not use them
- Unsplash image URLs: use `?w=900&q=85&fit=crop` for hero images, `?w=300&q=85&fit=crop&crop=face` for profile photos
- The `KeyboardProvider` (react-native-keyboard-controller) is installed but not required in _layout — do not add it back without testing on all platforms

## Pointers

- See `.agents/memory/curavicino-stack.md` for architecture decisions worth preserving across sessions
- See the `pnpm-workspace` skill for workspace structure and TypeScript setup
run = "pnpm --filter @workspace/mobile run dev"