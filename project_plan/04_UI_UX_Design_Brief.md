# DOCUMENT 04 — UI/UX Design Brief

**Overall aesthetic direction**
*Ethereal Neon-Mysticism.* Premium, mysterious, and highly modern. Deep void backgrounds paired with sharp, glowing neon gradients. It should feel like a high-end biotech interface crossed with a spiritual guide. No dusty scrolls, no papyrus fonts.

**Full color palette**
- **Background:** `#0B0C10` (Deep Void Black)
- **Surface:** `#1F2833` (Midnight Grey — used for cards/modals)
- **Primary:** `#66FCF1` (Electric Cyan — primary buttons/accents)
- **Accent:** `#B829EA` (Nebula Purple — for secondary actions/magic moments)
- **Text:** `#E0E2E4` (Starlight White)
- **Muted:** `#8B949E` (Dusty Grey — for timestamps/subtitles)
- **Border:** `#2A3644` (Subtle Line Blue — for dividers)

**Typography**
- **Heading font:** `Outfit` (Modern, geometric, punchy).
- **Body font:** `Inter` (Highly readable, clean).
- **Mono font:** `JetBrains Mono` (Used strictly for displaying exact planetary degrees and coordinates).

**Border radius style**
`16px` (Smooth, pill-like shapes for buttons, soft rounded rectangles for cards).

**Shadow and elevation style**
Instead of drop shadows, use **Glow Effects**. (e.g., Active buttons have a box-shadow of `0px 4px 24px rgba(102, 252, 241, 0.3)`).

**Dark/light mode decision**
Strictly **Dark Mode Only**. The cosmic aesthetic fails in light mode.

**Animation and motion style**
Fluid, deliberate, and smooth.
- Screen transitions are slow cross-fades (300ms).
- The SVG Chart Wheel has a continuous, extremely slow rotation (1 RPM) when the user is on the Chart tab.
- AI chat bubbles gently slide up and fade in from the bottom.

**Reference apps**
1. *Nebula:* Borrow their concise, chunked horoscope layouts (easy to skim).
2. *Co-Star:* Borrow their stark typographic contrast and unapologetic, punchy copy tone.
3. *Spotify:* Borrow their horizontal card carousels and masterful handling of deep dark-mode surfaces.

**Birth chart wheel design direction**
Minimalist geometry. The wheel consists of thin 1px `#2A3644` lines. Planetary glyphs are bright white. The center aspect lines are strictly color-coded: Trines/Sextiles in Electric Cyan, Squares/Oppositions in muted red. No chaotic background imagery inside the wheel.

**Mobile-specific patterns**
- Swipe-right from the left edge to navigate back.
- Bottom sheets (using `@gorhom/bottom-sheet`) for viewing planet details or adding a compatibility partner.
- Keyboard-avoiding view for the chat interface to keep the input sticky at the bottom.

**Accessibility requirements**
- 4.5:1 minimum contrast ratio for text.
- Screen reader `accessibilityLabel` strings on all astrological glyphs (e.g., "Sun in 15 degrees Leo").
