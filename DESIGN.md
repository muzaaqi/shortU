# DESIGN.md — Muzone URL Shortener Design System

> This is the design system source of truth.
> Every UI component must use only the tokens defined here.
> Never use hardcoded hex values, font sizes, or spacing in component files.
> Always reference CSS variables (`var(--token-name)`).
> Before touching any component, read this file in full.

---

## Philosophy

Muzone is a utility tool for people who share links — developers, creators, marketers. The design takes a single deliberate stance: **warm-light canvas with high-contrast ink**, borrowed from the Clay.com school of cream-on-dark rather than the cold-gray SaaS default. Where Clay uses 3D claymation to add personality, Muzone uses **monospace terminal aesthetics** as its personality layer — the output slug field is the brand moment.

Light mode is the primary experience. Dark mode is supported.

The interface has two emotional registers:
1. **Neutral utility** — inputs, nav, cards, dashboard rows
2. **Result moment** — the shortened URL + QR output, styled like a terminal readout. This is the only place the design shows off.

---

## Colors

### Canvas & Surface
| Token | Hex | Usage |
|---|---|---|
| `{colors.canvas}` | `#fafaf7` | Default page background — warm off-white, not pure white |
| `{colors.surface-soft}` | `#f4f3ee` | Section bands, footer background |
| `{colors.surface-card}` | `#eeecea` | Cards, input backgrounds, dashboard rows |
| `{colors.surface-strong}` | `#e5e3de` | Hover states on cards, emphasized separators |
| `{colors.surface-dark}` | `#0f1117` | Dark accent surfaces — interstitial page, result band |
| `{colors.surface-dark-elevated}` | `#1a1d27` | Elevated surfaces within dark context |
| `{colors.hairline}` | `#dedcda` | 1px borders on cards, inputs, dividers |

### Brand & Accent
| Token | Hex | Usage |
|---|---|---|
| `{colors.primary}` | `#0f1117` | Primary CTA buttons, h1/h2 ink |
| `{colors.accent}` | `#5c6bc0` | Focus rings, links, active states — muted indigo |
| `{colors.accent-hover}` | `#4a5ab8` | Hover on accent elements |
| `{colors.accent-subtle}` | `#5c6bc014` | Accent tint background for result field |
| `{colors.brand-mint}` | `#4db6a8` | Success states, "copied" indicator, QR badge |
| `{colors.brand-amber}` | `#f0a500` | Ad mode active — warning/attention without alarm |
| `{colors.brand-amber-subtle}` | `#f0a50014` | Ad badge background |

### Text
| Token | Hex | Usage |
|---|---|---|
| `{colors.ink}` | `#0f1117` | Headlines, primary text |
| `{colors.body-strong}` | `#1a1d27` | Emphasized body, lead paragraphs |
| `{colors.body}` | `#3a3d4a` | Default running text |
| `{colors.muted}` | `#6a6d7a` | Labels, descriptions, secondary info |
| `{colors.muted-soft}` | `#9a9daa` | Placeholders, captions, fine print |
| `{colors.on-primary}` | `#ffffff` | Text on dark CTA buttons |
| `{colors.on-dark}` | `#f4f3ee` | Text on dark surfaces |
| `{colors.on-dark-muted}` | `#9a9daa` | Secondary text on dark surfaces |

### Semantic
| Token | Hex | Usage |
|---|---|---|
| `{colors.success}` | `#4db6a8` | Copied to clipboard, link created — matches brand-mint |
| `{colors.success-subtle}` | `#4db6a814` | Success state background |
| `{colors.warning}` | `#f0a500` | Ad mode active — matches brand-amber |
| `{colors.warning-subtle}` | `#f0a50014` | Ad badge background |
| `{colors.error}` | `#e53935` | Validation errors, slug collision |
| `{colors.error-subtle}` | `#e5393514` | Error input background tint |

---

## Typography

### Font Families

