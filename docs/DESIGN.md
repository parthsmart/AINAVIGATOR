# AI Navigator visual identity proposals

AI Navigator helps Indian students aged 15–22 move from “I don’t know what to do” to one clear next step. The identity should feel calm on a mid-range Android phone, remain legible on slow data, and make uncertainty feel manageable rather than dramatic.

## Direction A — Signal Path

A clear, optimistic study tool built around a single visual idea: progress is a path that becomes more specific as the student learns about themselves.

### Colour

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| Canvas / `mist` | `#F4F7F5` | `#17211F` | Page background |
| Ink / `charcoal` | `#182321` | `#F1F5F2` | Primary text |
| Quiet / `slate` | `#5B6B68` | `#AABAB5` | Supporting text |
| Path / `teal` | `#0B766E` | `#63C8B8` | Active progress and links |
| Signal / `marigold` | `#C66B16` | `#F2B35D` | Attention, not decoration |
| Surface / `cloud` | `#FFFFFF` | `#22302D` | Raised sections and controls |

**Contrast check:** light `charcoal` on `mist` is approximately 13:1; dark `ink` on `charcoal`-adjacent `mist` is approximately 12:1. `teal` on `cloud` is approximately 5.1:1 in light mode, and `#63C8B8` on `#17211F` is above 8:1 in dark mode. `marigold` is reserved for large text, icons, borders, and filled controls with dark text; it is not used for small text on white.

### Type

- **Primary:** `Atkinson Hyperlegible`, with `Noto Sans Devanagari` as the explicit Hindi companion. Both have open, distinguishable letterforms and strong small-screen readability.
- **Weights:** 400 body, 500 labels, 600 headings, 700 only for the current milestone or key action.
- **Self-hosting:** bundle the Latin and Devanagari subsets through `@fontsource-variable/atkinson-hyperlegible` and `@fontsource-variable/noto-sans-devanagari`; preload only the regular and semibold subsets used above the fold. No runtime font CDN dependency.

### Layout concept

A vertical reading rail keeps the current decision at the top, then shows one recommended action before optional detail; every screen aligns to the same left edge and stays under 68 characters per line.

Mobile dashboard:

```text
┌──────────────────────────┐
│ AI Navigator       ☰     │
│                          │
│ Good evening, Asha       │
│ Your next step           │
│ ┌──────────────────────┐ │
│ │ Compare 2 pathways   │ │
│ │ 8 min · Continue  →  │ │
│ └──────────────────────┘ │
│                          │
│ Your path               │
│ ● Understand strengths   │
│ │                       │
│ ○ Explore 3 careers     │
│ ○ Choose a small test  │
│                          │
│ Home  Path  Saved  Me    │
└──────────────────────────┘
```

Mobile roadmap:

```text
┌──────────────────────────┐
│ ← Roadmap                │
│                          │
│ From curious to ready    │
│ 2 of 5 steps complete    │
│                          │
│ ● Know yourself          │
│ │  completed             │
│ ● Notice patterns        │
│ │  completed             │
│ ◉ Compare pathways       │
│ │  current · 8 min       │
│ ○ Try one small thing    │
│ ○ Make a plan            │
│                          │
│ [ Continue this step ]   │
└──────────────────────────┘
```

Mobile career detail:

```text
┌──────────────────────────┐
│ ← Career detail          │
│                          │
│ Product designer         │
│ Turns needs into useful  │
│ digital experiences.     │
│                          │
│ A good fit if you like   │
│ noticing + making        │
│                          │
│ Start small              │
│ [ Try a 20-min activity ]│
│                          │
│ Learn next               │
│ Skills · Workday · Paths │
└──────────────────────────┘
```

Alignment rules: use one 16px page gutter on small phones, 24px above 400px, and a centered content column capped at 720px on larger screens. Align headings, progress markers, controls, and text to the same content edge; use flexible columns rather than fixed-width panels. Keep body lines under 68 characters and never exceed 80 characters for any reading measure.

### Memorable element, motion, and stillness

The memorable element is the **Signal Path**: a thin, tactile route with five named milestones, where the current node is a quiet ring and completed nodes become solid. Motion is limited to the path drawing forward after a completed action, the current node changing state, and a short completion confirmation; respect `prefers-reduced-motion`. Cards, backgrounds, illustrations, navigation, and text remain deliberately static.

### Principles

1. AI Navigator should make a student feel oriented before it asks them to make a decision.
2. The interface names one useful next step instead of presenting an intimidating catalogue of careers.
3. Hindi and English share the same hierarchy, spacing, and visual importance rather than treating Hindi as a translation afterthought.
4. Progress is visible as earned movement, not as a score or judgement about the student.
5. Every visual accent should help a student notice status, choice, or reassurance.

### Critique and revision

This direction deliberately rejects the generic cream/serif/terracotta combination: its cool mist, teal path, and readable sans pair better fit a practical guidance tool. It is not near-black with one acid accent; dark mode uses a green-charcoal canvas and two functional accents. There are no newspaper hairlines, gradient washes, or identical soft-shadow cards: hierarchy comes from spacing, a single raised surface treatment, and the path itself. Labels use sentence case, not all-caps eyebrows; metadata uses short phrases rather than middle-dot strings; links use verbs and do not receive automatic arrows.

