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
- Phase 5.6: ✅ Complete — **the app was booted for the first time ever** and was completely broken (see Known
  Issues below, all now fixed): nested duplicate folders flattened, missing `@expo/vector-icons` dependency
  installed, hardcoded old-palette hex literals re-hued. Verified end-to-end in Expo web: welcome →
  create-account render correctly with the real coral/cream palette, icons, and Playfair/Inter fonts.
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
│   │   ├── _layout.tsx   ← AuthProvider + auth-gated routing
│   │   ├── (auth)/       ← welcome, sign-in, create-account, dietary-prefs, household-setup
│   │   ├── (tabs)/       ← index, search, recipe-book, fridge, grocery, profile
│   │   ├── recipe/[id].tsx
│   │   └── add-recipe/
│   ├── components/       ← RecipeCard, GroceryItem, ui/Button, ui/Input
│   ├── constants/        ← theme.ts (locked palette), data.ts (mock data)
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

## Known Issues — RESOLVED 2026-09-12

The app had never been successfully run. First boot (Expo web) surfaced three stacked bugs, all fixed:

1. **Duplicate/nested folders from a messy merge** — `src/app/app/`, `src/components/components/`,
   `src/constants/constants/` all existed one level deeper than every screen's `@/...` imports expected, while
   stray default-Expo-template files (`index.tsx`, `explore.tsx`, `ThemedText`, `app-tabs`, a near-empty
   `theme.ts`, etc.) sat at the shallow paths those imports actually resolved to. Fixed by moving the real files
   up a level and deleting the unused template leftovers — no import statements needed to change.
2. **Missing dependency** — every screen imports `Ionicons` from `@expo/vector-icons`, which was never in
   `package.json`. Installed via `npx expo install @expo/vector-icons`.
3. **Hardcoded old-palette hex literals** — a few screens (welcome, fridge gradients; household-setup/profile
   avatar colors; RecipeCard category colors) had the old navy/gold hex values written directly instead of
   going through `theme.ts`, so the palette relock in Phase 5.5 didn't reach them. Re-hued to fit
   coral/sage/cream, keeping the multi-hue variety for avatars/categories rather than forcing everything to a
   single accent color.

Verified end-to-end in Expo web (`npm run web`): welcome → create-account renders correctly.

---

## DO NOT

- Run `npm audit fix --force` — breaks deps
- Delete `screens-new/node_modules` — clean install
- Use Expo Go — SDK 56 not supported
- Commit whole-app HTML/JS export snapshots into git (this repo's `.git` already carries some from before —
  left alone rather than rewriting history, but don't add more)
- Develop from inside a OneDrive/Dropbox/Google Drive–synced folder
