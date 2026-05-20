DOCUMENT 06 — IMPLEMENTATION PLAN

Project: Astra Chat / Nebula-style astrology app
Build order: follow this phase sequence exactly. Do not jump ahead. Each phase should be fully complete and verified before the next one starts.

Phase 1: Project Setup
Goal

Create a clean, production-ready mobile app foundation with Expo, TypeScript, Supabase, absolute imports, linting, formatting, and a stable environment setup so development stays consistent from day one.

Exact setup steps

Create the Expo app:

npx create-expo-app astra-chat -t expo-template-blank-typescript

Move into the project:

cd astra-chat

Install the core dependencies:

npm install @supabase/supabase-js zustand
npm install react-native-svg react-native-reanimated react-native-safe-area-context
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npm install react-native-screens react-native-gesture-handler

Install development dependencies:

npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier
Configure absolute imports:
Add a tsconfig.json path alias like @/*.
Use one clean alias for the whole codebase so imports stay readable.
Set up ESLint:
Enforce TypeScript-safe imports.
Prevent unused variables.
Keep consistent hook usage.
Disallow messy or inconsistent patterns.
Set up Prettier:
Standard line width and formatting rules.
Auto-format on save.
Keep consistent spacing, quotes, and indentation.
Configure app folder structure:
Separate screens, components, services, utils, hooks, stores, and types.
Keep the architecture simple enough for an AI coding agent to follow without confusion.
Initialize Supabase:
Create the Supabase project.
Save the project URL and anon key in .env.
Prepare local development and production environment variables.
Add environment variable handling:
Use a single config file for reading env values.
Never hardcode secrets in UI files.
Keep API keys isolated from presentation code.
Set up app navigation skeleton:
Add placeholder routes for Auth, Onboarding, Home, Chart, Compatibility, and Chat.
Make sure the app boots into a predictable routing flow.
Configure the simulator/device workflow:
Confirm the app runs on iOS simulator and Android emulator.
Verify hot reload works.
Verify the Metro bundler starts without errors.
Recommended folder structure at this stage
astra-chat/
├── app/ or src/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── services/
│   ├── store/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── constants/
│   └── config/
├── assets/
├── .env
├── .env.example
├── app.json
├── tsconfig.json
├── eslint.config.js
├── prettier.config.js
└── package.json
Done criteria
The app compiles successfully on simulator/device.
TypeScript is working with no critical config issues.
Supabase client initialization works from environment variables.
Absolute imports resolve correctly.
ESLint and Prettier run without breaking the project.
The folder structure is stable and ready for feature development.


Phase 2: Database & Schema
Goal

Create the full database structure, security model, indexes, and seed data so the app has a reliable backend foundation before any UI logic depends on it.

Exact setup steps
Create all required tables:
users
birth_charts
horoscopes
compatibility_reports
chat_sessions
chat_messages
Define primary keys and foreign keys:
Every row should be tied to an authenticated user where appropriate.
Relationship integrity must be enforced at the database level.
Add timestamps and audit fields:
created_at
updated_at
any other lifecycle fields needed for tracking changes.
Add RLS policies:
Users can only read and edit their own records.
Public rows should be readable only when explicitly intended, such as cached horoscope content.
No sensitive user birth data should be exposed broadly.
Add indexes:
Index by user_id.
Index by date for horoscope cache lookups.
Index by session_id and chart_id where needed.
Add any composite indexes that improve feed and compatibility queries.
Insert seed data:
All 12 zodiac signs.
A few example horoscope templates.
One test user only for local validation.
Optional sample chart data for development preview.
Create migration files:
Keep the schema versioned.
Avoid manual database edits outside migrations.
Use repeatable migration naming.
Verify security behavior:
Unauthenticated access must fail.
Cross-user access must fail.
Public cached reads should work only where intended.
Validate data shape:
Ensure each table stores exactly what the app needs.
Avoid unnecessary duplication.
Keep JSON fields only where structured relational fields are not enough.
Done criteria
All six tables exist and match the schema spec.
RLS is active and tested.
Unauthorized reads and writes are blocked.
Seed data is available for development.
Query paths for charts, horoscopes, compatibility, and chat are supported by indexes.
Migrations can be replayed cleanly from scratch.
Phase 3: Auth Flow & Onboarding
Goal

Build the identity and profile setup system so a new user can sign up, log in, enter birth details, and save a complete profile before seeing the main app.

Exact setup steps
Install and configure auth dependencies:
@supabase/supabase-js
zustand for session/profile state
navigation libraries for routing between auth and app areas
Build the authentication screens:
Login
Signup
Forgot password if included in scope
Simple error handling for invalid credentials
Implement session handling:
Persist auth state across app restarts.
Restore session on launch.
Redirect based on whether a valid session exists.
Build the onboarding flow as a 4-step process:
Step 1: basic identity
Step 2: birth date and birth time
Step 3: birth location search
Step 4: preference confirmation and final save
Integrate geocoding:
Use Google Geocoding API for city search.
Convert typed locations into coordinates.
Allow the user to confirm the correct city before saving.
Validate birth data:
Birth date must be valid.
Birth time should be captured in a consistent format.
Location should resolve to coordinates before onboarding can finish.
Prevent incomplete saves.
Save profile data to Supabase:
Store the user record in users.
Save all onboarding fields in structured columns.
Make sure the profile can be resumed if onboarding is interrupted.
Route the user after onboarding:
Save the profile.
Trigger chart generation later in the flow.
Land the user on an empty but functional Home screen.
Add recovery behavior:
If onboarding is partially complete, resume from the last unfinished step.
If network fails, preserve form state locally.
Done criteria
A user can sign up and log in successfully.
A user can complete all onboarding steps.
Birth city search works through geocoding.
Birth data is saved correctly in Supabase users.
After onboarding, the user lands on the app home area with no dead ends.
Session state survives app relaunch.
Phase 4: Birth Chart Engine (Backend)
Goal

Create the calculation backend that transforms birth data into a structured natal chart object that can power horoscope insights, visualization, compatibility scoring, and AI chat.

Exact setup steps
Create a Supabase Edge Function for chart generation:
Keep logic server-side.
Do not calculate final astrology data directly in the UI.
Use a secure backend entrypoint for repeatable chart creation.
Choose calculation source:
Use astronomy-engine or a reliable astrology API/library.
Prefer a stable and maintainable source over a custom astronomy implementation.
Map user birth data into calculation input:
Birth date
Birth time
Birth location coordinates
Timezone handling
Calculate the full chart object:
Sun
Moon
Mercury
Venus
Mars
Jupiter
Saturn
Uranus
Neptune
Pluto
Ascendant
Houses
Degrees
Sign placements
Standardize output JSON:
Keep a clean schema for chart display and downstream AI use.
Include normalized planet positions, house positions, and aspect data.
Add a raw response field for debugging if needed.
Save chart results in birth_charts:
Store the structured output.
Link it to the user.
Mark generation timestamp and version used.
Handle timezone and coordinate edge cases:
Convert local birth time to UTC accurately.
Handle unknown location resolution failures.
Reject invalid or incomplete profile data.
Add retry/error behavior:
If the first calculation attempt fails, allow retry.
Log the error in a controlled way.
Avoid silent failure.
Keep the engine deterministic:
The same birth inputs must always produce the same chart output.
Version any future calculation changes so old results remain interpretable.
Done criteria
The app can trigger chart generation after onboarding.
A complete and structured birth_charts row is created.
The chart contains all major placements required by the app.
Invalid data does not generate broken charts.
The backend response is stable and reusable by UI, compatibility, and chat features.
Phase 5: Chart Visualization (Frontend)
Goal

Render the natal chart in a visually beautiful and mathematically correct wheel layout that looks premium on all mobile screen sizes.

Exact setup steps
Install chart rendering dependencies:
react-native-svg
any lightweight helpers needed for geometry or layout math
Build the ChartWheel component:
Convert 0–360 degree values into SVG coordinates.
Map zodiac signs to 30-degree segments.
Position planets accurately by longitude.
Draw house divisions clearly.
Render visual layers:
Outer zodiac ring
Inner house ring
Planet markers/glyphs
Aspect lines between planets
Label text for signs, houses, and selected placements
Build responsive scaling:
Support small phones and larger devices.
Keep the wheel centered and readable.
Avoid clipping glyphs at the edges.
Style the wheel for readability:
Use clear contrast.
Keep planet glyphs legible.
Make aspect lines distinct but not cluttered.
Add interaction:
Tap a planet to view its details.
Tap a house to inspect house meaning.
Allow zoom or expansion if needed.
Keep interactions lightweight and fast.
Pull data from raw_data:
The chart should render from the saved JSON payload.
Avoid recalculating chart positions in the UI.
Add loading and fallback states:
Skeleton or spinner while data loads.
Empty state when the user has no chart yet.
Error state if the chart fetch fails.
Confirm visual fidelity:
The geometry should match the backend data.
Aspect line positions should correspond to real angular relationships.
Text should not overlap excessively.
Done criteria
The Chart tab renders a complete natal chart wheel.
Planet positions and aspect lines are visually correct.
The wheel scales properly across screen sizes.
The component uses backend chart JSON rather than hardcoded demo values.
The UI feels polished and premium, not like a prototype.
Phase 6: Horoscope Feed
Goal

Create a personalized daily horoscope system that feels fresh every day and is cached efficiently so users can open the app quickly without waiting for generation.

Exact setup steps
Build the Home tab UI:
Add a hero section with today’s horoscope.
Add summary cards for mood, love, career, and energy.
Keep the layout clean and mobile-friendly.
Use glassmorphism carefully, without hurting readability.
Generate horoscope content server-side:
Use a Supabase cron-triggered Edge Function.
Run at midnight or a configured time.
Generate one row per zodiac sign for the current date.
Use AI to generate daily content:
Produce short, useful, emotionally resonant horoscope copy.
Keep tone consistent with the app’s brand voice.
Avoid vague filler text.
Cache the result in horoscopes:
Store by sign and date.
Prevent duplicate generations for the same day.
Keep old rows available for historical review if desired.
Fetch the correct row for the user:
Match the user’s Sun sign.
Read the row for today’s date.
Fall back gracefully if the daily row is missing.
Add personalization logic:
Use the user’s chart placements where appropriate.
Optionally adjust tone using moon sign, rising sign, or house emphasis.
Keep the final result understandable and not overly technical.
Build feed states:
Loading state
Empty state
Error state
No-data fallback with retry
Prevent duplicated content:
Ensure the same daily horoscope is not regenerated multiple times by accident.
Use idempotent creation logic.
Done criteria
Every day’s horoscope exists in cached form for all 12 signs.
The Home screen fetches the correct row for the user’s Sun sign.
The display feels immediate and polished.
Failures in generation do not break the user experience.
The feed is ready for future expansion into weekly or monthly content.
Phase 7: Compatibility Engine
Goal

Build a relationship comparison feature that can compare two birth charts, score compatibility, and save reports for later review.

Exact setup steps
Build the Compatibility tab:
Show existing compatibility reports.
Add a clear primary action to create a new one.
Make report history easy to revisit.
Build the “Add Partner” bottom sheet:
Search by name if stored profiles exist.
Allow manual partner birth data entry if not.
Validate all fields before comparison starts.
Create synastry logic in a backend function:
Compare key placements between two charts.
Detect major harmonious and challenging aspects.
Weigh Sun, Moon, Venus, Mars, and Ascendant heavily.
Build a scoring system:
Convert aspect patterns into a 0–100 compatibility score.
Keep the score explainable.
Support category-level breakdowns such as emotional, communication, romance, and long-term potential.
Save reports in compatibility_reports:
Store both chart references or partner birth data.
Store the score, summary, and detailed breakdown.
Allow the report to be reopened later.
Add human-readable interpretation:
Write concise explanations of major positive and negative aspects.
Avoid dry technical astrology language unless the user taps for detail.
Handle repeated comparisons:
Prevent duplicate reports unless the user intentionally creates a new version.
Allow refreshing with updated partner data.
Build useful UI output:
Show score prominently.
Show a summary card.
Show major harmonious aspects.
Show caution areas and interpretation.
Done criteria
A user can add a partner and run a compatibility report.
The report returns a saved score and readable summary.
The app stores the result in compatibility_reports.
The compatibility view is understandable without needing astrology expertise.
The report can be reopened later from history.
Phase 8: AI Astrologer Chat
Goal

Create a responsive AI chat experience that uses the user’s actual chart data and feels like a premium astrology assistant rather than a generic chatbot.

Exact setup steps
Build the chat UI:
iMessage-style threaded interface.
Dark mode by default.
Inverted message colors for readability and style.
Typing indicator and streaming responses.
Create the chat session model:
One session can contain multiple messages.
Save conversations in chat_sessions.
Save each individual message in chat_messages.
Create the backend chat function:
Use an Edge Function such as chat-astrologer.
Accept the user message plus chart context.
Inject system instructions that define tone, behavior, and limits.
Add context injection:
Include the user’s Sun sign, Moon sign, Rising sign, and major placements.
Include recent horoscope and compatibility context when relevant.
Keep the AI grounded in real app data, not generic astrology guesses.
Stream responses:
Return text progressively.
Make the UI feel immediate.
Prevent long blank waits.
Add chat history:
Reopen previous sessions.
Continue an existing thread naturally.
Preserve message order and timestamps.
Add safety and quality control:
Prevent hallucinated chart facts by always passing real chart data.
Prevent repetitive, vague answers.
Encourage actionable interpretations rather than dramatic fear-based claims.
Handle timeout and retry behavior:
Show retry if the model stalls.
Preserve user input on failure.
Keep the chat usable even during temporary API issues.
Done criteria
The user can send messages and receive streamed replies.
The AI references real chart placements from the user profile.
Conversations are saved and reload correctly.
The chat feels conversational, premium, and astrology-aware.
Failures do not erase the conversation state.
Phase 9: UI Polish
Goal

Turn the app from functional to premium by adding motion, refined spacing, loading states, visual hierarchy, and aesthetic consistency.

Exact setup steps
Add react-native-reanimated transitions:
Screen fades
Smooth tab transitions
Wheel animation
Subtle button feedback
Loading shimmer or pulse effects
Add skeleton loaders:
Home feed skeleton
Chart loading state
Chat loading state
Compatibility loading state
Add empty states:
No chart yet
No compatibility report yet
No chat messages yet
No horoscope available yet
Add visual consistency:
Apply exact hex colors from the design brief.
Use the same spacing rhythm across all screens.
Keep card corners, shadows, and typography consistent.
Add micro-interactions:
Soft press states
Smooth opening bottom sheets
Animated chart highlights
Subtle message arrival effects
Add premium polish details:
Better icon treatment
Consistent dividers
Fine-tuned padding
Better line height and text spacing
Reduced visual noise
Test the full dark-mode look:
Ensure contrast is strong enough.
Prevent washed-out cards.
Keep text readable on all devices.
Done criteria
The app feels polished and premium.
Animations are smooth and not distracting.
Loading and empty states are visually intentional.
The design matches the exact visual direction from the design brief.
The app no longer feels like a rough prototype.
Phase 10: Testing & Edge Cases
Goal

Break the app deliberately in controlled ways so the final product is stable, reliable, and resilient under real-world usage.

Exact setup steps
Test auth edge cases:
Incorrect passwords
Duplicate signup attempts
Session expiration
Logout and re-login behavior
Test onboarding edge cases:
Invalid birth date
Invalid birth time format
City search returning no result
Partial onboarding save recovery
Test timezone behavior:
Aggressive timezone shifts
Users traveling across time zones
Correct chart interpretation after timezone-sensitive input
Test network failures:
Airplane mode
Slow internet
API rate limits
Supabase downtime fallback messages
Test chart engine failures:
Missing coordinates
Unavailable function response
Invalid saved birth data
Test horoscope feed failures:
Missing daily row
Duplicate generation attempts
Cache misses
Test compatibility failures:
Missing partner birth info
Incomplete partner profile
Repeat comparison conflicts
Test chat failures:
Model timeout
Streaming interruption
Lost conversation state
Reconnect recovery
Test UI resilience:
Small screen devices
Large screen devices
Keyboard overlap
Bottom sheet clipping
Text overflow
Add logging and debugging support:
Keep useful logs in development.
Avoid exposing private user data in logs.
Make failures easy to reproduce.
Done criteria
Invalid inputs do not crash the app.
Offline mode and network failures show clear states.
Timezone handling is tested and stable.
The app remains usable across common failure modes.
Major flows have been manually and repeatedly verified.
Phase 11: Deployment
Goal

Prepare the app for release by configuring production settings, building distributable binaries, and verifying the deployment process end to end.

Exact setup steps
Configure app.json:
App name
Bundle identifier
Version
Icon
Splash screen
Orientation
Runtime settings
Verify environment variables:
Production Supabase URL
Production anon key
Geocoding API key
OpenAI or other AI API key
Any build-related secrets
Confirm production-safe behavior:
No debug-only data in release builds.
No console leakage of secrets.
No dev-only sample users or seed assumptions.

Create release builds:

eas build -p ios --profile production
eas build -p android --profile production
Validate binary outputs:
Confirm IPA builds successfully.
Confirm AAB or APK builds successfully.
Make sure app icons and splash screens appear correctly.
Test installation:
Install on TestFlight or internal testing track.
Check auth, onboarding, chart load, horoscope feed, compatibility, and chat in production mode.
Prepare submission assets:
App description
Screenshots
Privacy policy notes
Store metadata
Release notes
Final pre-launch audit:
No broken env vars
No missing routes
No console errors
No uncaught exceptions
No incomplete screen flows
Done criteria
Production builds are generated successfully.
The app installs and runs in TestFlight/internal testing.
All primary flows work in release mode.
The build is ready for submission or internal rollout.
Production configuration is clean and documented.
Done Criteria for the Entire Project

The project is complete only when all of the following are true:

A user can sign up, complete onboarding, and save their birth data.
The app generates and stores a natal chart correctly.
The Home screen shows a cached daily horoscope for the user’s Sun sign.
The Chart screen renders an accurate, polished wheel visualization.
The Compatibility feature can compare two charts and save reports.
The AI astrologer can chat using the user’s real chart context.
All data is protected by proper database security rules.
The app handles invalid inputs, offline states, and API failures gracefully.
The UI looks cohesive, premium, and consistent across screens.
The app builds successfully for production and can be tested externally.
MASTER AGENT PROMPT

Copy and paste this into any coding agent session:

You are building Astra Chat, a Nebula-style mobile astrology app. Use the implementation plan below as the single source of truth. Do not deviate from the stack, architecture, feature scope, phase order, or data model. Do not add unrelated features. Build the project in exact phase order and do not begin a later phase until the current one is fully complete and verified.

STACK:
- Expo React Native + TypeScript
- Supabase (auth, database, edge functions, RLS)
- Zustand for client state
- react-native-svg for chart rendering
- react-native-reanimated for motion
- Google Geocoding API for location lookup
- AI API for astrologer chat
- Mobile-first design only

PHASE ORDER:
1. Project Setup
2. Database & Schema
3. Auth Flow & Onboarding
4. Birth Chart Engine (Backend)
5. Chart Visualization (Frontend)
6. Horoscope Feed
7. Compatibility Engine
8. AI Astrologer Chat
9. UI Polish
10. Testing & Edge Cases
11. Deployment

NON-NEGOTIABLE RULES:
- Follow the database schema and RLS rules exactly.
- Keep all sensitive user birth data private.
- Generate charts on the backend, not in the UI.
- Cache horoscopes by sign and date.
- Save compatibility reports and chat history.
- The AI astrologer must use real chart context from the app data.
- All screens must have loading, empty, and error states.
- Use the exact design direction and mobile UX patterns defined in the spec.
- Use production-ready code only.
- Prefer clean, modular, maintainable code over clever shortcuts.
- If something is not in the spec, do not invent it.

DELIVERY EXPECTATIONS:
- Build complete, working features.
- Keep the folder structure clean and scalable.
- Write code that is easy to extend, test, and maintain.
- Ensure all flows work on mobile simulators and real devices.
- Verify each phase is done before moving to the next.

PRIMARY OBJECTIVE:
Ship a polished astrology app with onboarding, natal chart generation, horosc