## Direction B — Courtyard Light

A warmer, more human direction inspired by the feeling of an open school courtyard: shade, sunlight, and a few carefully placed objects that invite conversation without becoming playful or childish.

### Colour

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| Canvas / `sand` | `#F6F1E8` | `#202426` | Page background |
| Ink / `ink` | `#23272A` | `#F6F1E8` | Primary text |
| Quiet / `stone` | `#6D716D` | `#B7B8AD` | Supporting text |
| Shade / `indigo` | `#394B63` | `#9FB8D1` | Navigation and emphasis |
| Leaf / `guava` | `#38745D` | `#79C09A` | Confidence and completion |
| Sun / `saffron` | `#B66A12` | `#E6AE58` | Prompt and focus |

**Contrast check:** `ink` on `sand` is approximately 11:1; `indigo` on `sand` is approximately 7.3:1; `leaf` on `sand` is approximately 5.2:1. In dark mode, `ink` on `sand` and `indigo` on `#202426` both exceed 8:1, while `saffron` is used with dark ink in filled controls rather than as small text on the dark canvas.

### Type

- **Primary:** `Plus Jakarta Sans`, with `Noto Sans Devanagari` for Hindi. The rounded-but-precise sans gives warmth without using a display serif or childish bubble forms.
- **Weights:** 400 body, 500 navigation, 600 section headings, 700 only for the question or recommended action.
- **Self-hosting:** package the Latin and Devanagari subsets using `@fontsource-variable/plus-jakarta-sans` and `@fontsource-variable/noto-sans-devanagari`; serve local WOFF2 files with `font-display: swap`, and preload no more than one primary face per route.

### Layout concept

A quiet editorial stack alternates full-width questions with small practical answers, using generous vertical breathing room while keeping all copy under 64 characters per line.

Mobile dashboard:

```text
┌──────────────────────────┐
│ AI Navigator       ☰     │
│                          │
│ What feels possible      │
│ today?                   │
│                          │
│ One useful thing to do   │
│ [ See your first route ] │
│                          │
│ A little context         │
│ You have explored 2     │
│ interests.               │
│                          │
│ Continue exploring       │
│ Design · Health · Tech   │
│                          │
│ Home  Explore  Plan  Me  │
└──────────────────────────┘
```

Mobile roadmap:

```text
┌──────────────────────────┐
│ ← Your route             │
│                          │
│ Start with a question    │
│ Then test what fits.     │
│                          │
│ 01  Notice               │
│     done                 │
│ 02  Compare              │
│     now · 8 min          │
│ 03  Try                  │
│     next                 │
│ 04  Reflect              │
│ 05  Decide               │
│                          │
│ [ Open compare activity ]│
└──────────────────────────┘
```

Mobile career detail:

```text
┌──────────────────────────┐
│ ← Explore a career      │
│                          │
│ Public health            │
│ Help communities live   │
│ healthier lives.        │
│                          │
│ You may enjoy this if…  │
│ people · evidence ·     │
│ practical change        │
│                          │
│ A low-risk way to test  │
│ [ Read one real story ]  │
│                          │
│ What to notice           │
│ Work · Skills · Study   │
└──────────────────────────┘
```

Alignment rules: use a single left edge for reading, but allow the question block to breathe to the full gutter width. Use a 20px mobile gutter, a 28px gutter on wider phones, and a 680px maximum content column. Use flexbox for stacked actions and CSS grid only for short comparison rows; keep every reading measure under 64 characters and never above 80 characters.

### Memorable element, motion, and stillness

The memorable element is the **Courtyard Bench**: a simple horizontal “try this” strip that appears after an insight and offers one low-risk activity, one real-world story, or one conversation prompt. Motion only reveals that strip after a student completes a reflection, changes a roadmap state, or confirms a saved activity; it never animates continuously. Typography, navigation, background fields, and career facts remain still so the experience feels dependable on slow devices.

### Principles

1. The product should sound like a thoughtful older peer, not a test, a school notice, or a corporate recruiter.
2. A career is introduced through a lived activity or question before it is described as a job title.
3. Warmth comes from pacing, language, and useful invitations rather than illustrations or decoration.
4. The design gives uncertainty a safe place to sit while still offering a concrete next move.
5. The visual system should work equally well for a student reading quickly in English or carefully in Hindi.

### Critique and revision

This direction avoids the default cream-plus-serif recipe by using sand only as a neutral field, a sans family, and indigo/leaf as functional anchors. It avoids near-black with acid green by using a softer charcoal dark mode and a restrained three-accent system. It has no hairline newspaper grid, gradient wash, repeated rounded-card pattern, or universal shadow; sections are separated primarily by whitespace and short rules used only where structure needs help. Headings use sentence case, metadata is written as readable phrases, and arrows appear only when the destination is genuinely navigational.

## Decision point

Both directions keep the content calm, mobile-first, bilingual by design, and intentionally light on assets and motion. **Signal Path** makes progress and next-step clarity the strongest brand memory; **Courtyard Light** makes reassurance and low-risk exploration the strongest memory. Choose one direction before implementation so colour tokens, type packages, and the roadmap component do not drift between them.