- **Display / Headings:** `"Inter"` — weight 500–600, letter-spacing -0.03em at display sizes
- **Body / UI:** `"Inter"` — weight 400–500, standard letter-spacing
- **Monospace (slugs, URLs, result output):** `"JetBrains Mono"` — weight 400–500

Load via Fontsource (`@fontsource/inter`, `@fontsource/jetbrains-mono`) or Google Fonts.

The display-vs-body split: Inter at weight 500 with negative letter-spacing handles headlines with enough character to feel considered without being precious. JetBrains Mono is reserved strictly for the result moment — slug output, URL display, QR caption. Mixing mono into nav or body copy is a system violation.

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-lg}` | 48px | 500 | 1.05 | -0.03em | Homepage h1 |
| `{typography.display-md}` | 36px | 500 | 1.1 | -0.025em | Section heads |
| `{typography.display-sm}` | 28px | 500 | 1.15 | -0.02em | Sub-section heads, card titles |
| `{typography.title-lg}` | 22px | 600 | 1.3 | -0.01em | Dashboard section titles |
| `{typography.title-md}` | 18px | 600 | 1.4 | 0 | Card titles, form labels (large) |
| `{typography.title-sm}` | 15px | 600 | 1.4 | 0 | Small card titles, table headers |
| `{typography.body-md}` | 16px | 400 | 1.6 | 0 | Default running text |
| `{typography.body-sm}` | 14px | 400 | 1.55 | 0 | Dashboard row text, footer body |
| `{typography.caption}` | 13px | 500 | 1.4 | 0 | Badge labels, helper text |
| `{typography.caption-uppercase}` | 11px | 600 | 1.4 | 0.08em | Section labels, "AD MODE" badge |
| `{typography.button}` | 14px | 600 | 1.0 | 0 | Button labels |
| `{typography.nav-link}` | 14px | 500 | 1.4 | 0 | Top-nav items |
| `{typography.mono-lg}` | 18px | 500 | 1.4 | 0 | Slug output in result field |
| `{typography.mono-md}` | 14px | 400 | 1.5 | 0 | URL display in dashboard rows |
| `{typography.mono-sm}` | 12px | 400 | 1.4 | 0 | QR caption, slug badge |

---

## Spacing

Base unit: 4px.

| Token | Value | Use |
|---|---|---|
| `{spacing.xxs}` | 4px | Icon padding, tight gaps |
| `{spacing.xs}` | 8px | Badge padding, inline gaps |
| `{spacing.sm}` | 12px | Input padding (vertical), button padding (vertical) |
| `{spacing.md}` | 16px | Default component padding |
| `{spacing.lg}` | 24px | Card internal padding, row padding |
| `{spacing.xl}` | 32px | Large card padding, section inner |
| `{spacing.xxl}` | 48px | Section top/bottom padding (mobile) |
| `{spacing.section}` | 80px | Major section bands (desktop) |

---

## Border Radius

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Small badges, tag pills tight |
| `{rounded.sm}` | 8px | Dropdown items, small inputs |
| `{rounded.md}` | 10px | Standard inputs, buttons |
| `{rounded.lg}` | 14px | Cards, dashboard rows |
| `{rounded.xl}` | 20px | Feature cards, result band, QR preview |
| `{rounded.pill}` | 9999px | Badge pills, toggles, copy button |

---

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Page background bands, nav |
| Hairline | 1px `{colors.hairline}` border | Inputs, dashboard rows, cards |
| Soft raise | `box-shadow: 0 1px 3px rgba(15,17,23,0.07)` | Cards on hover |
| Elevated | `box-shadow: 0 4px 12px rgba(15,17,23,0.10)` | QR preview, result band |
| Dark surface | `{colors.surface-dark}` fill, no shadow | Result output field, interstitial page |

Depth comes from warm canvas vs. card surface contrast, and from the dark result band against the light page — not from heavy shadows.

---

## Components

### Top Navigation

**`top-nav`** — Warm canvas nav bar pinned to top. 60px tall, `{colors.canvas}` background, 1px `{colors.hairline}` border on bottom. Logo + wordmark at left. Right cluster: "Sign in" (text link) + "Get started" `{component.button-primary}`. Menu items in `{typography.nav-link}`.

### Buttons

**`button-primary`** — Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button}`, padding 10px × 18px, height 40px, rounded `{rounded.md}`.

