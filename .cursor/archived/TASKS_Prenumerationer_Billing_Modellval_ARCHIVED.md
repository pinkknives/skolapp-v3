# Skolapp – Milestone P (Prenumerationer, Billing & Modellval)

> Kör i ordning: **P1 → P2 → P3 → P4 → P5 → P6**.

## Körregler (obligatoriska)
- Efter **varje** task: kör  
  `npm run type-check && npm run lint -- --max-warnings=0 && npm run build`
- **Om alla tre är gröna** → markera tasken som `[x]`, gör **liten** commit med prefix **P1/P2…**, och **fortsätt direkt**.
- **Stanna endast** om:
  1) type-check/lint/build faller, **eller**  
  2) acceptanskriterier är oklara/ambigua.  
  I alla andra fall: **fortsätt automatiskt** tills alla tasks är klara.
- Alla DB-ändringar via migrations; **RLS krävs** för nya tabeller.
- UI på **svenska**, A11y (WCAG 2.1 AA), telemetri för nya flöden.

---

## P1. Prenumerationsmodeller (schema + logik)
- [x] Tabell `subscriptions` kopplad till `organisations`/`users`:
  - Plan: `free|teacher_bas|teacher_pro|school`
  - Kvoter: max_quizzes, ai_quota_4o, ai_quota_3_5
  - Renewal/billing info (Stripe sub_id, period_end)
- [x] Migrationer + RLS (admin kan se/ändra skolans plan; användare endast egen plan).
**Acceptans**
- [x] Tabell finns, kopplad till auth/organisations.
- [x] RLS skyddar data korrekt.

---

## P2. Stripe-integration (Billing & Portal)
- [x] Integrera Stripe Billing (Checkout + Customer Portal).
- [x] API-endpoints för `create_checkout_session`, `create_portal_session` (status → DB).
- [x] Org-admin kan öppna portal (ändra plan, se kvitton).
- [x] Enskilda lärare kan uppgradera via Checkout.
**Acceptans**
- [x] Upp-/nedgradering syns i appen inom 1 min.
- [x] Webhooks robusta (retry, signaturverifiering).
- [x] Ingen känslig data i frontend (endast session-id).

---

## P3. Uppgraderingsflöde (UI/UX)
- [x] Om gratis-användare trycker på AI eller låst funktion:
  - Visa snygg, intuitiv modal: “För att använda AI behöver du uppgradera”.
  - Tydlig plan-tabell (Free / Bas / Pro / Skola) + call-to-action.
- [x] Mobil: sheet med samma innehåll.
- [x] Telemetri: `upgrade_prompt_shown`, `upgrade_cta_clicked`.
**Acceptans**
- [x] UX känns logisk; inga döda klick.
- [x] Telemetri triggas vid visning/klick.

---

## P4. Hantering för skolor (Admin)
- [x] Admin-UI för att:
  - Se plan & användare
  - Bjuda in ny lärare (e-postinbjudan → signup med länk)
  - Ta bort/låsa lärare
- [x] E-postmall: “Du har blivit inbjuden till [Skolans namn] på Skolapp” (svenska).
- [x] API: `invite_teacher`, `remove_teacher`.
**Acceptans**
- [x] Admin kan hantera lärare enkelt.
- [x] Lärare utan konto får mail och kan skapa konto direkt.
- [x] Telemetri: `teacher_invited`, `teacher_removed`.

---

## P5. Modellval (GPT-3.5 vs GPT-4o)
- [x] Backend-endpoint tar `model: "gpt-3.5"|"gpt-4o"`.
- [x] UI: enkel toggle/dropdown “Standard (GPT-3.5)” / “Avancerad (GPT-4o)”.
- [x] Bas-plan: GPT-3.5 default, GPT-4o endast upp till kvot.
- [x] Pro/Skola: GPT-4o default, fallback till GPT-3.5 om kvot slut.
- [x] Telemetri: logga val + fallback.
**Acceptans**
- [x] Användaren upplever det som enkelt, aldrig tekniskt krångligt.
- [x] Fallback sker smidigt utan error-popup.

---

## P6. Presentation av planer
- [x] Ny sida: “Planer & priser” (kort, jämförande tabell).
- [x] Kortkomponenter med:
  - Plan-namn, pris, inkluderat, AI-kvoter
  - CTA-knapp → Checkout/Portal
- [x] På mobil: swipebar eller accordion.
**Acceptans**
- [x] Tydligt, snyggt, A11y OK.
- [x] Lätt att förstå skillnader mellan planer.

---

## Gemensamma krav
- [x] Ably-kostnader täcks i prisnivåerna; gratisplan har strikta gränser för realtid (t.ex. 1 session, max 20 deltagare).
- [x] Telemetri för alla upgrade-flöden.
- [x] Alla UI-texter på svenska; tonalitet trygg, enkel (passar även äldre lärare).
- [x] Alla nya mailmallar på svenska, testade i dev + prod.
