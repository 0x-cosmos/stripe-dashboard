# Design Specification: Stripe Dashboard

> **"Clarity at Speed"** — Enable executives to assess financial health in < 5 seconds.

## Design Philosophy

This dashboard uses a **Premium Fintech Aesthetic** inspired by Stripe's Deep Navy theme. It prioritizes hierarchy, contrast, and rigid alignment to reduce cognitive load.

---

## Color System

### Theme Toggle
A manual Light/Dark mode toggle is available in the header. The theme preference is persisted in `localStorage`.

### Palette

| Variable | Light Mode | Dark Mode (Stripe Navy) | Usage |
| :--- | :--- | :--- | :--- |
| `--background` | `#F7F9FC` | `#0A2540` | Page background |
| `--surface` | `#FFFFFF` | `#1A3D63` | Card backgrounds |
| `--foreground` | `#1F2937` | `#E6EAF0` | Primary text |
| `--muted` | `#64748B` | `#94A3B8` | Secondary text, labels |
| `--primary` | `#635BFF` | `#635BFF` | Branding (Stripe Blurple) |
| `--success` | `#059669` | `#4ADE80` | MRR Growth |
| `--danger` | `#DC2626` | `#F87171` | Churn, Risk alerts |
| `--border` | `#E2E8F0` | `rgba(255,255,255,0.1)` | Borders |

---

## Typography

- **Font:** Inter (Google Fonts)
- **KPI Values:** `text-3xl font-bold tracking-tight`
- **Card Titles:** `text-sm font-medium uppercase tracking-wider`
- **Body Text:** `text-sm`
- **Micro-labels:** `text-[10px] font-medium`

---

## Layout Architecture

### Bento Grid
A responsive CSS Grid layout designed for scalability.

```
┌────────────────────────────────────────────────────────┐
│  Header (Logo + Nav + Theme Toggle)                    │
├────────────────┬────────────────┬──────────────────────┤
│   MRR Card     │   Churn Card   │   [Future Metric]    │
├────────────────┴────────────────┴──────────────────────┤
│              Revenue Calendar (Full Width)             │
└────────────────────────────────────────────────────────┘
```

- **Grid:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Gap:** `gap-6` (24px)
- **Max Width:** `max-w-7xl` (container)

---

## Component Overview

### `DashboardShell`
Handles the global layout, sticky navigation, and theme toggle button.

### `MrrCard`
Displays Total MRR with a trend indicator badge and plan breakdown.

### `ChurnCard`
Displays MRR at Risk with danger styling and risk breakdown by plan.

### `RevenueCalendar`
A **heatmap-style** monthly calendar grid.
- **7-column grid** for days of the week.
- **Revenue intensity:** Background tint based on daily revenue.
- **Churn indicator:** Small red dot on days with churn events.
- **Future dates:** Faded opacity (60%) for projected data.

---

## File Structure

```
src/
├── app/
│   ├── globals.css          # CSS variables & theme definitions
│   ├── layout.tsx           # Root layout with providers
│   └── dashboard/
│       └── page.tsx         # Dashboard page with Bento Grid
├── components/
│   ├── DashboardShell.tsx   # Layout shell with nav & theme toggle
│   ├── MrrCard.tsx          # MRR metric card
│   ├── ChurnCard.tsx        # Churn metric card
│   └── RevenueCalendar.tsx  # Heatmap calendar
└── contexts/
    ├── StripeContext.tsx    # Stripe API key management
    └── ThemeContext.tsx     # Light/Dark mode state
```

---

## Future Roadmap

- [ ] **LTV/CAC Metric Card** — Placeholder ready in the grid.
- [ ] **Global Date Picker** — Filter all metrics by date range.
- [ ] **Trend Calculation** — Replace mock trend percentages with real data.
- [ ] **Accessibility Audit** — Ensure WCAG 2.1 AA compliance.
