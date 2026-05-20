# DOCUMENT 02 — TRD (Technical Requirements Document)

**Frontend framework and version**
React Native with Expo (SDK 51) using TypeScript.

**Backend framework or runtime**
Node.js (v20) Edge Functions (hosted on Supabase).

**Database type and provider**
PostgreSQL (hosted on Supabase).

**Auth method**
Supabase Auth (Email/Password, Apple OAuth, Google OAuth).

**Hosting and deployment**
Supabase (Database, Edge Functions, Auth) / Expo EAS (Mobile Build, OTA Updates & App Store Submission).

**Third-party APIs**
1. **Astrology Engine API:** *Swiss Ephemeris (via self-hosted `swisseph` Node wrapper or AstronomyAPI)*. Purpose: To calculate mathematically perfect planetary degrees and house cusps. Free/Open-source wrapper chosen for cost control at scale.
2. **AI/LLM API:** *OpenAI API (gpt-4o-mini)*. Purpose: Powers the AI Astrologer. Paid. Chosen for low latency, excellent conversational context, and JSON-mode adherence.
3. **Geocoding API:** *Google Maps Geocoding API*. Purpose: Converts user city input into precise latitude, longitude, and timezone (critical for chart accuracy). Paid (generous free tier).

**Key libraries**
- `zustand` (Lightweight, fast global state management).
- `@react-navigation/native` (Standard mobile routing).
- `react-native-reanimated` & `react-native-gesture-handler` (For premium, fluid 60fps animations).
- `react-native-svg` (For drawing the intricate birth chart wheel).
- `date-fns` & `date-fns-tz` (For rigorous timezone math).
- `axios` (For robust API fetching).

**All environment variables needed**
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_GEOCODING_API_KEY`

**Hard constraints**
- Mobile-first only (iOS & Android). No web app view.
- Must remain entirely within free tiers of Supabase and Google Geocoding for MVP launch.
- Offline graceful degradation required (must show cached horoscope if no network).

**Folder structure**
```text
/astra-chat
  /assets
    /fonts
    /images
  /src
    /api
    /components
      /astrology     # ChartWheel, PlanetCard, AspectLines
      /chat          # ChatBubble, ChatInput
      /common        # PrimaryButton, GlassmorphismCard, ScreenWrapper
    /hooks           # useAuth, useChart, useChat
    /navigation      # RootNavigator, TabNavigator
    /screens
      /Auth
      /Onboarding
      /Tabs          # Home, Chart, Compatibility, Chat
    /store           # userStore.ts, chatStore.ts
    /theme           # colors.ts, typography.ts, spacing.ts
    /utils           # astroMath.ts, timezones.ts
  /supabase
    /functions       # generate-chart, chat-astrologer, daily-cron
    /migrations      # init_schema.sql
  app.json
  package.json
```
