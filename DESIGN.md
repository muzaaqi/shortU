# DESIGN.md — shortU Design System

> This is the design system source of truth.
> Every UI component must use only the tokens defined here.
> Never use hardcoded hex values, font sizes, or spacing in component files.
> All colors are mapped to default **shadcn theme variables** via Tailwind CSS v4 `@theme inline`.
> Before touching any component, read this file in full.

---

## Philosophy

shortU is a utility tool for people who share links — developers, creators, marketers. The design takes a single deliberate stance: **warm-light canvas with high-contrast ink**, borrowed from the Clay.com school of cream-on-dark rather than the cold-gray SaaS default. Where Clay uses 3D claymation to add personality, shortU uses **monospace terminal aesthetics** as its personality layer — the output slug field is the brand moment.

Light mode is the primary experience. Dark mode is fully supported.

The interface has two emotional registers:
1. **Neutral utility** — inputs, nav, cards, dashboard rows
2. **Result moment** — the shortened URL + QR output, styled like a terminal readout. This is the only place the design shows off.

---

## Colors & shadcn Theme Mapping

All colors are defined via standard shadcn CSS variables so any shadcn component works out-of-the-box without manual color overrides.

### Canvas & Surface
| Token | Hex (Light) | Hex (Dark) | shadcn Variable | Usage |
|---|---|---|---|---|
| `--canvas` | `#fafaf7` | `#0f1117` | `--background`, `--popover` | Default page background — warm off-white (light) / near-black (dark) |
| `--surface-soft` | `#f4f3ee` | `#131720` | `--secondary`, `--sidebar` | Section bands, footer background, secondary buttons |
| `--surface-card` | `#eeecea` | `#1a1d27` | `--card`, `--muted` | Cards, input backgrounds, dashboard rows |
| `--surface-strong` | `#e5e3de` | `#222633` | `--secondary-dark`, `--sidebar-accent` | Hover states on cards, emphasized separators |
| `--surface-dark` | `#0f1117` | `#0a0c12` | `--color-surface-dark` | Dark accent surfaces — interstitial page, result band |
| `--surface-dark-elevated` | `#1a1d27` | `#131720` | `--color-surface-dark-elevated` | Elevated surfaces within dark context |
| `--hairline` | `#dedcda` | `#2a2d3a` | `--border`, `--input`, `--sidebar-border` | 1px borders on cards, inputs, dividers |

### Brand & Accent
| Token | Hex (Light) | Hex (Dark) | shadcn Variable | Usage |
|---|---|---|---|---|
| `--brand-primary` | `#0f1117` | `#f4f3ee` | `--primary` | Primary CTA buttons, h1/h2 ink |
| `--brand-accent` | `#5c6bc0` | `#7986cb` | `--ring`, `--accent-foreground`, `--chart-1` | Focus rings, links, active states — muted indigo |
| `--brand-accent-hover` | `#4a5ab8` | `#8e99d4` | `--accent-dark` | Hover on accent elements |
| `--brand-accent-subtle` | `#5c6bc014` | `#7986cb1a` | `--accent` | Accent tint background for result field / highlights |
| `--brand-mint` | `#4db6a8` | `#4db6a8` | `--chart-2`, `--semantic-success` | Success states, "copied" indicator, QR badge |
| `--brand-amber` | `#f0a500` | `#f0a500` | `--warning`, `--chart-3` | Ad mode active — warning/attention without alarm |
| `--brand-amber-subtle` | `#f0a50014` | `#f0a5001a` | `--color-brand-amber-subtle` | Ad badge background |

