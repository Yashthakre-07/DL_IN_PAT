# DOCUMENT 03 — App Flow (Navigation & User Journey Map)

**Full list of screens**
1. **Splash Screen:** Branding and initial asset loading.
2. **Login/Signup:** Gateway for Email or OAuth authentication.
3. **Onboarding:** Multi-step wizard collecting Name, DOB, Time, and Location.
4. **Home (Tab):** Daily horoscope, current moon phase, and transit highlights.
5. **Chart (Tab):** Interactive SVG birth chart wheel and list of placements.
6. **Compatibility (Tab):** Synastry partner selector and relationship score reports.
7. **Chat (Tab):** Conversational UI with Astra (the AI Astrologer).
8. **Settings (Modal):** Profile management, notifications, and data deletion.

**Navigation type**
Bottom Tab Navigation (Home, Chart, Compatibility, Chat) wrapped in a Native Stack Navigator (to handle Auth, Onboarding, and full-screen Modals).

**First screen experience**
A deep, star-field animation that subtly pans. The "AstraChat" logo glows into view (fade-in over 1.5s), transitioning smoothly via an upward slide into the sleek login surface. 

**Complete Auth Flow**
Splash -> Signup Screen -> Enter Email/Password -> Redirect to Onboarding Flow -> Finish Onboarding -> Reroute to Home Tab.

**Onboarding Flow (Birth data collection)**
- *Step 1:* "What should we call you?" (Name input) -> Next
- *Step 2:* "When did you arrive in the universe?" (Date picker) -> Next
- *Step 3:* "What time exactly?" (Time picker + 'I don't know' toggle defaulting to 12:00 PM) -> Next
- *Step 4:* "Where were you born?" (City search with autocomplete). User selects -> Triggers Geocoding + Chart Generation -> Transitions to Home.

**Core Journey 1: Daily Horoscope**
User opens app -> Bypasses auth directly to Home Tab -> Sees greeting ("Good morning, Leo Sun") -> Reads the 3 distinct cards (Mood, Love, Career) -> Swipes horizontally to see tomorrow's preview.

**Core Journey 2: Birth Chart Generation**
User taps 'Chart' tab -> App renders the intricate SVG wheel at the top -> User scrolls down to see a list of placements (e.g., "Moon in Taurus - 4th House") -> User taps a placement -> A bottom sheet slides up explaining what emotional security means for a Taurus Moon.

**Core Journey 3: Compatibility Check**
User taps 'Compatibility' -> Taps glowing "Add Partner" button -> Enters partner's Name, DOB, Time, Location -> Taps "Analyze Stars" -> Brief cinematic loading state -> Screen displays an overall score (e.g., 85%) and sub-scores (Communication, Intimacy, Values).

**Core Journey 4: AI Astrologer Chat**
User taps 'Chat' tab -> Sees empty state with 3 suggested chips (e.g., "How does the current moon affect me?") -> User types custom question -> Backend injects user's natal JSON into the system prompt -> AI streams back a personalized, astrology-accurate response.

**Empty states**
- *Compatibility:* Ghosted outline of two planets. "No connections yet. Add a partner, friend, or crush to see your cosmic alignment."
- *Chat:* "I am Astra. Ask me about your career, love life, or what the stars have in store for you today."

**Error states**
- *Network Error:* "The stars are currently unreachable. Please check your connection."
- *Invalid Birth Data:* "We couldn't pinpoint that location. Please try a closer major city."
- *AI Timeout:* "Astra is deep in meditation. Try your question again in a moment."

**All redirect logic**
- If `!user` -> Auth Stack.
- If `user` AND `!birth_chart` -> Onboarding Stack.
- If `user` AND `birth_chart` -> Main Tab Navigator.
