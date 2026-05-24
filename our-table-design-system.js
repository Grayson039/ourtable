/**
 * Our Table — Shared Design System
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for color tokens, typography, spacing,
 * and every reusable UI component used across all screen files.
 *
 * USAGE (in any prototype HTML file):
 *   <script src="our-table-design-system.js"></script>
 *
 *   All tokens and components live on the global `OT` object.
 *   Pass OT.L (light theme) or OT.D (dark theme) as the first
 *   argument to any component function.
 *
 * QUICK REFERENCE:
 *   OT.L / OT.D                  — color theme objects
 *   OT.T                         — typography constants
 *   OT.S                         — spacing constants
 *   OT.R                         — border radius constants
 *   OT.c.statusBar(theme)        — iOS status bar
 *   OT.c.navBar(theme, activeIdx)— bottom tab bar (0–4)
 *   OT.c.btn(theme, label, fn, variant) — button
 *   OT.c.input(theme, id, type, placeholder, value)
 *   OT.c.recipeCardLarge(theme, recipe, onClickFn)
 *   OT.c.recipeCardSmall(theme, recipe, onClickFn)
 *   OT.c.listItem(theme, item, checked, onClickFn)
 *   OT.nav(screens, startId, containerId, opts) — wires navigation
 * ─────────────────────────────────────────────────────────────
 */

(function (global) {

  /* ══════════════════════════════════════════════════════════
     COLOR TOKENS
     All screens must import these rather than hardcoding hex
     values — this is how dark mode works for free.
  ══════════════════════════════════════════════════════════ */