**`button-secondary`** — Background `{colors.canvas}`, text `{colors.ink}`, 1px `{colors.hairline}` border, same shape as primary.

**`button-ghost`** — Transparent background, `{colors.muted}` text. Used for destructive or low-priority actions (delete link).

**`button-accent`** — Background `{colors.accent}`, text white. Used exclusively for the "Copy" action in the result state.

**`button-icon`** — Square icon button. 36×36px, rounded `{rounded.sm}`, background transparent, border `{colors.hairline}`. Used for copy, download, delete in dashboard rows.

**`text-link`** — Inline `{colors.accent}` with underline on hover.

### Inputs & Forms

**`text-input`** — Background `{colors.surface-card}`, text `{colors.ink}`, placeholder `{colors.muted-soft}`, type `{typography.body-md}`, rounded `{rounded.md}`, padding 10px × 14px, height 44px, 1px `{colors.hairline}` border. On focus: border becomes `{colors.accent}`, `box-shadow: 0 0 0 3px {colors.accent-subtle}`.

**`text-input-error`** — Same as text-input with `{colors.error}` border and `{colors.error-subtle}` background tint.

**`text-input-mono`** — Same as text-input but font is `{typography.mono-md}`. Used for the slug input field.

**`form-label`** — `{typography.title-sm}`, `{colors.ink}`, margin-bottom `{spacing.xs}`.

**`helper-text`** — `{typography.caption}`, `{colors.muted}`. Slug format hint, character count.

**`helper-text-error`** — `{typography.caption}`, `{colors.error}`.

### Result Band (Signature Element)

**`result-band`** — The primary brand moment. Shown after a link is created.

- Background: `{colors.surface-dark}`
- Rounded: `{rounded.xl}`
- Padding: `{spacing.xl}`
- Elevation: elevated shadow
- Slug output: `{typography.mono-lg}`, `{colors.on-dark}`, left-border 3px `{colors.accent}`, background `{colors.accent-subtle}`
- Original URL: `{typography.mono-md}`, `{colors.on-dark-muted}`, truncated with ellipsis
- "Copy" button: `{component.button-accent}`, pill shape
- QR preview: inline, 120×120px, white background, rounded `{rounded.sm}`

This is the one moment of visual personality in the app. Everything else is warm utility.

### Cards

**`link-card`** — Dashboard row card. Background `{colors.surface-card}`, 1px `{colors.hairline}` border, rounded `{rounded.lg}`, padding `{spacing.md}` × `{spacing.lg}`. On hover: background `{colors.surface-strong}`, soft-raise shadow. Contains: slug (mono), original URL (truncated mono), click count, ad badge, action buttons.

**`qr-preview-card`** — QR code display. White background (always — for QR scan contrast), rounded `{rounded.sm}`, 1px `{colors.hairline}` border, padding `{spacing.sm}`. Size 160×160px in dashboard, 120×120px inline in result band.

**`feature-card`** — Used on landing page to explain features. Background `{colors.surface-card}`, rounded `{rounded.xl}`, padding `{spacing.xl}`. No colored variants — consistent cream surface.

### Badges

**`badge-ad-on`** — `{colors.warning}` text, `{colors.warning-subtle}` background, `{colors.warning}` border at 1px, rounded `{rounded.pill}`, type `{typography.caption-uppercase}`. Label: "AD MODE ON".

**`badge-ad-off`** — `{colors.muted}` text, `{colors.surface-strong}` background, rounded `{rounded.pill}`. Label: "AD MODE OFF".

**`badge-copied`** — `{colors.success}` text, `{colors.success-subtle}` background, rounded `{rounded.pill}`. Shows momentarily after copy action. Label: "COPIED".

