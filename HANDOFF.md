# OUR TABLE — Session Handoff

*Last updated: 2026-09-12*

---

## Start Here

**Tell Claude:** "Continue Our Table. Read HANDOFF.md. We need to do an EAS build to get the app on Michelle's phone."

---

## Phase Status

- Phase 1–3: ✅ Complete (ideation, UX, design)
- Phase 4: ✅ Complete (all screens scaffolded)
- Phase 5: ✅ Complete — Supabase backend fully wired
- Phase 5.5: ✅ Complete — repo hygiene fixed: added root `.gitignore`, deleted the dead `screens/` scaffold, moved the whole project out of OneDrive-synced storage (see below), relocked palette to coral/sage/cream, `screens-new/` committed to git for the first time (it had never been tracked before)
- Phase 6: 🔄 Next — EAS Build & device testing (Michelle's phone)
- Phase 7: 🔒 iOS build with Sako & KC
- Phase 8: 🔒 Case Study & Portfolio Readiness

---

## Design Source of Truth

**Figma — App Screens:**
https://www.figma.com/design/Vs0zU1mofREJsOzzmMT65t/Kitchen-Bandits-%E2%80%94-App-Screens

(Figma file still carries its working title — rename when convenient.)
HTML prototypes in this repo are earlier-era. Reference only.

---

## WHERE THE APP LIVES

Working app:
```
C:\Dev\OurTable\screens-new\
```

Moved here from `C:\Users\Will\OneDrive\Desktop\Our Table\screens-new\` on 2026-09-12 — the project used to
live inside OneDrive-redirected Desktop, which fights git/npm over the thousands of files in `node_modules`
and is a real corruption/slowdown risk. Same GitHub remote (`Grayson039/ourtable`), new local path only.
`node_modules` was excluded from the move and reinstalled fresh with `npm install` at the new location.

The old `screens/` scaffold (broken, DO NOT USE) has been deleted entirely — `screens-new/` is now the only app.

---

## EAS Build — What To Do Next

1. Make sure Will has a free account at expo.dev
2. `cd` into `screens-new/`
3. `npm install -g eas-cli`
4. `eas login`
5. `eas build:configure`
6. `eas build --platform ios --profile development`
7. Install on Michelle's phone via TestFlight or direct link

---

## Supabase Project

- URL: `https://bpkqiimhlpzkycxyncjk.supabase.co`
- Anon key: `sb_publishable_6EskZ_CzgCcQc6hdnrX-tQ_pwrDbPtt`
- Schema: ✅ Deployed
- `.env`: ✅ at `screens-new/.env` (gitignored — was never tracked, stays that way)

---

## Source File Structure (screens-new/)

```
screens-new/
├── src/
│   ├── app/              ← Expo Router root (auto-detected via top-level src/ dir)
│   │   ├── index.tsx     ← ⚠️ unused default Expo template route, see Known Issues
│   │   ├── explore.tsx   ← ⚠️ unused default Expo template route, see Known Issues
│   │   ├── _layout.tsx
│   │   └── app/          ← ⚠️ the REAL app lives one level down, under /app/...
│   │       ├── (auth)/
│   │       ├── (tabs)/
│   │       ├── recipe/[id].tsx
│   │       └── add-recipe/
│   ├── components/       ← RecipeCard, GroceryItem, Button, Input
│   │                        ⚠️ also nested: components/components/ — duplicate, needs flattening
│   ├── constants/         ← ⚠️ TWO theme.ts files, see Known Issues
│   │   └── constants/     ← the REAL theme.ts + data.ts live here
│   ├── context/          ← AuthContext.tsx
│   ├── lib/              ← supabase.ts, recipes.ts, grocery.ts, fridge.ts, household.ts
│   └── types/            ← index.ts (full DB type map)
├── supabase/
│   └── migrations/001_schema.sql
├── assets/
├── .env
├── app.json
├── babel.config.js
├── package.json
└── node_modules/
```

---

## Known Issues (found 2026-09-12, not yet fixed)

1. **Duplicate/nested folders from a messy merge** — `src/app/app/`, `src/components/components/`,
   `src/constants/constants/` all exist one level deeper than expected. Every screen currently imports from
   the nested paths (e.g. `@/constants/theme` resolving to `src/constants/theme.ts`, NOT the nested
   `src/constants/constants/theme.ts` where the real design system lives — **this needs verifying against a
   running build**, since if the alias really resolves to the shallow file, every screen's colors/spacing/radius
   tokens are silently undefined).
2. **`src/app/index.tsx` and `src/app/explore.tsx`** are the unused default Expo Router template routes
   (landing on `/` currently shows the Expo boilerplate, not the Our Table welcome screen) — the real app only
   exists under `/app/...`. Needs a root redirect or a restructure so `src/app/` IS the real route tree.
3. Should NOT block Phase 6, but should be fixed before Phase 7 (external iOS build with Sako & KC) so they
   aren't inheriting a confusing structure.

---

## DO NOT

- Run `npm audit fix --force` — breaks deps
- Delete `screens-new/node_modules` — clean install
- Use Expo Go — SDK 56 not supported
- Commit whole-app HTML/JS export snapshots into git (this repo's `.git` already carries some from before —
  left alone rather than rewriting history, but don't add more)
- Develop from inside a OneDrive/Dropbox/Google Drive–synced folder
