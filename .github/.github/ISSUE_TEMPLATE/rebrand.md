name: "🎨 Rebrand / Design Update"
description: "Uppdatera logotyper, färger och designsystem"
title: "[Rebrand] "
labels: ["design", "rebrand", "frontend"]
assignees:
  - copilot

body:
  - type: markdown
    attributes:
      value: |
        ## 🎨 Rebrand / Design Update
        Använd denna mall när du ändrar logotyper, primärfärger eller designsystem.

  - type: input
    id: scope
    attributes:
      label: Vilket område påverkas?
      description: T.ex. Navbar, Footer, App icons, PWA, knappar, typografi.

  - type: checkboxes
    id: assets
    attributes:
      label: Assets (ligger i `/public/brand`)
      options:
        - label: `/public/brand/Skolapp.png` (huvudlogotyp)
        - label: `/public/brand/Skolapp-symbol.png` (ikon/app-icon)
        - label: `/public/brand/Skolapp.jpeg` (fallback)
        - label: `/public/brand/Skolapp-Color.png` + `Skolapp-Color-Gradiant.png`

  - type: textarea
    id: changes
    attributes:
      label: What to update
      description: Beskriv vilka filer/komponenter som ska bytas ut.

  - type: checkboxes
    id: theme
    attributes:
      label: Theme / Tokens
      options:
        - label: Tailwind `primary` färg uppdaterad
        - label: design-tokens.ts uppdaterad (logo, färger)
        - label: Inga inline-styles/hex – endast tokens

  - type: checkboxes
    id: acceptance
    attributes:
      label: Acceptance criteria
      options:
        - label: Navbar/footer använder `Skolapp.png`
        - label: Favicon/app-icon = `Skolapp-symbol.png`
        - label: Primärfärg används konsekvent
        - label: Lighthouse & A11y-check > 0.9
        - label: Screenshots från web + mobil bifogade
