---
name: Rebrand / Design Update
about: Uppdatera logotyp, färgpalett och designsystem så hela appen följer Skolapps
  nya varumärke.
title: ''
labels: ''
assignees: pinkknives

---

---
name: "🎨 Rebrand / Design Update"
about: "Uppdatera logotyper, färger och designsystem"
title: "[Rebrand] "
labels: ["design", "rebrand", "frontend"]
assignees: ["copilot"]
---

## 🎨 Rebrand / Design Update
Använd denna mall när du ändrar logotyper, primärfärger eller designsystem.

### Assets (ligger i `/public/brand`)
- [ ] `/public/brand/Skolapp.png` (huvudlogotyp)
- [ ] `/public/brand/Skolapp-symbol.png` (ikon/app-icon)
- [ ] `/public/brand/Skolapp.jpeg` (fallback)
- [ ] `/public/brand/Skolapp-color.png` + `Skolapp-color-gradiant.png`

### Theme / Tokens
- [ ] Tailwind `primary` färg uppdaterad
- [ ] design-tokens.ts uppdaterad (logo, färger)
- [ ] Inga inline-styles/hex – endast tokens

### Acceptance criteria
- [ ] Navbar/footer använder `Skolapp.png`
- [ ] Favicon/app-icon = `Skolapp-symbol.png`
- [ ] Primärfärg används konsekvent
- [ ] Lighthouse & A11y-check > 0.9
- [ ] Screenshots från web + mobil bifogade
