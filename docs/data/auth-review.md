## Auth review

### Supabase auth schema (översikt)
- Tabeller: users, sessions, identities, refresh_tokens, mfa_* m.fl. (standard Supabase)
- Projektets egna tabeller i `public`: users, accounts, sessions, verification_tokens (NextAuth-kompatibelt upplägg)

### RLS & Policies (public)
- users/accounts/sessions: self-access policies (auth.uid() = id/user_id)
- verification_tokens: RLS avstängt (OK för verifieringsflöden)

### Frontend-flöden
- Sidor:
  - `/auth/signin`: e‑post/lösenord + Google OAuth
  - `/auth/signup`: kontoskapande
  - `/auth/reset-password`: återställ/byt lösenord
  - `/auth/update-password`: uppdatera lösenord efter länk

Exempel: `/auth/signin` (email/password)
- validerar e‑post, lösenord; anropar supabase.auth.signInWithPassword
- vid Google: supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: '/auth/callback' })
- felindikeringar på svenska och länk till reset

### Mailmallar
- Verifiera i Supabase Studio → Authentication → Email Templates
- Säkerställ svenska texter (tonalitet som i appen) för:
  - Signup confirmation (bekräftelse på konto)
  - Magic link (engångslänk för inloggning)
  - Reset password (återställning av lösenord)
- Rekommenderad struktur per mall:
  - Ämne: kort, tydligt (t.ex. "Bekräfta din e‑post till Skolapp")
  - Hälsning + syfte på 1–2 rader
  - Tydlig primärlänk-knapp
  - Giltighetstid/om detta inte var du‑text
  - Avslut med supportlänk

### Rekommendationer
- Bekräfta att auth/callback hanterar återkomst från OAuth korrekt
- Lägg Playwright E2E för: signup, signin, reset-länk-flöde


