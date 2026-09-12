# OUR TABLE — Claude Code Project Instructions

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

(Filed under its working title in Figma — rename the file when convenient. Project name is locked back to **Our Table**.)
HTML prototypes in this repo are earlier-era references only.

---

## Locked Design System

| Token | Hex |
|---|---|
| Coral (primary) | `#FC3E57` |
| Sage (secondary/success) | `#5BC18A` |
| Ink (black) | `#000000` |
| Cream (background) | `#FAF7F0` |
| Card (white) | `#FFFFFF` |

Defined in `screens-new/src/constants/constants/theme.ts` — see note under "Known Issue" below about the import path.

---

## Phase Status

| Phase | Name | Status |
|---|---|---|
| 1 | Ideation, Competitive Analysis & Feature Differentiation | ✅ Complete |
| 2 | UX Architecture | ✅ Complete |
| 3 | UI Design & Asset Creation | ✅ Complete |
| 4 | React Native Build | ✅ Complete |
| 5 | Backend Integration (Supabase) | ✅ Complete |
| 5.5 | Repo hygiene: gitignore, dead `screens/` removed, moved out of OneDrive, palette relocked to Our Table | ✅ Complete |
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

## Known Issue

Every screen imports `Colors`/`Radius`/`FontSize`/`Shadow` from `@/constants/theme`, which per `tsconfig.json`
(`"@/*": ["./src/*"]`) resolves to `src/constants/theme.ts` — a near-empty leftover Expo template file, NOT
`src/constants/constants/theme.ts` where the real design system (and the locked palette) actually lives. This
needs verifying against a running build and fixing (most likely: consolidate to one theme file at the
alias-correct path) before relying on any color/spacing token rendering correctly.

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

*OUR TABLE · Everyone eats.*
