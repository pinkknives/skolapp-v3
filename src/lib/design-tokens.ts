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

// (Om du redan har en tokens-export, låt den vara – detta är additivt.)
