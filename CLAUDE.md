# CLAUDE.md — Our Table Project

## Project Overview
Our Table is a household recipe and meal planning app. The current build is a fully interactive HTML prototype serving as both a portfolio piece and a design reference for the upcoming React Native implementation.

## Prototype Architecture
The prototype is a **single unified HTML file** (`our-table-prototype.html`) with all 9 modules built in.

### How It Works
- **Block 0** — Design system IIFE: defines `window.OT` with all color tokens, typography, spacing, and UI components (`OT.T`, `OT.S`, `OT.R`, `OT.c`, `OT.nav`)
- **Block 1** — Hub controller: manages module switching via `MODULE_DEFS`, sidebar nav, cross-module routing via `window.otNavBar`
- **Block 2** — All 9 module definitions inside one IIFE, each registered via `MODULE_DEFS['0X_key'] = function() { ... }`

### Critical Rules When Editing the Prototype
1. **Always use `OT.nav()`** — never bare `nav()`. `nav` is not in scope inside the module IIFE.
2. **String escaping inside addSheet/ternary strings** — use `\\'` (2 backslashes in file) for single quotes inside onclick handlers. The `''` double-quote pattern breaks inside the addSheet ternary context.
3. **Always use `c.navBar(th, idx, 'otNavBar')`** — `c.bottomNav` does not exist. Nav bar takes a numeric index 0-4, not a string.
4. **Always validate with `node --check`** after any JS changes before shipping.
5. **Module 09 (Meal Planner)** is the newest module — append new modules after it.

### Screen State
Each module uses `otState` (global) for inter-render state persistence. Key fields:
- `newMemberName` — persisted before dietary/allergy re-renders to prevent name field reset
- `newMemberAllergies` — cleared after `otAddMember()` completes
- `mealPlan`, `mealViewMode`, `mealPickDay`, `mealPickMeal` — meal planner state

## Modules Built
| Key | Module | Status |
|-----|--------|--------|
| 01_auth | Auth & Onboarding | ✅ Complete |
| 02_home | Home, Search & Library | ✅ Complete |
| 03_recipe | Recipe Detail & Cooking Mode | ✅ Complete |
| 04_add | Add Recipe (URL, Social, Manual) | ✅ Complete |
| 05_fridge | Fridge, Pantry & What Can I Make | ✅ Complete |
| 06_grocery | Grocery List | ✅ Complete |
| 07_profile | Profile, Household & Settings | ✅ Complete |
| 08_book | Recipe Book & Party Mode | ✅ Complete |
| 09_mealplan | Meal Planner | ✅ Complete |

## Design Tokens
```
Primary:    #1B3A5C  (Navy)
Secondary:  #5A8A52  (Sage green)
Gold:       #C9A84C
Background: #F5F8FA  (Cream)
Text:       #1A2E3D
Muted:      #6B7E8F
Font:       Inter (sans), Playfair Display (serif)
```

## Dietary & Allergy Options
**Dietary:** None, Vegetarian, Vegan, Pescatarian, Gluten-Free, Dairy-Free, Nut-Free, Paleo, Keto, Halal, Kosher
**Allergies (FDA Big 9):** Peanuts, Tree Nuts, Eggs, Soy, Dairy/Milk, Wheat, Shellfish, Fish, Sesame

## React Native Rebuild (Next Phase)
- Clean Expo scaffold (previous attempt had broken babel-preset-expo)
- TypeScript from the start
- Folder structure: `src/screens/`, `src/components/`, `src/theme/`, `src/navigation/`
- Use prototype as pixel-perfect design reference
- Claude Hooks planned for code quality checks (lint, type-check) after each file change

## Working Style
- Danhausen (Claude) acts as senior app developer + UI/UX lead
- Will (Will-hausen) is the product owner learning alongside
- Keep responses summarized unless elaboration requested
- Validate JS changes with `node --check` before every deploy
- Use Python for file manipulation (avoids Node.js quote escaping hell)
