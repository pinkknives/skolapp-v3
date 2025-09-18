// src/lib/design-tokens.ts

// Behåll dina befintliga exports och lägg till detta ✨
export const brand = {
  // Primär Skolapp-teal (från din logga/bakgrund)
  primary: {
    50:  '#e6f0ef',
    100: '#cde0df',
    200: '#9bbfc0',
    300: '#6a9ea1',
    400: '#477f84',
    500: '#377b7b',   // ← huvudton
    600: '#2f6767',
    700: '#275353',
    800: '#1f3f3f',
    900: '#182f2f',
  },

  // Varumärkets neutrala färger (loggans ljusa “ivory” + ev. mörk bg)
  neutral: {
    fg: '#f7f6f0',   // ljus text/ikon på mörk bakgrund
    bg: '#0e2f31',   // mörk bakgrund (om du vill)
  },

  // Gradient (från din gradient-bild)
  gradient: {
    from: '#2a6d70',
    to:   '#477f84',
  },
};

// Hjälpare för Tailwind + CSS-variabler (frivilligt)
export const brandCSSVars = {
  '--brand-50':  brand.primary[50],
  '--brand-100': brand.primary[100],
  '--brand-200': brand.primary[200],
  '--brand-300': brand.primary[300],
  '--brand-400': brand.primary[400],
  '--brand-500': brand.primary[500],
  '--brand-600': brand.primary[600],
  '--brand-700': brand.primary[700],
  '--brand-800': brand.primary[800],
  '--brand-900': brand.primary[900],
  '--brand-fg':  brand.neutral.fg,
  '--brand-bg':  brand.neutral.bg,
  '--brand-grad-from': brand.gradient.from,
  '--brand-grad-to':   brand.gradient.to,
};

// Complete tokens export for compatibility with existing code
export const tokens = {
  colors: {
    primary: brand.primary,
    neutral: {
      50:  '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    // Moved old blue palette to info
    info: {
      50:  '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    // Semantic colors
    success: {
      50:  '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50:  '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50:  '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  motion: {
    duration: {
      fast: '120ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      'swift-in-out': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)',
    },
  },
};