### Toggle (Ad Mode)

**`toggle-on`** — Background `{colors.brand-amber}`, thumb white. Width 40px, height 22px, rounded `{rounded.pill}`.

**`toggle-off`** — Background `{colors.hairline}`, thumb white. Same size.

The toggle is the primary interaction in the dashboard. Its amber-on color is the strongest warning signal in the system — deliberate, not alarming.

### Interstitial Ad Page

**`interstitial-page`** — Full-viewport dark surface. Background `{colors.surface-dark}`.

- Destination URL: `{typography.mono-md}`, `{colors.on-dark-muted}`, truncated
- "Continue to URL" button: `{component.button-primary}` but on dark — white background, `{colors.ink}` text
- Ad slot: centered placeholder zone, `{colors.surface-dark-elevated}` background, dashed `{colors.hairline}` border, label `{typography.caption-uppercase}` `{colors.on-dark-muted}`
- Branding: small Muzone wordmark at top

### CTA Band & Footer

**`cta-band`** — Pre-footer band. Background `{colors.surface-soft}`, rounded `{rounded.xl}`, padding 64px. Contains h2 in `{typography.display-sm}`, sub-line, `{component.button-primary}`.

**`footer`** — Warm canvas footer (NOT dark). Background `{colors.surface-soft}`, text `{colors.body}`. 3-column link list. Vertical padding `{spacing.section}`. Bottom: copyright in `{typography.body-sm}` `{colors.muted}`.

---

## Grid & Layout

- **Max content width:** 1200px, centered with `margin: 0 auto`
- **Page padding:** `{spacing.xl}` (32px) horizontal at desktop, `{spacing.md}` (16px) at mobile
- **Hero layout:** Single-column centered — URL form is the hero, no illustration split
- **Dashboard layout:** Single column, full-width link cards
- **Landing features:** 3-column grid at desktop → 1-column at mobile
- **Section rhythm:** `{spacing.section}` (80px) between major bands

---

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 640px | Full-width inputs; single-column features; result band stacks QR below slug |
| Tablet | 640–1024px | 2-column features; dashboard row actions collapse to icon-only |
| Desktop | > 1024px | 3-column features; full dashboard row with all metadata visible |

### Touch Targets
- All buttons: minimum 44×44px (WCAG AA)
- All inputs: height 44px
- Icon buttons in dashboard: 36×36px — acceptable for desktop-primary tool

---

## Signature Element — Result Band

The result band is the one moment this app has a visual identity. When a link is created:

- The page transitions to or reveals a dark `{colors.surface-dark}` card
- The slug appears in `{typography.mono-lg}`, `{colors.on-dark}`, with a 3px `{colors.accent}` left border and `{colors.accent-subtle}` background — reads like a terminal output
- The QR code sits to the right (desktop) or below (mobile)
- A pill-shaped "Copy" button in `{colors.accent}` anchors the action

Everything else in the app exists to deliver the user to this moment. Keep it quiet everywhere else.

---

## Do's and Don'ts

### Do
- Use `{colors.canvas}` (`#fafaf7`) as the page floor — the warm tint separates Muzone from cold-gray SaaS tools
- Use `{typography.mono-lg}` / `{typography.mono-md}` for all slug and URL display — this is the brand voice
- Use `{colors.brand-amber}` / `{colors.warning}` for ad mode — it reads as "attention needed" without alarm
- Keep the result band dark (`{colors.surface-dark}`) — the contrast is intentional and is the signature
- Keep the footer warm-light (`{colors.surface-soft}`) — not dark
- Use `{spacing.section}` (80px) between major bands
- Reference all colors via CSS variables, never hardcoded hex

