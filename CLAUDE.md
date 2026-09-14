# OURTABLE — Claude Code Project Instructions

*"The recipe app built for your whole household — not just you."*

---

## Your Role

Senior Mobile Developer, Lead UI/UX Designer, and Expert AI Consultant.

**Tone:** Candid, professional, direct. Push back on scope creep or bad UX decisions. Do not sugarcoat.

---

## Team

- **Will** — product design, direction
- **Sako** — iOS developer
- **KC** — iOS developer

---

## Project Goal

Production-ready React Native app:
- Full React Native codebase (Expo + TypeScript)
- Supabase backend (auth, database, real-time sync)
- EAS Build → App Store submission

---

## Design Source of Truth

**Figma — App Screens:**
https://www.figma.com/design/Vs0zU1mofREJsOzzmMT65t/Kitchen-Bandits-%E2%80%94-App-Screens

(Filed under its working title in Figma — rename the file when convenient. Project name is locked back to **OurTable**.)
HTML prototypes in this repo are earlier-era references only.

---

## Locked Design System

| Token | Hex |
|---|---|
| Teal (primary) | `#3D7A8A` |
| Brick (secondary/accent) | `#A33636` |
| Charcoal (ink/text) | `#3B4653` |
| Cream (background) | `#F4EFDC` |
| Card (white) | `#FFFFFF` |

Defined in `screens-new/src/constants/theme.ts`. Matches the actual logo mark (teal cloche, brick-red house,
charcoal table/wordmark, cream background) — this replaced an earlier coral/sage placeholder palette on
2026-09-13 once the real logo was finalized.

---

## Phase Status

| Phase | Name | Status |
|---|---|---|
| 1 | Ideation, Competitive Analysis & Feature Differentiation | ✅ Complete |
| 2 | UX Architecture | ✅ Complete |
| 3 | UI Design & Asset Creation | ✅ Complete |
| 4 | React Native Build | ✅ Complete |
| 5 | Backend Integration (Supabase) | ✅ Complete |
| 5.5 | Repo hygiene: gitignore, dead `screens/` removed, moved out of OneDrive | ✅ Complete |
| 5.6 | First real boot: flattened nested app/app, components/components, constants/constants; installed missing @expo/vector-icons | ✅ Complete |
| 5.7 | Palette relocked to match the final logo (teal/brick/charcoal/cream, replacing the coral/sage placeholder) | ✅ Complete |
| 6 | EAS Build & Device Testing | 🔄 Next |
| 7 | iOS Build with Sako & KC | 🔒 Locked |
| 8 | Case Study & Portfolio Readiness | 🔒 Locked |

---

## WHERE THE APP LIVES — READ THIS FIRST

Working app is in:
```
C:\Dev\OurTable\screens-new\
```

Moved out of OneDrive-synced storage (was `C:\Users\Will\OneDrive\Desktop\Our Table\`) to stop cloud-sync from
fighting git/npm over the node_modules tree. Same GitHub remote (`Grayson039/ourtable`), new local path only.

`screens-new/` has:
- ✅ Clean deps installed (node_modules present, working)
- ✅ Expo SDK 56 + correct package versions
- ✅ All source files in `src/`
- ✅ Supabase credentials in `.env`
- ✅ app.json configured correctly

---

## Known Issues — none currently open

The nested-folder/theme-resolution bug that used to live here was fixed 2026-09-12 (see Phase 5.6 history) —
`src/constants/theme.ts` is the one real theme file now, no duplicate nested copy.

---

## Supabase Project

- URL: `https://bpkqiimhlpzkycxyncjk.supabase.co`
- Anon key: `sb_publishable_6EskZ_CzgCcQc6hdnrX-tQ_pwrDbPtt`
- Schema: ✅ Deployed
- `.env`: ✅ at `screens-new/.env` (gitignored — not tracked)

---

## Tech Stack

| Layer | Decision |
|---|---|
| Framework | React Native (Expo SDK 56) |
| Navigation | Expo Router v4 |
| Language | TypeScript |
| Backend | Supabase (Postgres + Auth + Realtime) |
| Recipe Import | Spoonacular API + custom scraper |
| Image Recognition | Google Vision API (fridge scanner) |
| AI Layer | Claude API — recipe suggestions |
| Deployment | EAS Build → App Store + Google Play |

---

## DO NOT

- Run `npm audit fix --force` — breaks deps
- Delete `screens-new/node_modules` — clean install
- Use Expo Go — SDK 56 not supported
- Commit whole-app HTML/JS export snapshots into git — export those outside the repo (e.g. for a case study) instead
- Develop from inside a OneDrive/Dropbox/Google Drive–synced folder — see Phase 5.5

---

*OURTABLE · Everyone eats.*
