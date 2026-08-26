# DealerPulse — Decisions & Tradeoffs

## What I Built and Why

I built a three-tier performance dashboard for Toyota dealership leadership:

1. **Network Overview** (`/`) — CEO-level view of all five branches: KPI strip, automated alert bar, monthly trend chart, sortable branch scorecard table, conversion funnel, target-vs-actual progress bars, and an aging leads panel
2. **Branch Detail** (`/branch/[id]`) — Branch manager view: monthly target attainment, rep leaderboard, conversion funnel, lead source breakdown, model mix, lost reason analysis, aging leads list
3. **Rep Detail** (`/rep/[id]`) — Rep-level pipeline: every lead with aging indicators, expandable status-history timeline, pipeline value

The product hierarchy maps directly to how leadership actually works: CEO scans the network → spots a problem branch → drills to branch → identifies the underperforming rep → reviews their pipeline.

### The core product bet: actionable over decorative

Every decision was driven by "what would a CEO or branch manager actually *do* with this?" I prioritised:
- **Aging lead alerts** as the primary dashboard-level insight — these are revenue at immediate risk
- **Target attainment progress bars** per month — not just raw delivered counts
- **Branch scorecard as navigation** — clicking a row goes directly to that branch's detail view
- **Activity timeline per lead** — managers need the actual conversation history to coach their reps effectively

I deliberately skipped: what-if scenarios, AI summaries, and export/sharing — they add complexity without meaningful payoff for the given dataset and audience.

---

## Design & UX Decisions

### Visual hierarchy

The dashboard is structured in three distinct tiers of visual weight:

1. **Alert bar** — highest urgency, rendered first below the page title; uses red/amber backgrounds so it can't be missed
2. **KPI strip** — four cards with large numeric values; left-border colour coding (green/amber/red) communicates health at a glance without reading numbers
3. **Supporting analytics** — charts, tables, and breakdowns sit below the fold and reward exploration

This ordering ensures a CEO who glances at the screen for 10 seconds sees the most important signal first.

### Consistent status colour system

All lead statuses use the same colour tokens everywhere — in tables, badges, the timeline, and funnel bars:

| Status | Colour |
|---|---|
| New | Slate |
| Contacted | Blue |
| Test Drive | Violet |
| Negotiation | Amber |
| Order Placed | Emerald |
| Delivered | Green |
| Lost | Red |

Defined once in `src/lib/utils.ts → statusColor()` and reused across all components.

### Target attainment colour coding

All target percentages follow the same three-state system across the overview, branch pages, and forecast bars:
- **≥ 90%** — Green (on track)
- **70–89%** — Amber (at risk)
- **< 70%** — Red (critical)

This lets a manager scan a table and immediately see where to focus.

### Navigation and clickable affordances

- Every branch row in the scorecard table navigates to `/branch/[id]`
- Every rep row in the leaderboard navigates to `/rep/[id]`
- Every lead row in the rep pipeline expands inline to show the activity timeline
- Breadcrumbs on branch and rep pages provide back-navigation context
- The month picker links are URL-param based (`?month=2025-11`) — views are bookmarkable and shareable

### Responsive layout

| Breakpoint | Behaviour |
|---|---|
| Mobile (< 640px) | KPI cards stack 2 × 2; tables scroll horizontally; charts reflow to full width |
| Tablet (640–1024px) | 2-column KPI strip; full tables visible; charts side-by-side |
| Desktop (> 1024px) | 4-column KPI strip; 3-column chart grid; full two-panel layouts |

Implemented with Tailwind's `grid-cols-2 lg:grid-cols-4` pattern throughout. `ResponsiveContainer` from Recharts ensures charts never overflow their parent.

### Loading states

Components that depend on URL search params (`MonthPicker`, `BranchScorecardTable`, `RepLeaderboard`) are wrapped in `<Suspense>` boundaries with inline skeleton placeholders. This prevents layout shift during client-side hydration.

### Empty states

Every component that can render with zero data shows a meaningful empty state rather than a blank panel:

- **Aging Leads Panel** with no stale leads → "✓ All leads are active — No leads have been dormant for 7+ days"
- **Lost Reason Chart** with no lost leads → "No lost leads in this period"
- **Model Mix Chart** with no deliveries → "No deliveries in this period"
- **Rep Lead List** with no leads → "No leads found for this period"
- **Alert Bar** with no issues → "✓ All systems healthy — no critical issues detected"

### Error states

Invalid branch or rep IDs in the URL (e.g. `/branch/B99`) trigger Next.js `notFound()` which renders the standard 404 page. No silent rendering of empty or misleading data.

### Chart tooltips and labels

All Recharts charts include custom tooltips that show formatted values (e.g. `₹38.9Cr` not raw integers). Axis ticks are formatted consistently. The lost reason and model mix charts include inline count labels on bars so values are readable without hovering.

### Accessibility

- Colour is never the sole signal — numbers, labels, and icons accompany every colour-coded element
- Interactive rows have `cursor-pointer` and `:hover` states to communicate clickability
- Semantic HTML (`<table>`, `<th>`, `<thead>`, `<tbody>`) used for all tabular data
- Text contrast meets WCAG AA for all body text (dark text on light backgrounds throughout)