### Don't
- Don't use cool grays for canvas — the warm off-white is non-negotiable
- Don't use JetBrains Mono outside of slug/URL/result contexts — it's reserved for the result moment
- Don't add a dark footer — warm-light throughout is the system contract
- Don't introduce new colors without adding them to this file first
- Don't override component styles at usage sites — modify `components/ui/*.tsx` directly
- Don't use `@radix-ui/*` primitives — Base UI only
- Don't use Inter weight 700 on display headlines — weight 500 with negative letter-spacing is the system
- Don't add decorative elements outside the result band — utility is the aesthetic everywhere else

---

## CSS Variable Reference

These variables are defined in `app/styles/globals.css` and consumed via Tailwind's `var()` syntax.

```css
:root {
  /* Canvas & Surface */
  --canvas: #fafaf7;
  --surface-soft: #f4f3ee;
  --surface-card: #eeecea;
  --surface-strong: #e5e3de;
  --surface-dark: #0f1117;
  --surface-dark-elevated: #1a1d27;
  --hairline: #dedcda;

  /* Brand & Accent */
  --primary: #0f1117;
  --accent: #5c6bc0;
  --accent-hover: #4a5ab8;
  --accent-subtle: #5c6bc014;
  --brand-mint: #4db6a8;
  --brand-amber: #f0a500;
  --brand-amber-subtle: #f0a50014;

  /* Text */
  --ink: #0f1117;
  --body-strong: #1a1d27;
  --body: #3a3d4a;
  --muted: #6a6d7a;
  --muted-soft: #9a9daa;
  --on-primary: #ffffff;
  --on-dark: #f4f3ee;
  --on-dark-muted: #9a9daa;

  /* Semantic */
  --success: #4db6a8;
  --success-subtle: #4db6a814;
  --warning: #f0a500;
  --warning-subtle: #f0a50014;
  --error: #e53935;
  --error-subtle: #e5393514;
}

.dark {
  /* Canvas & Surface
     Dark mode inverts the warmth: near-black canvas, dark-elevated cards.
     surface-dark and surface-dark-elevated from light mode become the
     canvas and card layers here. */
  --canvas: #0f1117;
  --surface-soft: #131720;
  --surface-card: #1a1d27;
  --surface-strong: #222633;
  --surface-dark: #0a0c12;
  --surface-dark-elevated: #131720;
  --hairline: #2a2d3a;

  /* Brand & Accent
     Accent lightens slightly for better contrast on dark canvas.
     Amber and mint stay vivid — they're semantic signals, not decorative. */
  --primary: #f4f3ee;
  --accent: #7986cb;
  --accent-hover: #8e99d4;
  --accent-subtle: #7986cb1a;
  --brand-mint: #4db6a8;
  --brand-amber: #f0a500;
  --brand-amber-subtle: #f0a5001a;

  /* Text
     Inverted hierarchy: on-dark values become the default text stack. */
  --ink: #f4f3ee;
  --body-strong: #e8e6e0;
  --body: #b8b9c4;
  --muted: #7a7d8a;
  --muted-soft: #4a4d5a;
  --on-primary: #0f1117;
  --on-dark: #f4f3ee;
  --on-dark-muted: #7a7d8a;

  /* Semantic — unchanged; these are vivid enough to read on dark canvas */
  --success: #4db6a8;
  --success-subtle: #4db6a81a;
  --warning: #f0a500;
  --warning-subtle: #f0a5001a;
  --error: #e53935;
  --error-subtle: #e539351a;
}
```

Dark mode is applied via the `.dark` class on `<html>` (Tailwind's `darkMode: "class"` strategy). Toggle is managed by the theme provider in `app/routes/__root.tsx`.

**Dark mode notes:**
- The result band (`{colors.surface-dark}`) is already dark in light mode. In dark mode it deepens to `{colors.surface-dark}` (`#0a0c12`) — slightly darker than the canvas so it still reads as a distinct zone.
- The footer stays consistent: `{colors.surface-soft}` maps to `#131720` in dark mode — a warm-dark tone, not a harsh black. The warm-throughout contract holds in both modes.
- Semantic colors (success, warning, error) are identical in both modes — they carry meaning, not decoration, and the vivid values read on both canvas tones.