### Text & Ink
| Token | Hex (Light) | Hex (Dark) | shadcn Variable | Usage |
|---|---|---|---|---|
| `--ink` | `#0f1117` | `#f4f3ee` | `--foreground`, `--card-foreground`, `--popover-foreground` | Headlines, primary text |
| `--body-strong` | `#1a1d27` | `#e8e6e0` | `--color-body-strong` | Emphasized body, lead paragraphs |
| `--body` | `#3a3d4a` | `#b8b9c4` | `--color-body` | Default running text |
| `--muted-text` | `#6a6d7a` | `#7a7d8a` | `--muted-foreground` | Labels, descriptions, secondary info |
| `--muted-soft` | `#9a9daa` | `#4a4d5a` | `--color-muted-soft` | Placeholders, captions, fine print |
| `--on-primary` | `#ffffff` | `#0f1117` | `--primary-foreground` | Text on primary CTA buttons |
| `--on-dark` | `#f4f3ee` | `#f4f3ee` | `--color-on-dark` | Text on dark surfaces |
| `--on-dark-muted` | `#9a9daa` | `#7a7d8a` | `--color-on-dark-muted` | Secondary text on dark surfaces |

### Semantic
| Token | Hex (Light & Dark) | shadcn Variable | Usage |
|---|---|---|---|
| `--semantic-success` | `#4db6a8` | `--color-brand-mint`, `--chart-2` | Copied to clipboard, link created |
| `--semantic-success-subtle`| `#4db6a814` (light) / `#4db6a81a` (dark) | `--color-success-subtle` | Success state background |
| `--semantic-warning` | `#f0a500` | `--warning` | Ad mode active — matches brand-amber |
| `--semantic-warning-subtle`| `#f0a50014` (light) / `#f0a5001a` (dark) | `--color-warning-subtle` | Ad badge background |
| `--semantic-error` | `#e53935` | `--destructive`, `--chart-5` | Validation errors, slug collision |
| `--semantic-error-subtle`  | `#e5393514` (light) / `#e539351a` (dark) | `--color-error-subtle` | Error input background tint |

---

## Typography

### Font Families

- **Display / Headings / UI:** `"Inter Variable"`, `"Inter"`, sans-serif (`--font-sans`)
- **Monospace (slugs, URLs, result output):** `"JetBrains Mono Variable"`, `"JetBrains Mono"`, monospace (`--font-mono`)

Imported directly in `src/styles.css`:
```css
@import "@fontsource-variable/inter";
@import "@fontsource-variable/jetbrains-mono";
```

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

| Token | Value | Tailwind Class | Use |
|---|---|---|---|
| `{rounded.xs}` | 4px | `rounded-xs` / `rounded-[var(--radius-sm)]` | Small badges, tag pills tight |
| `{rounded.sm}` | 8px | `rounded-sm` / `rounded-[var(--radius-md)]` | Dropdown items, small inputs |
| `{rounded.md}` | 10px | `rounded-md` / `rounded-[var(--radius)]` | Standard inputs, buttons |
| `{rounded.lg}` | 14px | `rounded-lg` / `rounded-[var(--radius-lg)]` | Cards, dashboard rows |
| `{rounded.xl}` | 20px | `rounded-xl` / `rounded-[var(--radius-xl)]` | Feature cards, result band, QR preview |
| `{rounded.pill}` | 9999px | `rounded-full` | Badge pills, toggles, copy button |

---

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Page background bands, nav |
| Hairline | 1px border (`border-border`) | Inputs, dashboard rows, cards |
| Soft raise | `box-shadow: 0 1px 3px rgba(15,17,23,0.07)` | Cards on hover |
| Elevated | `box-shadow: 0 4px 12px rgba(15,17,23,0.10)` | QR preview, result band |
| Dark surface | `bg-[var(--surface-dark)]` fill, no shadow | Result output field, interstitial page |

---

## Components

### Top Navigation

**`top-nav`** — Warm canvas nav bar pinned to top. 60px tall, `bg-background` (`--canvas`), 1px bottom border `border-border`. Logo + wordmark at left. Right cluster: "Sign in" (text link) + "Get started" (`Button variant="default"`). Menu items in `{typography.nav-link}`.

### Buttons

