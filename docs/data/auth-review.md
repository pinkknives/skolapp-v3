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
- Säkerställ svenska texter för: Signup confirmation, Magic link, Reset password

### Rekommendationer
- Bekräfta att auth/callback hanterar återkomst från OAuth korrekt
- Lägg Playwright E2E för: signup, signin, reset-länk-flöde


