// ─────────────────────────────────────────────────────────────
// Our Table Design System — Theme Constants
// Locked palette: Coral #FC3E57 · Sage #5BC18A · Ink #000000 ·
// Cream #FAF7F0 · Card #FFFFFF. Key names kept stable so every
// consuming screen/component needed no changes — only the values
// moved from the old navy/gold system to the locked palette.
// ─────────────────────────────────────────────────────────────

export const Colors = {
  navy:        '#FC3E57', // primary accent (coral) — CTAs, active states, icons
  navyMid:     '#D93450', // deeper coral — secondary links, subtext accents
  navyLight:   '#FFD4DA', // pale coral tint — subtle highlights/badges
  gold:        '#FC3E57', // ratings/premium accent, kept inside the locked palette
  sage:        '#5BC18A', // success / positive — unchanged in spirit, new hex

  // Light surfaces
  bg:          '#FAF7F0', // cream
  card:        '#FFFFFF',
  text:        '#000000', // ink
  muted:       '#6E6A62', // warm neutral gray for secondary text (not brand-locked)
  border:      '#E5E1D8',
  chip:        '#F1EDE3',
  chipText:    '#4A4A44',
  input:       '#FFFFFF',

  // Dark surfaces
  bgDark:      '#141414',
  cardDark:    '#1F1F1F',
  textDark:    '#FAF7F0',
  mutedDark:   '#B5B0A6',
  borderDark:  'rgba(255,255,255,0.15)',
  chipDark:    '#262626',

  // Semantic
  success:     '#5BC18A', // = sage
  warning:     '#E8A33D',
  error:       '#C1272D',

  // Overlays
  overlay:     'rgba(0,0,0,0.52)',
  scrim:       'rgba(0,0,0,0.28)',

  // Tab bar
  tabActive:   '#FC3E57', // coral
  tabInactive: '#B8B0A6',
} as const;

export const Spacing = {
  xs:       4,
  sm:       8,
  md:       12,
  lg:       16,
  xl:       22,
  xxl:      32,
  section:  14,
  screen:   20,  // standard horizontal screen padding
} as const;

export const Radius = {
  sm:   6,
  md:   10,
  lg:   16,
  xl:   22,
  full: 999,
} as const;

export const FontSize = {
  xxs:  9,
  xs:   10,
  sm:   11,
  base: 13,
  md:   15,
  lg:   18,
  xl:   22,
  xxl:  26,
  hero: 32,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#FC3E57',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#FC3E57',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