---

## Key Technical Decisions

### 1. Static JSON, processed server-side — no backend needed

The 607KB JSON is imported at build time into server components. All analytics (`src/lib/analytics.ts`) run on the server; only the computed results (arrays of numbers, strings) are serialised to the client as React props. The client JS bundle never sees the raw JSON.

**Tradeoff:** Not scalable to real-time data. For production I'd swap `src/lib/data.ts`'s static import for a Postgres query behind a Next.js API route. The analytics layer is written as pure functions over typed arrays, so the data-source swap is confined to one file.

### 2. Server component pages with client component leaves

Pages (`app/page.tsx`, `app/branch/[id]/page.tsx`, `app/rep/[id]/page.tsx`) are async server components. Only interactive leaves (`RepDetailClient`, `MonthPicker`, `BranchScorecardTable`, `RepLeaderboard`) are client components. This keeps the client bundle small while enabling stateful interactions (expandable timelines, sortable columns, month picker).

### 3. Recharts over D3 or Tremor

Recharts is composable (`ComposedChart` for bars + line on the same Y axis), TypeScript-friendly, and integrates cleanly with `ResponsiveContainer`. D3 gives more control but adds 3–4× the code. Tremor looks polished but locks you into its component API.

### 4. Month filter as URL param

All filters use `?month=2025-11`. Views are shareable, bookmarkable, and survive navigation. No global state management required.

### 5. Aging relative to Dec 31 2025

Since the dataset covers June–December 2025, the aging calculation reference date is December 31 2025, not today. Using today (August 2026) would flag every open lead as critically stale — noise with no signal.

---

## Interesting Patterns in the Data

All of the following figures are derived from the same analytics functions (`src/lib/analytics.ts`) that power the dashboard.

### 1. All branches are significantly below target — Lakeside is an outlier

Average monthly target attainment by branch (units delivered vs. units targeted):

| Branch | City | Avg Monthly Attainment |
|---|---|---|
| Downtown Toyota | Chennai | 12% |
| Highway Toyota | Chennai | 12% |
| **Lakeside Toyota** | Bangalore | **2%** |
| Central Toyota | Hyderabad | 13% |
| Eastside Toyota | Mumbai | 15% |

Lakeside's 2% attainment is a structural problem that warrants immediate investigation — whether it's a territory issue, rep quality, or lead volume problem. Eastside at 15% is the relative outperformer.

### 2. June had zero deliveries across all branches

Every branch delivered 0 units in June 2025. This is consistent with the lead-to-delivery timeline: leads created in June (the dataset's opening month) typically take 3–5 weeks to progress through the funnel, pushing first deliveries into July.

### 3. The funnel's biggest leak is between "Contacted" and "Test Drive"

Of the 391 leads that reached "contacted," only 300 (77%) progressed to a test drive. 81 leads were lost in that gap — the single largest inter-stage attrition point. By contrast, once a lead reaches negotiation, 85% close as a win (198 won vs. 34 lost, among closed leads).

**Action:** Improve the contacted-to-test-drive conversion. Getting a customer into a car is the strongest predictor of a sale.

### 4. "Better offer elsewhere" and "Not ready to purchase" are the top lost reasons — tied at 40 each

The full distribution:

| Reason | Count |
|---|---|
| Better offer elsewhere | 40 |
| Not ready to purchase | 40 |
| Financing not approved | 38 |
| Unresponsive after follow-up | 38 |
| Budget constraints | 36 |
| Chose competitor brand | 30 |
| Dissatisfied with test drive | 28 |
| Relocated to another city | 24 |

"Better offer elsewhere" (40) suggests a pricing or negotiation training gap. "Unresponsive after follow-up" (38) directly validates the aging leads alert — these leads could be saved with a timely nudge. "Dissatisfied with test drive" (28) is the most operationally actionable: it points to vehicle condition, route choice, or rep preparation.

### 5. Average delivery time is 18.3 days (min 7, max 39)

Customer-requested date changes (18 cases) are the most common delay reason — largely outside the dealership's control. Logistics delays and factory allocation delays (11 each) are where operational intervention is worthwhile.

---

## What I'd Build Next (with more time)

1. **Live data + webhooks** — Replace the static JSON with a Postgres schema. Add `/api/webhook/lead-update` that branches POST to, triggering real-time updates via Server-Sent Events.

2. **Daily digest emails** — A Vercel Cron job that emails each branch manager their top 3 aging leads every morning with a direct link to the rep's pipeline.

3. **Rep mobile view** — A stripped-down `/rep/me` route optimised for phones: no charts, just the lead list with one-tap "Mark as contacted" — to improve follow-up rates without needing a laptop.

4. **Cohort conversion analysis** — Track conversion rates by lead source × model × month to identify which acquisition channels yield the highest-quality leads over time.

5. **Pipeline velocity metrics** — Average days per stage (new→contacted, contacted→test_drive, etc.) per rep, to surface where reps consistently stall.
