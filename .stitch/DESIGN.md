# Design System: Stamford Bridge Tour — Heritage Modern

## 1. Visual Theme & Atmosphere

A heritage-modern luxury lounge floating over Stamford Bridge. The full-screen stadium photograph anchors every page in Chelsea's history. Glass panels with warm gold reflections hover over the deep blue London evening. The mood is confident, restrained, prestigious — like the Chelsea boardroom meets a Mayfair private member's club.

- **Density:** Airy-medium (5/10)
- **Variance:** Asymmetric (7/10)
- **Motion:** Fluid spring-physics (6/10)

## 2. Color Palette & Roles

- **Stadium Night** (#0A0E1A) — Deepest background, overlay base, dark gradient foundation
- **Heritage Royal Blue** (#003399) — Brand wordmark, primary buttons, Chelsea identity
- **Chelsea Gold** (#D4AF37) — Single accent color for CTAs, decorative highlights, selected states, premium touches
- **Bright Azure** (#4DA3FF) — Interactive hover states, clickable links, secondary interactive elements
- **Glass Surface** (rgba(255,255,255,0.06)) — Card and panel fills, navigation bar
- **Glass Border** (rgba(255,255,255,0.08)) — Subtle pane edges on glass surfaces
- **Glass Gold Border** (rgba(212,175,55,0.15)) — Premium accent borders for selected or featured elements
- **Text Pure** (rgba(255,255,255,0.90)) — Primary headings and titles
- **Text Muted** (rgba(255,255,255,0.60)) — Body copy and descriptions
- **Text Faded** (rgba(255,255,255,0.35)) — Metadata, labels, placeholder text
- **Status Green** (#22C55E) — Confirmed, success states
- **Status Red** (#EF4444) — Cancelled, error states

## 3. Typography Rules

- **Display / Headlines:** Geist — Track-tight letter-spacing (-0.02em), weight-driven hierarchy (700/600/500). Never pure white below 48px. Hierarchy through weight and color, not just massive size.
- **Body:** Geist — 400 weight, relaxed leading (1.6), max 65 characters per line, Text Muted color
- **Mono:** JetBrains Mono — For prices, times, ticket counts, numerical data
- **Banned:** Inter (overused), generic system fonts, Times New Roman, Georgia, Garamond, Palatino

## 4. Component Stylings

- **Buttons:**
  - Primary: Glass background with gold border (1px rgba(212,175,55,0.4)), gold text. Hover: deeper gold border, subtle shadow intensify. Active: translateY(0).
  - Secondary: Ghost/outline with white border (rgba(255,255,255,0.3)), white text. Hover: border brightens.
  - Tactile feedback: -1px translateY on hover, 0 on active press. No neon outer glows. No custom mouse cursors.
  - Pill-shaped (rounded-full) for primary CTAs, subtly rounded (12px) for secondary.

- **Cards / Containers:**
  - "Gallery glass" style: backdrop-filter: blur(20px), background rgba(255,255,255,0.06)
  - 20px border radius, 1px rgba(255,255,255,0.08) border
  - Hover: gold left-border accent appears (4px gold line on left edge)
  - Selected: gold border (rgba(212,175,55,0.4)) + subtle inner glow
  - Used only when elevation communicates hierarchy. For dense lists, use border-top dividers instead.

- **Inputs / Forms:**
  - Transparent glass background, white/10 border, 12px radius
  - Label above input (text-sm, Text Muted weight 500)
  - Focus: gold ring (rgba(212,175,55,0.4), 2px)
  - Error: red text below input
  - Helper text optional, below label
  - No floating labels

- **Navigation:**
  - Glass bar: backdrop-filter: blur(16px), background rgba(255,255,255,0.06)
  - Bottom border: rgba(255,255,255,0.08)
  - Fixed height: 56px (h-14)
  - Active link: subtle gold underline or gold dot indicator
  - Hover: Text Pure from Text Muted

- **Loaders / Skeleton:**
  - Glass skeleton shimmer with gold-tinted pulse animation
  - Match exact layout dimensions of the content being loaded
  - No generic circular spinners

- **Empty States:**
  - Composed composition: subtle glass icon + Text Muted message + optional gold CTA
  - Not just "No data" text

- **Modals / Overlays:**
  - Glass background with backdrop-filter: blur(8px), dark overlay rgba(5,12,28,0.7)
  - Modal card: glass surface, 20px radius, subtle border

## 5. Layout Principles

- **Hero sections:** Full viewport using `min-h-[100dvh]` (never h-screen). Stadium background is fixed (`fixed inset-0 bg-cover`), content scrolls over it.
- **Headlines:** Left-aligned, asymmetric. Centered hero layouts banned.
- **Content width:** Max-width 1100px centered container. Generous internal padding (24-32px).
- **Grid:** CSS Grid over Flexbox math. Never use calc() percentage hacks.
- **Banned:** 3-column equal card rows. Use 2-column asymmetric zig-zag, staggered grid, or horizontal scroll.
- **Mobile (< 768px):** Single-column collapse. No exceptions. No horizontal overflow. Headlines scale via clamp().
- **Sticky sidebar:** For multi-step flows (Booking page), glass sidebar fixed on desktop, bottom bar on mobile.
- **Touch targets:** Minimum 44px for all interactive elements.
- **Typography scaling:** Headlines clamp(2rem, 5vw, 3.5rem). Body minimum 1rem/14px.

## 6. Motion & Interaction

- **Spring physics:** stiffness: 100, damping: 20 for all interactive elements. No linear easing.
- **Page load:** Glass panels stagger-reveal with cascade delays (50ms per element, opacity 0→1, translateY 20px→0).
- **Hover states:** Buttons lift (-1px) + shadow deepens. Cards get gold left-border accent. Subtle glass shimmer sweep on primary panels.
- **Scroll reveal:** Cards float upward on scroll (CSS @keyframes with opacity 0→1, translateY 30px→0, duration 0.6s).
- **Perpetual micro-interactions:** Gold accent line on active elements has slow pulse shimmer (infinite loop, 3s cycle, opacity 0.4→1). Active nav link gold dot gently pulses.
- **Performance:** Animate exclusively via transform and opacity. Never animate top, left, width, height. backdrop-filter on fixed elements only.

## 7. Anti-Patterns (Banned)

- No emojis anywhere
- No Inter font
- No pure black (#000000) — use #0A0E1A instead
- No neon glows or outer shadow effects
- No purple/blue neon aesthetic (AI tell)
- No 3-column equal card grids
- No centered hero layouts
- No scroll arrows, bouncing chevrons, "Scroll to explore" text
- No fake metrics or fabricated data — never invent statistics
- No AI copywriting clichés ("Elevate", "Seamless", "Next-Gen", "Unleash", "Revolutionize")
- No floating labels in inputs
- No h-screen — always use min-h-[100dvh]
- No generic placeholder names ("John Doe", "Acme Corp")
- No "SYSTEM // YEAR" formatting labels
- No custom mouse cursors
- No overlapping elements — every element occupies its own spatial zone
- No broken image links — use reliable CDN or local assets
