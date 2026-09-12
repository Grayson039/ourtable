# Our Table

*"The recipe app built for your whole household — not just you."*
Save from anywhere. Know your fridge. Cook for everyone.

---

## What Is Our Table?

A household recipe app that solves three friction points of home cooking: *finding* recipes you want to make, *knowing* what you have to cook with, and *shopping* without doubling up or missing things.

**Key differentiators:**
- **Social-first saving** — import any recipe from TikTok, Instagram, or any food blog in one tap
- **Fridge Scanner** — snap your fridge and get recipes from what's already there
- **Household-aware** — dietary restrictions, shared grocery lists, and recipe scaling for your whole table

**Competitors benchmarked:** Paprika, Yummly, Whisk

---

## Team

- **Will** — product design, direction
- **Sako** — iOS developer
- **KC** — iOS developer

---

## Design Source of Truth

**Figma — App Screens:**
https://www.figma.com/design/Vs0zU1mofREJsOzzmMT65t/Kitchen-Bandits-%E2%80%94-App-Screens

(Figma file is still under its working title — rename when convenient.)

## Locked Design System

| Token | Hex |
|---|---|
| Coral (primary) | `#FC3E57` |
| Sage (secondary/success) | `#5BC18A` |
| Ink (black) | `#000000` |
| Cream (background) | `#FAF7F0` |
| Card (white) | `#FFFFFF` |

---

## Phase Status

| Phase | Name | Status |
|---|---|---|
| 1 | Ideation & Competitive Analysis | ✅ Complete |
| 2 | UX Architecture | ✅ Complete |
| 3 | UI Design & Asset Creation | ✅ Complete |
| 4 | React Native Build | ✅ Complete |
| 5 | Backend Integration (Supabase) | ✅ Complete |
| 5.5 | Repo hygiene (gitignore, dead `screens/` removed, moved out of OneDrive) | ✅ Complete |
| 6 | EAS Build & Device Testing | 🔄 Next |
| 7 | iOS Build with Sako & KC | 🔒 Locked |
| 8 | Case Study & Portfolio Readiness | 🔒 Locked |

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | React Native (Expo SDK 56) |
| Navigation | Expo Router v4 |
| Language | TypeScript |
| Backend | Supabase (Postgres + Auth + Realtime) |
| Recipe Import | Spoonacular API + custom scraper |
| Image Recognition | Google Vision API |
| AI Layer | Claude API |
| Deployment | EAS Build → App Store + Google Play |

---

## Repo Structure

```
OurTable/                         ← root
├── screens-new/                  ← WORKING APP — use this
├── Design/                       ← Design assets + earlier-era HTML prototypes
├── Portfolio/                    ← Case study assets (Phase 8)
├── _Archive/                     ← Research, Product, Marketing docs
├── README.md
├── CLAUDE.md
└── HANDOFF.md
```

---

*OUR TABLE · Everyone eats.*
