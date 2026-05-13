---
name: Medical AI Research System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#424754'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#545c72'
  on-tertiary: '#ffffff'
  tertiary-container: '#6c748b'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  sidebar-width: 260px
  panel-gap: 16px
  container-padding: 24px
  grid-columns: '12'
  gutter: 16px
---

## Brand & Style
This design system is engineered for high-stakes medical environments where clarity, precision, and speed of interpretation are paramount. The aesthetic merges the clinical sterile nature of modern healthcare with the sophisticated, technical precision of high-end developer tools.

The visual language draws from the "Linear" and "Vercel" schools of thought: prioritizing functional density, rigorous alignment, and a restrained use of color. The emotional response should be one of "effortless authority"—a system that feels as reliable as a piece of surgical hardware while maintaining the fluidity of a modern SaaS application.

## Colors
The palette is intentionally limited to maintain focus on complex medical data.
- **Surfaces:** Use `#ffffff` for the primary work area to ensure maximum contrast for data visualization. Use `#f8fafc` for background layering and `#f1f5f9` for secondary navigation or "well" containers.
- **Accents:** Electric Blue (`#3b82f6`) is the primary action color. Indigo (`#6366f1`) is reserved for AI-generated insights or "smart" features to distinguish machine-led logic from user-led actions.
- **Typography:** Deep Slate (`#0f172a`) provides a near-black readability that is softer on the eyes for long research sessions than pure hex black.

## Typography
We utilize a rigorous type scale centered on **Inter**. 
- **Scale:** A tighter-than-average scale is used to accommodate high data density. The base body size is 14px, but the "sm" (13px) variant is the workhorse for sidebar metadata and secondary labels.
- **Data Visualization:** For numerical values, coordinates, or genomic sequences, use a monospaced font (e.g., JetBrains Mono) at 12px to ensure vertical alignment and legibility in tables.
- **Hierarchy:** Use bold weights sparingly to denote section headers; lean on color value (Slate 900 vs Slate 500) to create hierarchy before relying on font size.

## Layout & Spacing
The architecture is a **multi-pane desktop-first layout**.
- **Sidebar:** A persistent 260px sidebar on the left handles global navigation. 
- **Contextual Panes:** The central viewport uses a 12-column fluid grid. For research analysis, use a "Split View" (50/50 or 60/40) to allow for side-by-side comparison of medical imagery and AI diagnosis results.
- **Spacing Rhythm:** Based on a 4px baseline. Standard internal padding for cards and sections is 16px (4 units) or 20px (5 units) to maintain high density without feeling cramped.

## Elevation & Depth
Depth is achieved through **Tonal Layering** and **Ghost Borders** rather than aggressive shadows.
- **The Ground:** The base background is `#f8fafc`. 
- **The Surface:** Interactive elements and main content areas are raised using a `#ffffff` fill and a 1px border of `#e2e8f0`.
- **Shadows:** Use a single "Soft Drop" shadow for floating elements (modals, dropdowns): `0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)`. 
- **Backdrop:** Use a 12px backdrop blur on navigation overlays to maintain a sense of context and "Apple-inspired" material depth.

## Shapes
The shape language balances the "clinical" with the "modern."
- **Standard Radius:** All primary containers (Cards, Modals) use `rounded-xl` (1.5rem/24px) to soften the density of the data.
- **Small Elements:** Buttons and input fields use `rounded-lg` (1rem/16px) to maintain a cohesive, friendly aesthetic.
- **Borders:** Every container must have a 1px solid border. In high-density tables, use horizontal dividers only to reduce visual noise.

## Components
- **Buttons:** Primary buttons use a solid Electric Blue background with white text. Secondary buttons use a white background with a 1px border. All have a subtle 2px inner-top-light highlight to simulate a tactile "pressed" feel.
- **Data Cards:** High-density containers with a 1px border. Header areas should have a subtle bottom border (`#f1f5f9`) and 12px padding.
- **AI Insight Chips:** Pill-shaped elements using a light Indigo wash (`#e0e7ff`) with Indigo text (`#4338ca`) and a sparkle icon to denote machine-learning origins.
- **Input Fields:** Minimalist design; only the bottom border is visible or a very light 4-sided border that darkens on focus. Use Inter 14px for input text.
- **Visualizations:** High-contrast charts. Use `#3b82f6` for primary data series and `#6366f1` for comparative AI predictions. Use `#cbd5e1` (Light Slate) for grid lines and axes.
- **Status Indicators:** Small, solid-color dots (8px) paired with 11px semi-bold caps labels for "Active," "Pending," or "Error" states.