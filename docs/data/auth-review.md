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

### Mailmallar (återstår att verifiera i Studio)
- Verifiera i Supabase Studio → Authentication → Email Templates
- Säkerställ svenska texter (tonalitet som i appen) för:
  - Signup confirmation (bekräftelse på konto)
  - Magic link (engångslänk för inloggning)
  - Reset password (återställning av lösenord)
- Checklista vid verifiering:
  - Ämne tydligt; CTA-knapp synlig; giltighetstext; supportlänk
  - Provskick i dev + prod och visuellt QA

# Auth E‑postmallar (svenska)

## Confirm signup

```md
Hej!

Tack för att du registrerade dig i Skolapp. Klicka på knappen nedan för att bekräfta din e‑postadress.

[Bekräfta e‑post]({{ .ConfirmationURL }})

Länken är giltig i {{ .EmailOTPExp }} minuter. Om du inte försökte registrera dig kan du ignorera detta meddelande.

Vänliga hälsningar,
Skolapp‑teamet

—
Support: support@skolapp.se
```

## Magic link

```md
Hej!

Använd knappen nedan för att logga in i Skolapp utan lösenord.

[Logga in]({{ .MagicLink }})

Länken är giltig i {{ .EmailOTPExp }} minuter och kan användas en gång. Om du inte begärde denna länk kan du ignorera meddelandet.

Vänliga hälsningar,
Skolapp‑teamet

—
Support: support@skolapp.se
```

## Reset password

```md
Hej!

Du har begärt att återställa ditt lösenord för Skolapp. Klicka på knappen nedan för att välja ett nytt lösenord.

[Återställ lösenord]({{ .RecoveryURL }})

Länken är giltig i {{ .EmailOTPExp }} minuter. Om du inte begärde en återställning kan du ignorera detta meddelande.

Vänliga hälsningar,
Skolapp‑teamet

—
Support: support@skolapp.se
```

### Playwright E2E (tillägg)
- `tests/e2e/auth-flows.spec.ts` täcker nu:
  - Signup: formvalidering, inskick, bekräftande text
  - Signin: validering, felmeddelande vid felaktig kombination
  - Reset password: inskick och generisk bekräftelse
- Obs: Testerna undviker faktisk e‑postleverans i CI (smoke‑säkert)

### Rekommendationer
- Bekräfta att auth/callback hanterar återkomst från OAuth korrekt
- Efter mallverifiering: markera E0a acceptans som uppfylld