- **`Button variant="default"`** — Background `bg-primary`, text `text-primary-foreground`, rounded `rounded-md`.
- **`Button variant="outline"`** — Background `bg-background`, text `text-foreground`, border `border-border`.
- **`Button variant="secondary"`** — Background `bg-secondary`, text `text-secondary-foreground`.
- **`Button variant="ghost"`** — Transparent background, `text-muted-foreground` hover `text-foreground`.
- **`Button variant="destructive"`** — Background `bg-destructive/10`, text `text-destructive`.
- **`button-accent`** — Background `bg-accent` (`--brand-accent`), text `text-primary-foreground`. Used for the "Copy" button in result state.

### Inputs & Forms

- **`Input`** — Background `bg-card`, text `text-foreground`, placeholder `text-muted-foreground`, border `border-input`, rounded `rounded-md`. Focus: `focus-visible:ring-ring`.
- **`Input (Mono)`** — Same as standard `Input` with `font-mono` (`JetBrains Mono`). Used for slug entry and custom URL fields.
- **`Label`** — `text-foreground`, font weight 600 (`title-sm`), margin-bottom 8px.

### Result Band (Signature Element)

**`result-band`** — The primary brand moment shown after a link is created.
- Background: `bg-[var(--surface-dark)]` (`#0f1117` in light, `#0a0c12` in dark)
- Text: `text-[var(--on-dark)]` (`#f4f3ee`)
- Slug output: `font-mono text-lg text-on-dark bg-accent px-3 py-2 rounded-sm` with a mono `>` prompt marker in `text-brand-accent` (terminal readout — no side-tab accent borders)
- Original URL: `font-mono text-sm text-[var(--on-dark-muted)] truncate`
- "Copy" button: `bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-accent-hover)] rounded-full`
- QR preview: 120×120px, white background (always for scan contrast), `rounded-md`

### Cards

- **`Card` / `link-card`** — Dashboard row card. Background `bg-card`, border `border-border`, rounded `rounded-lg`, padding `p-4` to `p-6`. Hover: `hover:bg-[var(--surface-strong)]`.
- **`qr-preview-card`** — QR code container. Always white background (`#ffffff`) for contrast, `border-border`, rounded `rounded-md`.

### Badges

- **`Badge variant="warning"` (Ad On)** — `text-[var(--brand-amber)] bg-[var(--brand-amber-subtle)] border-[var(--brand-amber)] rounded-full text-xs font-semibold`
- **`Badge variant="secondary"` (Ad Off)** — `text-muted-foreground bg-secondary rounded-full text-xs`
- **`Badge variant="success"` (Copied)** — `text-[var(--brand-mint)] bg-[var(--semantic-success-subtle)] rounded-full text-xs`

### Switch / Toggle (Ad Mode)

- **`Switch (checked)`** — Background `bg-[var(--brand-amber)]`, thumb white.
- **`Switch (unchecked)`** — Background `bg-input`, thumb white.

### Responsive Overlay

**`responsive-overlay`** — The single shell for all modal surfaces. Renders a bottom-sheet **Drawer** below 768px and a centered **Dialog** at 768px+, driven by `useMobile()` (`src/hooks/use-mobile.tsx`). Callers pass one body + optional footer; only the chrome differs.
- Body: `px-4` (Drawer) / `py-2` (Dialog)
- Footer: right-aligned action row under a hairline separator (`border-t border-border`)
- Width passthrough via `contentClassName` (default `sm:max-w-md`)
- Close actions always call the open-state callback — never shell-specific parts

### Shorten Flow Overlay

**`shorten-dialog`** — The create-link flow inside a Responsive Overlay.
- Segmented **Random | Custom** slug toggle: pill container `bg-secondary rounded-full`, active segment `bg-primary text-primary-foreground`
- Random mode: read-only mono input pre-filled with `nanoid(7)` + regenerate icon button inner-right
- Custom mode: domain prefix inner-left (`font-mono text-muted-foreground`) + editable validated input
- Decorative QR placeholder: dashed-border square with `QrCode` glyph — never a real QR image until creation
- Optional "Generate QR code" pill: pressed state `bg-success-subtle text-brand-mint`
- Footer: Cancel (outline) + Confirm (primary, submits by form id)

### Interstitial Ad Page

