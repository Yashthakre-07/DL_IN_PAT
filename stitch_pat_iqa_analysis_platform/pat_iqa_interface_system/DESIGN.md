---
name: PAT-IQA Interface System
colors:
  surface: '#f7f9fd'
  surface-dim: '#d8dade'
  surface-bright: '#f7f9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f8'
  surface-container: '#eceef2'
  surface-container-high: '#e6e8ec'
  surface-container-highest: '#e0e3e6'
  on-surface: '#181c1f'
  on-surface-variant: '#424754'
  inverse-surface: '#2d3134'
  inverse-on-surface: '#eff1f5'
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
  tertiary: '#006574'
  on-tertiary: '#ffffff'
  tertiary-container: '#008092'
  on-tertiary-container: '#f8fdff'
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
  tertiary-fixed: '#a2eeff'
  tertiary-fixed-dim: '#2fd9f4'
  on-tertiary-fixed: '#001f25'
  on-tertiary-fixed-variant: '#004e5a'
  background: '#f7f9fd'
  on-background: '#181c1f'
  surface-variant: '#e0e3e6'
typography:
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-base:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin: 32px
  sidebar_width: 260px
  container_max_width: 1440px
---

## Brand & Style

The brand personality is rooted in **Clinical Precision** and **Computational Intelligence**. It bridges the gap between high-stakes medical research and cutting-edge AI utility. The aesthetic is a synthesis of **Apple’s accessibility**, **Vercel’s technical minimalism**, and **Linear’s functional depth**.

The design system employs a **Minimalist-Glassmorphic** style. It utilizes heavy whitespace to reduce cognitive load for medical professionals, while employing subtle translucent layers to signify the "intelligence" layer of the AI. The emotional response should be one of absolute trust, calm, and high-velocity efficiency. High-polish finishes, such as micro-interactions and sub-pixel borders, distinguish the interface as a premium, medical-grade tool.

## Colors

The palette is strictly limited to a **Light Mode** execution to maintain clinical cleanliness and readability under hospital or laboratory lighting conditions.

- **Background:** The foundation is `#f5f7fb`, a cool-tinted off-white that reduces eye strain compared to pure white.
- **Electric Blue (#3b82f6):** Used for primary actions, success states, and key data points.
- **Indigo (#6366f1):** Used for AI-augmented features, deep-link navigation, and sophisticated brand moments.
- **Soft Cyan (#22d3ee):** Reserved for secondary data visualizations, active progress indicators, and "soft" highlights.
- **Neutrals:** A range of Slate grays are used for text hierarchy, ensuring high contrast for medical data while maintaining a modern feel.

## Typography

This design system relies exclusively on **Inter** to leverage its exceptional legibility in data-dense environments. 

The hierarchy is "Top-Heavy": headings are bold and slightly tracked-in to create a sense of authority and modernity. Body text is set at 15px—slightly larger than standard—to optimize for long-form research reading. Label styles utilize uppercase tracking to differentiate metadata from actionable content.

## Layout & Spacing

The layout utilizes a **Fixed-Fluid Hybrid** model. Navigation is anchored by a **sticky sidebar** on the left, providing constant access to high-level modules. The main content area follows a 12-column grid with generous 24px gutters.

The spacing rhythm is based on a **4px baseline grid**. Padding within cards and containers should be expansive (typically 24px to 32px) to prevent the "claustrophobia" often associated with legacy medical software.

## Elevation & Depth

Depth is communicated through **Ambient Shadows** and **Glassmorphism**, rather than traditional heavy borders. 

- **Surface Level 0:** The main `#f5f7fb` background.
- **Surface Level 1 (Cards):** Pure white background with a 1px solid border (`#e2e8f0`) and a soft, diffused shadow (`0 10px 15px -3px rgba(0, 0, 0, 0.05)`).
- **Surface Level 2 (Modals/Popovers):** Glassmorphic effect using `backdrop-filter: blur(12px)` and a semi-transparent white fill (`rgba(255, 255, 255, 0.8)`).
- **Navigation:** The sticky sidebar uses a very subtle right-side border or a soft occlusion shadow to separate it from the workspace without creating a hard visual break.

## Shapes

The shape language is defined by **High-Radius Geometry**. 

- **Cards:** Use `rounded-2xl` (1.5rem / 24px) to create an approachable, modern container for complex medical data.
- **Action Elements:** Buttons and interactive chips use a slightly tighter radius (12px) to maintain a sense of "tooling" and precision.
- **Selection States:** Focus rings and active states should follow the radius of the parent element exactly, maintaining a 2px offset.

## Components

### Buttons
Primary buttons use the **Electric Blue** fill with white text. Secondary buttons are ghost-style with a subtle `#e2e8f0` border that darkens on hover. Use a subtle 200ms ease-in-out transition for all hover states.

### Cards
Cards are the primary layout vehicle. Every card must have a `rounded-2xl` radius, a white background, and a subtle sub-pixel inner border to define edges against the light grey background.

### Sticky Sidebar Navigation
The sidebar is semi-transparent (`rgba(245, 247, 251, 0.9)`) with a `backdrop-filter: blur(10px)`. Navigation items should have a "pill" shaped hover state using a very light indigo tint.

### Data Inputs
Inputs use a minimal design: a simple bottom border or a very light gray stroke that transforms into an **Electric Blue** 2px stroke upon focus. Labeling should always be visible above the input in the `label-caps` typography style.

### AI Indicators
Any AI-generated insight or "Quality Assessment" (IQA) result should be highlighted with a **Soft Cyan** or **Indigo** glow or a subtle glassmorphic badge to distinguish it from manual data entry.