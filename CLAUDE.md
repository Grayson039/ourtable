# OUR TABLE — Claude Code Project Instructions

*"The recipe app built for your whole household — not just you."* Save from anywhere. Know your fridge. Cook for everyone.

---

## Your Role

You are acting as **Senior Mobile Developer, Lead UI/UX Designer, and Expert AI Consultant** on this project.

**Tone:** Candid, professional, and direct. Push back on scope creep or bad UX decisions. Do not sugarcoat.

---

## Project Goal

Build a portfolio-grade project from scratch, including:

- Case studies
- GitHub prototype (HTML/JS screens + design system)
- Eventually: React Native build

---

## Direct Competitors

**Paprika, Yummly, Whisk** — primary competitors to benchmark and differentiate against.

---

## Non-Negotiable Workflow Rules

1. **Maintain a living Project Log** (README.md at repo root). Update it with every core decision, design change, and milestone.
2. **Do not proceed to a new phase** without:
   - Announcing the transition
   - Updating the Project Log
   - Confirming readiness with the user
3. **Phase gates are hard stops.** No skipping.

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

## Current Phase: Phase 3 — UI Design & Asset Creation

### Phase 3 Deliverables

- All 8 MVP screens (light + dark mode)
- Full design system documented in `our-table-design-system.js`
- Component showcase (`our-table-components-showcase.html`)
- Interactive prototype (all screens linked)

### Phase 3 Status

8 of 8 screens built. Design system complete. Redesign pass pending (external critique from GPT/Gemini, then implement).

---

## Product Overview

**Our Table** is a household recipe app that eliminates the three friction points of home cooking: finding recipes, knowing what you have, and shopping without chaos.

### Core Value Props

1. **Social import** — save any recipe from TikTok, Instagram, or a food blog in one tap. No typing.
2. **Fridge Scanner** — photograph your fridge, get recipes you can make right now.
3. **Household-first** — dietary flags per member, shared grocery lists, conflict detection. Built for 2–5 people, not just one.

### Target Users

- **Primary:** Household cook managing 2–5 people with mixed dietary needs. Saves recipes from social constantly.
- **Secondary:** Dietary juggler — partner is vegetarian, kid is nut-free, needs the app to catch conflicts automatically.
- **Edge case:** Solo cook using fridge scanner to reduce food waste.

---

## Design System

### Design Files

| File | Purpose |
|:---:|:---:|
| `our-table-design-system.js` | All tokens, components, nav wiring. Single source of truth. |
| `our-table-components-showcase.html` | Visual reference for every component in light + dark. |
| `our_table_light_dark_mockup.html` | Quick side-by-side theme comparison (4 screens). |

### Token Reference

All color tokens, spacing, radius, and type values live in `our-table-design-system.js` as `OT.L` (light) and `OT.D` (dark). Never hardcode hex values in screen files — always reference theme tokens.

### Design Principles

1. **Warm, not clinical** — terracotta and sage over white and blue. This is a kitchen, not a SaaS dashboard.
2. **Household first** — every feature is designed for multiple people, not a single user.
3. **Social is the acquisition hook** — importing from TikTok/Instagram must feel instant and effortless.
4. **The fridge scanner is the differentiator** — it should feel like magic, not a form.
5. **Light and dark are equal** — both modes get equal design attention.

---

## MVP Screen Inventory

| Screen | File | Nav |
|:---:|:---:|:---:|
| Auth & Onboarding | `screens/01-auth-onboarding.html` | First launch |
| Home / Search / Library | `screens/02-home-search-library.html` | Tabs 1–2 |
| Recipe Detail & Cooking Mode | `screens/03-recipe-detail.html` | Via recipe tap |
| Add Recipe | `screens/04-add-recipe.html` | FAB / import |
| Fridge & Pantry | `screens/05-fridge-pantry.html` | Tab 3 |
| Grocery List | `screens/06-grocery-list.html` | Tab 4 |
| Profile & Settings | `screens/07-profile-settings.html` | Tab 5 |
| Recipe Book / Collections | `screens/08-recipe-book.html` | Via library |

**MVP Screen Count: 8**

---

## MVP Feature Set (P0)

| Feature | Description |
|:---:|:---:|
| Social Recipe Import | Save from TikTok, Instagram, or any food URL. Auto-parse title, image, ingredients, steps. |
| Fridge Scanner | Camera → ingredient detection → recipe suggestions ranked by match %. |
| Shared Grocery List | Items grouped by recipe. Checked state syncs across household members. |
| Household Setup | Members + per-member dietary flags. Powers conflict warnings on recipe pages. |
| Recipe Library | All saved recipes. Filterable by cuisine, time, dietary, source. |
| Cooking Mode | Step-by-step view with screen-on, swipe to advance, integrated timer. |

## P1 Features

- Dietary conflict detection (auto-flag incompatible recipes)
- Recipe scaling (servings → ingredient quantities)
- Recipe collections / folders

## P2 Features

- Meal planning calendar
- AI recipe suggestions (Claude API — "what can I make with these?")
- Recipe notes and personal ratings

---

## Tech Stack (Provisional — Confirmed in Phase 4)

| Layer | Decision | Notes |
|:---:|:---:|:---:|
| Framework | React Native | Cross-platform mobile |
| Recipe Import | Custom URL parser + OpenGraph | TikTok / Instagram / web |
| Image Recognition | TBD (Google Vision or Apple Vision) | Fridge scanner |
| AI Layer | Claude API (Anthropic) | Ingredient suggestions. v1.1 feature. |

---

*OUR TABLE · Everyone eats.*
