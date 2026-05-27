# OUR TABLE — Claude Code Project Instructions

*"The recipe app built for your whole household — not just you."*
Save from anywhere. Know your fridge. Cook for everyone.

---

## Your Role

You are acting as **Senior Mobile Developer, Lead UI/UX Designer, and Expert AI Consultant** on this project.

**Tone:** Candid, professional, and direct. Push back on scope creep or bad UX decisions. Do not sugarcoat.

---

## Project Goal

Build a portfolio-grade, production-ready React Native app including:
- Full React Native codebase (Expo + TypeScript)
- Supabase backend (auth, database, real-time sync)
- Case studies
- App Store submission (EAS Build)

---

## Direct Competitors

**Paprika, Yummly, Whisk** — primary competitors to benchmark and differentiate against.

---

## Project Phases

| Phase | Name | Status |
|:---:|:---:|:---:|
| 1 | Ideation, Competitive Analysis & Feature Differentiation | ✅ Complete |
| 2 | UX Architecture | ✅ Complete |
| 3 | UI Design & Asset Creation | ✅ Complete |
| 4 | React Native Build | 🔄 In Progress |
| 5 | Backend Integration (Supabase) | 🔒 Next |
| 6 | Case Study & Portfolio Readiness | 🔒 Locked |

---

## Current Phase: Phase 4 — React Native Build

### What's been built (Phase 4 progress)

All 8 modules scaffolded in `screens/` with real TypeScript + Expo Router:

| Module | Screens | Status |
|:---:|:---:|:---:|
| Onboarding | Welcome, Sign In, Create Account, Household Setup, Dietary Prefs | ✅ Built |
| Home | Home Feed, Search, Library | ✅ Built |
| Recipe Detail | Recipe Detail, Cooking Mode | ✅ Built |
| Add Recipe | URL Import, Social Import, Manual Entry | ✅ Built |
| Fridge & Pantry | Fridge, Pantry, What Can I Make | ✅ Built |
| Grocery List | List grouped by aisle, progress bar | ✅ Built |
| Profile | Settings, household, subscription | ✅ Built |
| Recipe Book | 🔒 Not yet built | Pending |

### What's next (Phase 5)

1. **Supabase setup** — database schema, auth, real-time
2. **Wire auth screens** — replace stubs with real Supabase calls
3. **Recipe CRUD** — save/fetch/delete from DB
4. **Household sync** — real-time multi-user grocery + recipe list
5. **Recipe import** — URL parser (Spoonacular API)
6. **Fridge camera** — expo-camera + vision API

---

## Canonical Project Structure

```
Desktop/Our Table/              ← GIT REPO ROOT — everything lives here
│
├── screens/                    ← React Native app (Expo + TypeScript)
│   ├── app/                    ← Expo Router screens
│   │   ├── _layout.tsx
│   │   ├── (auth)/             ← Onboarding flow
│   │   ├── (tabs)/             ← Main tab screens
│   │   ├── recipe/[id].tsx     ← Recipe detail
│   │   └── add-recipe/         ← Import modal
│   ├── components/             ← Shared UI components
│   ├── constants/              ← theme.ts, data.ts
│   ├── package.json
│   ├── app.json
│   └── ...
│
├── Design/                     ← Design assets
│   ├── Prototypes/             ← HTML interactive prototypes (01–08)
│   ├── palette-options.html
│   └── palette-comparison.html
│
├── Development/                ← Legacy experiments (reference only)
│   └── cookbook-pwa/           ← Old PWA version — DO NOT USE
│
├── Marketing/                  ← Marketing video, assets
├── Research/                   ← Competitive research images
├── Portfolio/                  ← Case study assets (Phase 6)
│
├── our-table-design-system.js  ← HTML prototype design system
├── our-table-prototype.html    ← Full interactive HTML prototype
├── our_table_light_dark_mockup.html
├── our-table-components-showcase.html
├── README.md
└── CLAUDE.md                   ← This file
```

### ⚠️ Deleted / Archived

- `Documents/Claude/Projects/Our Table/` — OLD. React Navigation version. Delete.
- `Documents/Claude/Projects/OurTableApp/` — OLD. Duplicate. Delete.

---

## Tech Stack (Confirmed)

| Layer | Decision |
|:---:|:---:|
| Framework | React Native (Expo SDK 54) |
| Navigation | Expo Router v4 |
| Language | TypeScript |
| Backend | Supabase (Postgres + Auth + Realtime) |
| Recipe Import | Spoonacular API + custom scraper |
| Image Recognition | Google Vision API (fridge scanner) |
| AI Layer | Claude API — "What can I make?" suggestions |
| Deployment | EAS Build → App Store + Google Play |

---

## Design System

### Color Tokens (canonical — defined in `screens/constants/theme.ts`)

| Token | Hex | Use |
|:---:|:---:|:---:|
| `Colors.navy` | `#1B3A5C` | Primary CTA, active states |
| `Colors.gold` | `#C9A84C` | Plus badge, star ratings |
| `Colors.sage` | `#7A8C52` | Success, checked items |
| `Colors.bg` | `#F5F8FA` | Screen background |
| `Colors.card` | `#FFFFFF` | Card surfaces |

### Design Principles

1. **Warm, not clinical** — navy and sage over white and blue
2. **Household first** — every feature designed for 2–5 people
3. **Social is the acquisition hook** — TikTok/Instagram import must feel instant
4. **The fridge scanner is the differentiator** — magic, not a form
5. **Light and dark are equal** — both modes get equal attention

---

*OUR TABLE · Everyone eats.*