**`interstitial-page`** — Light page canvas (`--canvas`) with a single elevated dark destination card `bg-[var(--surface-dark)]`, rounded-xl (20px), shadow. The dark card is the focal point; the surrounding canvas keeps the app shell (nav/footer) coherent.
- Destination URL: `font-mono text-sm text-on-dark` inside `bg-[var(--surface-dark-elevated)]` readout
- Countdown progress: mint track fill via `transform: scaleX()` (never animates width)
- Pause/resume control: ghost icon button, `text-on-dark-muted`, rounded-full
- "Continue" button: `bg-brand-accent text-white hover:bg-brand-accent-hover`
- Ad slot: centered placeholder zone `bg-[var(--surface-dark-elevated)] border-dashed border-white/15`

---

## CSS Variable Reference (src/styles.css)

These variables are defined in `src/styles.css` and consumed via Tailwind CSS v4 `@theme inline`:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@fontsource-variable/inter";
@import "@fontsource-variable/jetbrains-mono";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-primary-dark: var(--primary-dark);
  --color-secondary-dark: var(--secondary-dark);
  --color-destructive-dark: var(--destructive-dark);
  --color-warning-dark: var(--warning-dark);
  --color-muted-dark: var(--muted-dark);
  --color-accent-dark: var(--accent-dark);

  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* shortU custom semantic color tokens */
  --color-canvas: var(--canvas);
  --color-surface-soft: var(--surface-soft);
  --color-surface-card: var(--surface-card);
  --color-surface-strong: var(--surface-strong);
  --color-surface-dark: var(--surface-dark);
  --color-surface-dark-elevated: var(--surface-dark-elevated);
  --color-hairline: var(--hairline);
  --color-brand-mint: var(--brand-mint);
  --color-brand-amber: var(--brand-amber);
  --color-ink: var(--ink);
  --color-body-strong: var(--body-strong);
  --color-body: var(--body);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --font-sans: "Inter Variable", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: "JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

