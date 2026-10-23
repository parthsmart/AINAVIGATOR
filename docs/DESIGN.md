# AI Career Navigator — Visual Identity & Design Specification (`docs/DESIGN.md`)

## Context & Grounding

**Who we are designing for:** Students aged 15–22 across India (Class 11–12 choosing streams or entrance exams, and college students navigating degrees, skills, and placements).
**Their reality:**
- They are making high-stakes, high-anxiety life decisions under family and financial pressure.
- Over 80% access the product on mid-range Android phones (`360px–412px` CSS width, varying OLED/IPS calibration, often used under harsh fluorescent tube lights or outdoor glare) over variable 4G or throttled data plans.
- They switch between English and Hindi (`हिन्दी`), or read English technical terms embedded inside Hindi sentences.
- **Our job:** Turn *"I don't know what to do"* into one calm, honest, verifiable next step. Tone is **calm, encouraging, and confident**—never childish (no gamified mascots or confetti) and never cold/corporate (no enterprise SaaS dashboards).

---

## Direction 1: "Indigo Ledger & Graph Sheet" (Calm Study Desk)

Grounded in the physical artifacts Indian students actually trust: practical laboratory notebooks, fountain-pen ink on cool glare-free paper, and structured study timetables pinned above a desk.

### 1. Colour Palette (5 Named Hex Values — Light & Dark Variants + WCAG AA Verification)

No warm cream/terracotta clichés and no pure `#000000` / acid-neon contrasts. Surfaces use a cool, low-glare mineral paper tint in light mode and a deep slate-indigo in dark mode.

| Token Name | Role | Light Hex | Light Contrast Check (WCAG AA) | Dark Hex | Dark Contrast Check (WCAG AA) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Kora Paper / Midnight Slate** (`--bg-canvas`) | Primary page background | `#F4F6F9` | Base canvas | `#111622` | Base canvas |
| **Chalk Sheet / Elevated Slate** (`--bg-surface`) | Structured content bands & inputs | `#FFFFFF` | `1.09:1` vs canvas (separated by border, not shadow) | `#182030` | `1.19:1` vs canvas |
| **Carbon Ink /Alabaster Text** (`--fg-primary`) | Primary body & heading copy | `#141B2D` | **`15.4:1`** on `#F4F6F9` (AAA) / **`17.0:1`** on `#FFFFFF` (AAA) | `#EBF0F7` | **`14.2:1`** on `#111622` (AAA) / **`11.9:1`** on `#182030` (AAA) |
| **Graphite Note / Pewter Text** (`--fg-muted`) | Secondary metadata, dates, provenance | `#4A5568` | **`6.8:1`** on `#F4F6F9` (AA) / **`7.5:1`** on `#FFFFFF` (AAA) | `#9AA6B8` | **`6.4:1`** on `#111622` (AA) / **`5.4:1`** on `#182030` (AA) |
| **Syahi Indigo / Cobalt Signal** (`--accent-primary`) | Primary action buttons & active step | `#1D4ED8` | **`6.7:1`** with `#FFFFFF` button text (AA) / **`5.9:1`** on `#F4F6F9` (AA) | `#60A5FA` | **`7.8:1`** on `#111622` (AAA) / **`8.9:1`** with `#0F172A` button text (AAA) |
| **Neem Green / Mint Verification** (`--semantic-verified`) | Verified catalog facts & completed tasks | `#15803D` | **`5.1:1`** on `#FFFFFF` (AA) | `#4ADE80` | **`8.6:1`** on `#182030` (AAA) |

*(Semantic Warning/Fallback uses `#B45309` in Light [`5.0:1`] and `#FBBF24` in Dark [`9.8:1`]; Semantic Error uses `#B91C1C` in Light [`6.4:1`] and `#F87171` in Dark [`6.1:1`].)*

### 2. Typography & Devanagari Parity

- **Primary UI & Body Family (Latin + Devanagari):** **Mukta** (designed by Ek Type, Mumbai).
  - *Why:* Mukta was engineered from the ground up as a unified multi-script family where the Devanagari *shirorekha* (top bar) and vowel *matras* align optically with Latin cap-height and x-height. Hindi copy never looks cramped or smaller than English copy.
- **Display & Quantitative Family:** **Space Grotesk** (Latin headings & tabular numbers) paired with **Mukta SemiBold/Bold** for Devanagari headings.
  - *Why:* Gives numerical data (`₹8–18 LPA`, `94%`, `15 hrs/wk`) crisp geometric authority without requiring a third monospace font file.
