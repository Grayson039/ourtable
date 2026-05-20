# Our Table.

*"The recipe app built for your whole household — not just you."* Save from anywhere. Know your fridge. Cook for everyone.

---

## Project Status

| | |
|:---:|:---:|
| **Current Phase** | Phase 3 — UI Design & Asset Creation |
| **Last Updated** | May 19, 2026 |
| **Version** | 0.3.1 |

---

## What Is Our Table?

A household recipe app that solves the three friction points of home cooking: *finding* recipes you actually want to make, *knowing* what you have to cook with, and *shopping* without doubling up or missing things.

**The key differentiators:**
- **Social-first saving** — import any recipe from TikTok, Instagram, or any food blog in one tap. No manual entry.
- **Fridge Scanner** — snap your fridge and get recipes you can make right now from what's already there.
- **Household-aware** — dietary restrictions, shared grocery lists, and recipe scaling built around your whole table, not a single user.

**Direct competitor:** Paprika, Yummly, Whisk

---

## Project Phases

| Phase | Name | Status |
|:---:|:---:|:---:|
| 1 | Ideation, Competitive Analysis & Feature Differentiation | ✅ Complete |
| 2 | UX Architecture | ✅ Complete |
| 3 | UI Design & Asset Creation | 🔄 In Progress |
| 4 | Technical Architecture & Prototype Development | 🔒 Locked |
| 5 | Case Study Compilation & Portfolio Readiness | 🔒 Locked |

---

## Decision Log

Every major call made, in order. This is the paper trail for the Phase 5 case study.

### Phase 1 — Ideation & Competitive Analysis

| Date | Decision | Rationale |
|:---:|:---:|:---:|
| May 2026 | Project initiated | Gap identified: no recipe app handles household dietary diversity or social import well |
| May 2026 | Primary competitors: Paprika, Yummly, Whisk | Most feature-equivalent products. Manual entry-heavy. No social layer. |
| May 2026 | Core differentiator: social import + fridge scanner + household-awareness | Three features no single competitor has together |
| May 2026 | North Star user: household cook (2–5 person home) | Manages multiple dietary needs, shops weekly, saves recipes constantly from social media |

### Phase 2 — UX Architecture

| Date | Decision | Rationale |
|:---:|:---:|:---:|
| May 2026 | 5-tab nav: Home, Search, Fridge, List, Me | Fridge scanner elevated to primary nav — core differentiator deserves a tab |
| May 2026 | Household setup in onboarding (not settings) | Dietary conflict detection is useless without members — must be seeded early |
| May 2026 | Grocery list is shared, not personal | Primary use case is shopping for a household, not an individual |
| May 2026 | Recipe import is P0, manual add is P1 | Users will bounce if they have to type recipes. Import is the acquisition hook. |
| May 2026 | 8 MVP screens | Confirmed scope for portfolio piece |

### Phase 3 — UI Design & Asset Creation