@layer base {
  :root {
    /* DESIGN.md Tokens (Light Mode) */
    --canvas: #fafaf7;
    --surface-soft: #f4f3ee;
    --surface-card: #eeecea;
    --surface-strong: #e5e3de;
    --surface-dark: #0f1117;
    --surface-dark-elevated: #1a1d27;
    --hairline: #dedcda;

    --brand-primary: #0f1117;
    --brand-accent: #5c6bc0;
    --brand-accent-hover: #4a5ab8;
    --brand-accent-subtle: #5c6bc014;
    --brand-mint: #4db6a8;
    --brand-amber: #f0a500;
    --brand-amber-subtle: #f0a50014;

    --ink: #0f1117;
    --body-strong: #1a1d27;
    --body: #3a3d4a;
    --muted-text: #6a6d7a;
    --muted-soft: #9a9daa;
    --on-primary: #ffffff;
    --on-dark: #f4f3ee;
    --on-dark-muted: #9a9daa;

    --semantic-success: #4db6a8;
    --semantic-success-subtle: #4db6a814;
    --semantic-warning: #f0a500;
    --semantic-warning-subtle: #f0a50014;
    --semantic-error: #e53935;
    --semantic-error-subtle: #e5393514;

    /* Default shadcn Theme Variables */
    --background: var(--canvas);
    --foreground: var(--ink);
    --card: var(--surface-card);
    --card-foreground: var(--ink);
    --popover: var(--canvas);
    --popover-foreground: var(--ink);
    --primary: var(--brand-primary);
    --primary-foreground: var(--on-primary);
    --secondary: var(--surface-soft);
    --secondary-foreground: var(--ink);
    --muted: var(--surface-card);
    --muted-foreground: var(--muted-text);
    --accent: var(--brand-accent-subtle);
    --accent-foreground: var(--brand-accent);
    --destructive: var(--semantic-error);
    --destructive-foreground: #ffffff;
    --warning: var(--brand-amber);
    --warning-foreground: var(--ink);
    --border: var(--hairline);
    --input: var(--hairline);
    --ring: var(--brand-accent);

    --primary-dark: #000000;
    --secondary-dark: var(--surface-strong);
    --destructive-dark: #c62828;
    --warning-dark: #c68400;
    --muted-dark: var(--surface-strong);
    --accent-dark: var(--brand-accent-hover);

    --chart-1: var(--brand-accent);
    --chart-2: var(--brand-mint);
    --chart-3: var(--brand-amber);
    --chart-4: #7986cb;
    --chart-5: var(--semantic-error);

    --radius: 0.5rem;

    --sidebar: var(--surface-soft);
    --sidebar-foreground: var(--ink);
    --sidebar-primary: var(--brand-primary);
    --sidebar-primary-foreground: var(--on-primary);
    --sidebar-accent: var(--surface-strong);
    --sidebar-accent-foreground: var(--ink);
    --sidebar-border: var(--hairline);
    --sidebar-ring: var(--brand-accent);
  }

  .dark {
    /* DESIGN.md Tokens (Dark Mode) */
    --canvas: #0f1117;
    --surface-soft: #131720;
    --surface-card: #1a1d27;
    --surface-strong: #222633;
    --surface-dark: #0a0c12;
    --surface-dark-elevated: #131720;
    --hairline: #2a2d3a;

    --brand-primary: #f4f3ee;
    --brand-accent: #7986cb;
    --brand-accent-hover: #8e99d4;
    --brand-accent-subtle: #7986cb1a;
    --brand-mint: #4db6a8;
    --brand-amber: #f0a500;
    --brand-amber-subtle: #f0a5001a;

    --ink: #f4f3ee;
    --body-strong: #e8e6e0;
    --body: #b8b9c4;
    --muted-text: #7a7d8a;
    --muted-soft: #4a4d5a;
    --on-primary: #0f1117;
    --on-dark: #f4f3ee;
    --on-dark-muted: #7a7d8a;

    --semantic-success: #4db6a8;
    --semantic-success-subtle: #4db6a81a;
    --semantic-warning: #f0a500;
    --semantic-warning-subtle: #f0a5001a;
    --semantic-error: #e53935;
    --semantic-error-subtle: #e539351a;

    /* Default shadcn Theme Variables */
    --background: var(--canvas);
    --foreground: var(--ink);
    --card: var(--surface-card);
    --card-foreground: var(--ink);
    --popover: var(--surface-card);
    --popover-foreground: var(--ink);
    --primary: var(--brand-primary);
    --primary-foreground: var(--on-primary);
    --secondary: var(--surface-strong);
    --secondary-foreground: var(--ink);
    --muted: var(--surface-soft);
    --muted-foreground: var(--muted-text);
    --accent: var(--brand-accent-subtle);
    --accent-foreground: var(--brand-accent);
    --destructive: var(--semantic-error);
    --destructive-foreground: #ffffff;
    --warning: var(--brand-amber);
    --warning-foreground: #0f1117;
    --border: var(--hairline);
    --input: var(--hairline);
    --ring: var(--brand-accent);

    --primary-dark: #d8d6d0;
    --secondary-dark: #1a1d27;
    --destructive-dark: #c62828;
    --warning-dark: #c68400;
    --muted-dark: #0f1117;
    --accent-dark: var(--brand-accent-hover);

    --chart-1: var(--brand-accent);
    --chart-2: var(--brand-mint);
    --chart-3: var(--brand-amber);
    --chart-4: #5c6bc0;
    --chart-5: var(--semantic-error);

    --sidebar: var(--surface-soft);
    --sidebar-foreground: var(--ink);
    --sidebar-primary: var(--brand-primary);
    --sidebar-primary-foreground: var(--on-primary);
    --sidebar-accent: var(--surface-card);
    --sidebar-accent-foreground: var(--ink);
    --sidebar-border: var(--hairline);
    --sidebar-ring: var(--brand-accent);
  }

  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
  }

  code,
  kbd,
  samp,
  pre,
  .font-mono {
    font-family: var(--font-mono);
  }
}
```