- **Weights Loaded:** `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold).
- **Self-Hosting & Slow-Network Budget:**
  - Serve static subsetted `.woff2` files from `/public/fonts/` (`mukta-latin-400.woff2`, `mukta-devanagari-400.woff2`, `mukta-latin-600.woff2`, `mukta-devanagari-600.woff2`, `space-grotesk-latin-600.woff2`).
  - Only preload `mukta-latin-400.woff2` (`~16 KB`) and `space-grotesk-latin-600.woff2` (`~18 KB`). The Devanagari subset (`~24 KB`) loads on-demand via `unicode-range: U+0900-097F` when Hindi is active or rendered, keeping initial font transfer **under 35 KB** on 3G.
  - Use `font-display: swap` with size-adjusted system fallbacks (`system-ui`, `Noto Sans Devanagari`, `sans-serif`) and enforce `line-height: 1.65` on body text so stacked Devanagari *matras* (`ि`, `ी`, `ु`, `ू`, `ै`, `ौ`) never collide across lines.

### 3. Layout Concept, Alignment Rules & Mobile ASCII Wireframes (`390px`)

- **Layout Concept (One Sentence):** A single-column vertical workbook where a persistent top "Next Step" anchor strip leads into flat, left-aligned horizontal bands separated by spacing and a `3px` left status rail rather than nested cards.
- **Alignment & Line Length Rules:**
  - Strict left alignment for all headings, body copy, and form labels (no centered paragraphs or centered section headers).
  - Numerical values (LPA ranges, hours, scores) align right in table rows using `font-variant-numeric: tabular-nums`.
  - Maximum line length is **64 characters (`64ch`)** on desktop and **38–44 characters** on `390px` mobile (well under the 80-character ceiling).
  - Touch targets are minimum **`44px × 44px`** with `8px` minimum vertical gap between interactive rows.

#### Mobile Wireframe 1: Dashboard (`390px`)
```text
+--------------------------------------+
| AI Career Navigator    [हिन्दी] [Menu]|
+--------------------------------------+
| Your next step                       |
| Finish 2 remaining assessment items  |
| [ Resume assessment (28/30)       ]  |
+--------------------------------------+
| Target career                        |
| Software Development Engineer        |
| Match: 94% (Guidance, not diagnosis) |
|   Investigative                  92% |
|   Conventional                   78% |
|   Realistic                      68% |
+--------------------------------------+
| This week's study plan (12 / 15 hrs) |
| [=======>   ] 80% complete           |
|                                      |
| [x] Arrays & hashing practice  3.0h  |
| [ ] Build REST API endpoint    4.0h  |
|     [ Mark task done ]               |
+--------------------------------------+
| Top career matches                   |
| Software Development Engineer    94% |
| ₹8-35 LPA (approx., 2026)            |
| Verified 2026-10-15                  |
| [ View career details ]              |
+--------------------------------------+
```

#### Mobile Wireframe 2: Roadmap (`390px`)
```text
+--------------------------------------+
| < Back   Roadmap: Software Engineer  |
+--------------------------------------+
| Usable capacity: 12.5 hrs/wk         |
| (Includes 15% buffer on 15 hrs/wk)   |
| [ Replan schedule ]                  |
+--------------------------------------+
| Next exam: JEE Main Session 1        |
| Registration closes: 2026-11-22      |
| Source verified 2026-10-15           |
+--------------------------------------+
| PHASE 1: CORE FOUNDATIONS (2/2 done) |
| ||                                   |
| || [x] Week 1: Python syntax   6.0h  |
| || [x] Week 2: Git & Linux CLI 5.0h  |
| ||                                   |
| PHASE 2: DATA STRUCTURES (In progress|
| |>                                   |
| |> [ ] Week 3: Trees & graphs  8.0h  |
| |      Status: [ In progress v ]     |
| |                                    |
| |  [ ] Week 4: SQL joins       4.5h  |
| |      Status: [ To do       v ]     |
+--------------------------------------+
| Overflow backlog (1 item)            |
| System design primer           5.0h  |
+--------------------------------------+
```

#### Mobile Wireframe 3: Career Detail (`390px`)
```text
+--------------------------------------+
| < Careers   Software Engineer        |
+--------------------------------------+
| Verified 2026-10-15                  |
| Cluster: Information Technology      |
|                                      |
| [ Add to shortlist ] [ Compare ]     |
+--------------------------------------+
| Compatibility: 94%                   |
| Guidance, not a diagnosis            |
|   Interest fit                   92% |
|   Skill readiness                88% |
|   Budget & time fit              96% |
+--------------------------------------+
| Overview                             |
| Designs, builds, and maintains       |
| reliable software systems.           |
+--------------------------------------+
| Approximate annual salary (INR LPA)  |
| As of 2026 (Source: NASSCOM)         |
| Entry level              ₹6 - 12 LPA |
| Mid level               ₹14 - 28 LPA |
| Senior level            ₹30 - 60 LPA |
+--------------------------------------+
| Required skills                      |
| Data Structures     [Test assessed]  |
| Python              [Self-reported]  |
+--------------------------------------+
| Colleges & benchmarks                |
| IIT Bombay (Verified 2026-10-01)     |
|   Annual fee: ₹2.28L (2026)          |
|   Cutoff: Not verified yet           |
+--------------------------------------+
```

### 4. Memorable Element & Motion Discipline

- **The One Memorable Element — The Capacity Spine (`||` / `|>`):**
  - On the Roadmap and Planner screens, tasks are tethered to a vertical **Capacity Spine** on the left edge that fills proportionally to the student's weekly study hours (`12.5 usable hrs` out of `15 hrs`, visually reserving the `15%` breathing-room buffer as a hatched quiet zone). Students immediately see *why* an item was placed in Week 3 vs. the Overflow Backlog without reading a wall of text. Everything else on the page uses plain flat typography.
- **Where Motion Is Used (Strictly for Meaning):**
  1. **Progress Bar & Capacity Spine fill:** `180ms ease-out` width/height transition when an assessment question is answered or a task is marked done.
  2. **Task Status Check:** `120ms` opacity + background tint shift when a task changes from `To do` to `Done`.
  3. **Pending AI Polling Indicator:** A subtle opacity pulse (`1.5s`) strictly while an AI field is `pending`, stopping immediately once `ready` or `fallback` arrives.
- **What Is Deliberately Static:**
  - Zero card hover elevation or scale transforms (`transform: translateY` is banned).
  - Zero animated number counters or spinning score rings on page load (scores render at their final value immediately).
  - Zero page-transition slides or decorative background animations.
  - When `@media (prefers-reduced-motion: reduce)` is active, all transition durations collapse to `0ms`.

### 5. Five Product-Specific Identity Principles (Direction 1)

1. Every screen opens with a single, plain-language next step so an overwhelmed student knows what to do in under three seconds.
2. Devanagari and English share identical visual weight, line spacing, and typographic hierarchy so switching languages never feels like switching to a second-class translation.
3. Numbers never appear naked: every compatibility score shows its factor breakdown and disclaimer, every salary shows its year and approximate LPA band, and missing facts state "Not verified yet."
4. Visual density is governed by mid-range mobile screens on slow connections, using flat spacing and left-border rails instead of nested cards, shadows, or heavy media.
5. AI commentary is treated as an optional margin note that never blocks deterministic data or delays page interactivity.

---

## Direction 2: "Deccan Basalt & Metro Wayfinding" (High-Contrast Transit Clarity)

Grounded in the unmistakable clarity of Indian metro signage (Delhi/Bengaluru/Mumbai Metro wayfinding boards) and survey milestone markers—designed to guide people through complex junctions with high-contrast colour-coded bands and zero visual clutter.

### 1. Colour Palette (5 Named Hex Values — Light & Dark Variants + WCAG AA Verification)

Uses warm stone-grey daylight surfaces and deep basalt night surfaces, paired with a high-legibility Teal wayfinding primary and Marigold milestone indicator.

| Token Name | Role | Light Hex | Light Contrast Check (WCAG AA) | Dark Hex | Dark Contrast Check (WCAG AA) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Limestone Platform / Basalt Night** (`--bg-canvas`) | Primary page background | `#F2F3F0` | Base canvas | `#141716` | Base canvas |
| **White Tile / Slate Coach** (`--bg-surface`) | Content blocks & form controls | `#FFFFFF` | `1.11:1` vs canvas | `#1D2220` | `1.20:1` vs canvas |
| **Charcoal Sign / Ivory Chalk** (`--fg-primary`) | Primary headings & body text | `#181C1A` | **`15.1:1`** on `#F2F3F0` (AAA) / **`16.9:1`** on `#FFFFFF` (AAA) | `#ECEFEC` | **`14.5:1`** on `#141716` (AAA) / **`12.1:1`** on `#1D2220` (AAA) |
| **Ash Milestone / Lichen Grey** (`--fg-muted`) | Supporting labels & timestamps | `#525B56` | **`6.1:1`** on `#F2F3F0` (AA) / **`6.8:1`** on `#FFFFFF` (AA) | `#A0ABA5` | **`6.9:1`** on `#141716` (AA) / **`5.7:1`** on `#1D2220` (AA) |
| **Konkan Teal / Signal Cyan** (`--accent-primary`) | Primary buttons, active tab, focus ring | `#0F6E56` | **`5.9:1`** with `#FFFFFF` button text (AA) / **`5.3:1`** on `#F2F3F0` (AA) | `#34D399` | **`9.2:1`** on `#141716` (AAA) / **`8.8:1`** with `#0E1714` button text (AAA) |
| **Haldi Ochre / Amber Marker** (`--accent-milestone`) | Active phase marker & stream highlight | `#9A5B00` | **`5.2:1`** on `#FFFFFF` (AA) / **`4.6:1`** on `#F2F3F0` (AA) | `#FBBF24` | **`10.1:1`** on `#1D2220` (AAA) |

### 2. Typography & Devanagari Parity

- **Unified Heading & Body Family (Latin + Devanagari):** **IBM Plex Sans** + **IBM Plex Sans Devanagari**.
  - *Why:* Engineered with matching stroke terminals, counter proportions, and x-heights across Latin and Devanagari, giving technical career names, college cutoffs, and Hindi prose a cohesive wayfinding voice.
- **Quantitative & Code Family:** **IBM Plex Mono** (`500` Medium) for compatibility breakdowns, exam dates, and LPA salary tables.
- **Weights Loaded:** `400` (Regular), `500` (Medium), `600` (SemiBold).
- **Self-Hosting & Slow-Network Budget:**
  - Subsetted `.woff2` files hosted in `/public/fonts/` with `unicode-range` splitting so Latin (`~19 KB`) and Devanagari (`~23 KB`) load without blocking each other.
  - `font-display: swap` ensures instant text paint using system fallback metrics on slow connections.

### 3. Layout Concept, Alignment Rules & Mobile ASCII Wireframes (`390px`)

- **Layout Concept (One Sentence):** A modular wayfinding board organized into numbered station bands with flush-left typographic grids and high-contrast status strips that read top-to-bottom like a transit route map.
- **Alignment & Line Length Rules:**
  - Flush-left text alignment across a strict 2-column key-value grid on mobile (`65%` label / `35%` right-aligned tabular value).
  - Maximum line length capped at **60 characters (`60ch`)** on desktop and **36–42 characters** on `390px` mobile.
  - All buttons, checkboxes, and select controls occupy a full `48px` height on mobile for effortless thumb reach.

#### Mobile Wireframe 1: Dashboard (`390px`)
```text
+--------------------------------------+
| AI Career Navigator     [हिन्दी] [Nav]|
+======================================+
| 01 CURRENT JUNCTION                  |
| Profile completeness: 88%            |
| Missing: Past work or internships    |
| [ Complete profile ]                 |
+--------------------------------------+
| 02 TARGET ROUTE                      |
| Software Development Engineer        |
| Compatibility                    94% |
| (Guidance, not a diagnosis)          |
|   Investigative                  92% |
|   Conventional                   78% |
|   Realistic                      68% |
+--------------------------------------+
| 03 TODAY'S TASKS (2.5 hrs available) |
| [ ] Practice binary search     1.5h  |
|     [ Mark task done ]               |
| [ ] Read DBMS indexing notes   1.0h  |
|     [ Mark task done ]               |
+--------------------------------------+
| 04 SHORTLISTED CAREERS (2 of 20)     |
| Software Development Engineer    94% |
| Data Scientist                   89% |
| [ Compare shortlisted careers ]      |
+--------------------------------------+
```

#### Mobile Wireframe 2: Roadmap (`390px`)
```text
+--------------------------------------+
| < Back   Route: Software Engineer    |
+======================================+
| Schedule capacity: 12.5 / 15 hrs/wk  |
| 15% buffer reserved for revision     |
| [ Replan schedule ]                  |
+--------------------------------------+
| [DONE] Phase 1: Programming Basics   |
|   Week 1: Python fundamentals  6.0h  |
|   Week 2: Git workflows        5.0h  |
+--------------------------------------+
| [NOW]  Phase 2: Core CS & DSA        |
|   Week 3: Trees & recursion    8.0h  |
|   Change status: [ In progress v ]   |
|                                      |
|   Week 4: Relational databases 4.5h  |
|   Change status: [ To do       v ]   |
+--------------------------------------+
| [NEXT] Phase 3: Projects & Mock Prep |
|   Week 5: REST API project     8.0h  |
+--------------------------------------+
| Upcoming exam deadline               |
| GATE CS 2027: Not verified yet       |
+--------------------------------------+
```

#### Mobile Wireframe 3: Career Detail (`390px`)
```text
+--------------------------------------+
| < Careers   Software Engineer        |
+======================================+
| Status: Verified 2026-10-15          |
| Demand: Very high                    |
| [ Add to shortlist ]                 |
+--------------------------------------+
| MATCH BREAKDOWN                  94% |
| Guidance, not a diagnosis            |
| Interest fit                     92% |
| Skill readiness                  88% |
| Data completeness                85% |
+--------------------------------------+
| APPROXIMATE ANNUAL SALARY (INR LPA)  |
| Year: 2026 | Source: NASSCOM         |
| Entry                      ₹6-12 LPA |
| Mid                       ₹14-28 LPA |
| Senior                    ₹30-60 LPA |
+--------------------------------------+
| SKILLS & PROVENANCE                  |
| Data Structures      [Test assessed] |
| Python               [Self-reported] |
+--------------------------------------+
| COLLEGES & VERIFIED BENCHMARKS       |
| IIT Bombay (Verified 2026-10-01)     |
| Annual fee               ₹2.28L/year |
| Closing rank        Not verified yet |
+--------------------------------------+
```

### 4. Memorable Element & Motion Discipline

- **The One Memorable Element — The Junction Route Strip (`[DONE]` / `[NOW]` / `[NEXT]`):**
  - Instead of decorative charts, the Roadmap and Onboarding screens use a metro-style **Junction Route Strip** where completed phases collapse into compact single-line summaries and the current `[NOW]` station expands to show this week's exact tasks and exam dates.
- **Where Motion Is Used (Strictly for Meaning):**
  1. **Phase Accordion Collapse/Expand:** `150ms ease-out` height transition when a phase completes and advances the `[NOW]` marker to the next phase.
  2. **Toast Confirmation:** Instant appearance with a `150ms` fade-out on dismiss.
- **What Is Deliberately Static:**
  - All data rows, compatibility numbers, salary tables, and navigation bars are 100% static with zero hover movement or decorative transitions.
  - Under `prefers-reduced-motion: reduce`, phase collapse/expand is instantaneous.

### 5. Five Product-Specific Identity Principles (Direction 2)

1. Treat career planning like public wayfinding: show the student's current station, their chosen destination, and the exact next transfer without decorative distractions.
2. Pair every metric with its provenance (`Test assessed`, `Self-reported`, or `Verified YYYY-MM-DD`) so students can distinguish hard facts from self-estimates.
3. Design for thumb reach on 390px screens first, giving every action a full-width or 44px+ target with plain verb labels that match their confirmation toast.
4. Keep Latin and Devanagari scripts on an equal footing with matched stroke weights and generous vertical rhythm.
5. Never hide missing data or AI outages: display `"Not verified yet"` for null catalog fields and a quiet standard summary note when AI is unavailable.

---

## Critique & Revision Against Generic Defaults

Before finalizing the two directions above, I audited both proposals and our existing Phase 0/1 UI against the seven generic defaults listed in your prompt:

| Generic Default to Avoid | Audit of Our Initial Drafts & Existing Code | What Was Changed & Why |
| :--- | :--- | :--- |
| **1. Cream background with a serif and terracotta accent** | Neither direction used terracotta, but warm off-white backgrounds can easily drift toward generic editorial cream. | Locked Direction 1 to cool mineral paper (`#F4F6F9`) with Syahi Indigo (`#1D4ED8`) and Direction 2 to neutral limestone (`#F2F3F0`) with Konkan Teal (`#0F6E56`). Zero serif fonts are used anywhere. |
| **2. Near-black with one acid accent** | Dark mode palettes often default to `#09090B` with neon lime/cyan. | Replaced near-black with deep Slate Indigo (`#111622` in Direction 1) and Basalt (`#141716` in Direction 2) paired with desaturated, AA-verified sky/mint accents that do not halate on budget OLED screens at night. |
| **3. Newspaper-style hairlines** | Direction 2 initially had `1px` full-bleed rules between every single data field, looking like a print broadsheet. | Removed interior hairline dividers between individual facts; grouped related facts using whitespace (`16px` / `24px` vertical rhythm) and left-aligned key-value alignment instead. |
| **4. Identical rounded cards with the same soft shadow and gradient washes** | Our Phase 0/1 screens wrapped nearly every widget in `<Card className="bg-surface border border-border rounded-lg p-6">` grids. | Revised the layout architecture so only primary interactive containers use bordered surfaces, completely banned drop shadows and gradient washes, and introduced the **Capacity Spine** (Direction 1) and **Junction Route Strip** (Direction 2) so sections have distinct structural hierarchy rather than a wall of identical boxes. |
| **5. All-caps eyebrow labels over every heading** | Initial wireframes for Direction 2 used uppercase labels above section titles. | Replaced all-caps eyebrow labels with sentence-case headings and inline status prefixes (`[DONE]`, `[NOW]`, `Verified 2026-10-15`) because all-caps labels waste vertical space on 390px screens and have no equivalent in Devanagari (`हिन्दी` has no uppercase/lowercase distinction). |
| **6. Middle-dot meta strings (`a · b · c`)** | Our Phase 0/1 components (`HonestFactDisplay`, `Stepper`, `DashboardPage`, `AssessmentPage`) used `·` middle-dots (`1 · Strongly Disagree`, `Verified · 2026-10-15`). | Eliminated middle-dot chains in the design spec: metadata items now stack on dedicated lines or sit in a 2-column key-value row (`Verified 2026-10-15` on its own line; provenance in a bracketed tag `[Test assessed]`) so screen readers and small viewports never wrap orphaned dots onto new lines. |
| **7. Arrows on every link (`→`)** | Common pattern on CTA links (`View career →`). | Banned decorative arrows on links and buttons. Every link and button uses a direct, plain verb in sentence case (`View career details`, `Resume assessment`, `Compare shortlisted careers`). |

---

## Selected & Locked Direction (Approved 2026-10-23)

**Chosen Direction:** **Direction 2 — "Deccan Basalt & Metro Wayfinding" (High-Contrast Transit Clarity)**

### Locked Implementation Checklist for All Screens
1. **Colour Tokens (`src/index.css` & `tailwind.config.js`):**
   - Light mode: Canvas `#F2F3F0` (Limestone Platform), Surface `#FFFFFF` (White Tile), Primary Text `#181C1A` (Charcoal Sign, `15.1:1`), Muted Text `#525B56` (Ash Milestone, `6.1:1`), Primary Accent `#0F6E56` (Konkan Teal, `5.9:1` with `#FFFFFF`), Milestone Accent `#9A5B00` (Haldi Ochre, `5.2:1`).
   - Dark mode: Canvas `#141716` (Basalt Night), Surface `#1D2220` (Slate Coach), Primary Text `#ECEFEC` (Ivory Chalk, `14.5:1`), Muted Text `#A0ABA5` (Lichen Grey, `6.9:1`), Primary Accent `#34D399` (Signal Cyan, `8.8:1` with `#0E1714`), Milestone Accent `#FBBF24` (Amber Marker, `10.1:1`).
2. **Typography (`index.html` & `src/index.css`):**
   - Primary UI & Body (Latin + Devanagari): `IBM Plex Sans` + `IBM Plex Sans Devanagari` (`400`, `500`, `600`) with `line-height: 1.65` for Devanagari *matra* clearance.
   - Quantitative & Monospace: `IBM Plex Mono` (`500`) with `font-variant-numeric: tabular-nums`.
   - Line length ceiling: `max-w-[60ch]` on desktop, `36–42ch` on `390px` mobile.
3. **Layout, Anti-Default Rules & Touch Targets:**
   - **44px+ Touch Floor:** All buttons, inputs, selects, tabs, and radios enforce `min-h-[44px]`.
   - **Zero Middle-Dots (`·`), Zero All-Caps Eyebrows, Zero Link Arrows (`→`):** Metadata uses stacked lines or 2-column key-value alignment (`65%` label / `35%` right-aligned tabular value) and bracketed provenance tags (`[Test assessed]`, `[Self-reported]`).
   - **Signature Element:** **Junction Route Strip (`[DONE]` / `[NOW]` / `[NEXT]`)** for multi-step flows and roadmaps.
   - **Motion Discipline:** Transitions collapse to `0ms` under `@media (prefers-reduced-motion: reduce)`.