| Date | Decision | Rationale |
|:---:|:---:|:---:|
| May 2026 | Design both themes simultaneously | Portfolio piece — dual-mode design signals craft |
| May 2026 | Primary color: Midnight Navy (#1B3A5C light / #4A8AB8 dark) | Distinctive, premium, avoids the terracotta-heavy food app cliché. Warm cream neutrals preserved. |
| May 2026 | Accent: Warm Amber (#E8A84A light / #F0B84A dark) | Complements navy, reads as "golden kitchen" warmth, ties to candlelight/warmth brand story |
| May 2026 | Deep Plum + Warm Peach palette reserved for future project | Considered but not chosen — too editorial for a kitchen utility app |
| May 2026 | Serif wordmark ("Our Table" in Georgia) | Warmth and permanence — this is a household staple, not a tech utility |
| May 2026 | Design system extracted to our-table-design-system.js | Single source of truth — all 8 screens import it. Tokens, components, nav wiring. |
| May 2026 | Component showcase built alongside screens | Validates design system consistency across light and dark |
| May 19, 2026 | Interactive prototype shell built (`our-table-prototype.html`) | All 8 screens chainable in one file — open in browser, no server needed |
| May 19, 2026 | Case study doc started (`Portfolio/our-table-case-study.html`) | Phase 5 deliverable started early — capture decisions while fresh |
| May 19, 2026 | Repo folder structure established | Design / Development / Marketing / Portfolio / Product / Research — mirrors aftershow org |

---

## Design System

### Type System

| Role | Typeface | Usage |
|:---:|:---:|:---:|
| Wordmark | Georgia (serif) | "Our Table" logo only |
| UI / Body | -apple-system / Segoe UI (system sans) | All interface text |

### Color Tokens

#### Light Mode — Warm Kitchen

| Token | Hex | Usage |
|:---:|:---:|:---:|
| bg | #FAF7F0 | App background |
| card | #FFFFFF | Cards, elevated surfaces |
| primary | #1B3A5C | Midnight Navy — CTAs, active states, wordmark |
| secondary | #E8A84A | Warm Amber — accents, dietary tags, secondary actions |
| text | #2C2416 | All primary text |
| muted | #8A7060 | Subtitles, metadata |
| border | #E8DDD5 | Dividers, card outlines |
| chip | #E8EFF6 | Filter chips, tag backgrounds |
| chipTx | #5A7090 | Filter chip text |

#### Dark Mode — Midnight Kitchen

| Token | Hex | Usage |
|:---:|:---:|:---:|
| bg | #1C1917 | App background |
| card | #2E2A27 | Cards, elevated surfaces |
| primary | #4A8AB8 | Navy (lightened for dark bg contrast) — CTAs, active states |
| secondary | #F0B84A | Amber (brightened) — accents, dietary tags |
| text | #FEFAF6 | All primary text |
| muted | #C8BAB2 | Subtitles, metadata |
| border | rgba(255,255,255,0.15) | Dividers, card outlines |
| chip | #1E2A38 | Filter chip backgrounds |
| chipTx | #90AACA | Filter chip text |

---

## Information Architecture

### Navigation (5 Tabs)

| Tab | Name | MVP Screens |
|:---:|:---:|:---:|
| 1 | Home | Home Feed, Search Results, My Recipes (Library) |
| 2 | Search | Discover, Search Results |
| 3 | Fridge | Fridge Scanner, Pantry |
| 4 | List | Grocery List |
| 5 | Me | Profile, Settings |

### MVP Screen Count: 8

---

## Screen Inventory

| File | Screen | Status |
|:---:|:---:|:---:|
| `screens/01-auth-onboarding.html` | Auth & Onboarding (Welcome → Sign In → Create Account → Household Setup) | ✅ Done |
| `screens/02-home-search-library.html` | Home, Search, Search Results, My Recipes Library | ✅ Done |
| `screens/03-recipe-detail.html` | Recipe Detail & Cooking Mode | ✅ Done |
| `screens/04-add-recipe.html` | Add Recipe (import + manual) | ✅ Done |
| `screens/05-fridge-pantry.html` | Fridge Scanner & Pantry | ✅ Done |
| `screens/06-grocery-list.html` | Grocery List (shared) | ✅ Done |
| `screens/07-profile-settings.html` | Profile & Settings | ✅ Done |
| `screens/08-recipe-book.html` | Recipe Book / Collections | ✅ Done |
| `our-table-prototype.html` | **Interactive Prototype Shell** (all screens linked) | ✅ Done |

---

## Repo Structure

```
Our Table/
├── screens/                  # Individual screen HTML files (01–08)
├── Design/                   # Design assets, Figma exports, mockups
├── Development/              # Code — cookbook-pwa and future builds
│   └── cookbook-pwa/         # Early PWA prototype
├── Marketing/                # Demo videos, social assets
│   └── OurTable netlift v1.mp4
├── Portfolio/                # Case study, presentation docs
│   └── our-table-case-study.html
├── Product/                  # PRDs, specs, roadmap docs
├── Research/                 # Competitor screenshots, reference images
├── our-table-design-system.js        # Design tokens + component library
├── our-table-prototype.html          # Interactive prototype (open in browser)
├── our-table-components-showcase.html
├── our_table_light_dark_mockup.html
├── README.md
└── CLAUDE.md
```

---

## User Personas

| Persona | Archetype | Priority | Key Need |
|:---:|:---:|:---:|:---:|
| Will, 28 | The Household Cook | ★ North Star | Manages 3-person home, saves TikTok recipes constantly, hates grocery overlap |
| Jordan, 34 | The Dietary Juggler | Secondary | Partner is vegetarian, one kid is nut-free — needs conflict detection |
| Sam, 25 | The Solo Cook | Edge Case | Lives alone, uses fridge scanner to reduce food waste |

---

## Feature Priority

| Feature | Priority | Notes |
|:---:|:---:|:---:|
| Social Recipe Import (TikTok, Instagram, web) | P0 — MVP | Core acquisition hook. No manual entry required. |
| Fridge Scanner → Recipe Suggestions | P0 — MVP | Core differentiator. Snap fridge → instant recipe ideas from on-hand ingredients. |
| Shared Grocery List | P0 — MVP | Household-aware. Items grouped by recipe. Checked items sync across members. |
| Household Setup & Dietary Tracking | P0 — MVP | Members + dietary flags. Powers conflict detection on recipes. |
| Recipe Library / Collections | P0 — MVP | Saved recipes organized by user. Sortable. Filterable. |
| Cooking Mode (step-by-step) | P0 — MVP | Screen-on, step-through view. Timer integration. |
| Recipe Detail | P0 — MVP | Ingredients, steps, servings adjuster, add to grocery list. |
| Dietary Conflict Detection | P1 | Auto-flag recipes incompatible with a household member's needs. |
| Recipe Scaling | P1 | Adjust servings → recalculate ingredients + grocery quantities. |
| Meal Planning | P2 | Weekly calendar. Drag recipes in. Auto-generates grocery list. |
| AI Recipe Suggestions | v1.1 | "What can I make with these 5 ingredients?" Claude API. |

---

## Tech Stack (Provisional — Confirmed in Phase 4)

| Layer | Decision | Notes |
|:---:|:---:|:---:|
| Framework | React Native | Cross-platform mobile |
| Recipe Import | Custom URL parser + OpenGraph scraping | TikTok/Instagram/web |
| Image Recognition | TBD (Google Vision or Apple Vision) | Fridge scanner |
| AI Layer | Claude API (Anthropic) | Ingredient suggestions, recipe Q&A. v1.1 feature. |

---

## Workflow Rules

1. Maintain this README as a living document — update at every major milestone.
2. Do not proceed to a new phase without announcing the transition, updating this log, and confirming readiness.
3. Phase gates are hard stops. No skipping.

---

## Integrations

- **GitHub** — repo, prototype code, version history

---

*OUR TABLE · Concept Stage · May 2026 · Everyone eats.*
