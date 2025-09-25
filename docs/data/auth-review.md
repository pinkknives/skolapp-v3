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

#### Malltexter (förslag att klistra in i Supabase Studio)

1) Signup confirmation
- Ämne: "Bekräfta din e‑post till Skolapp"
- HTML (inline‑CSS, rund ikon 64×64, inga meta‑headers):

```html
<div style="max-width:560px;margin:0 auto;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0a0a0a;background:#ffffff;padding:24px">
  <div style="line-height:0;text-align:center;margin-bottom:16px">
    <span style="display:inline-block;width:64px;height:64px;border-radius:9999px;background:#eef2ff;line-height:0">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin:12px">
        <path d="M20 7l-8 5-8-5" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4 7h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </div>

  <h1 style="font-size:20px;margin:0 0 8px 0">Välkommen till Skolapp!</h1>
  <p style="margin:0 0 16px 0;color:#3f3f46">Bekräfta din e‑postadress för att slutföra registreringen.</p>

  <div style="text-align:center;margin:24px 0">
    <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:8px;font-weight:600">Bekräfta e‑post</a>
  </div>

  <p style="margin:0 0 8px 0;color:#52525b">Länken är tidsbegränsad. Om det här inte var du kan du ignorera meddelandet.</p>
  <p style="margin:0;color:#52525b">Behöver du hjälp? Skriv till <a href="mailto:hej@skolapp.se" style="color:#4f46e5">hej@skolapp.se</a>.</p>
</div>
```

2) Magic link (engångslänk för inloggning)
- Ämne: "Din engångslänk till Skolapp"
- HTML:

```html
<div style="max-width:560px;margin:0 auto;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0a0a0a;background:#ffffff;padding:24px">
  <div style="line-height:0;text-align:center;margin-bottom:16px">
    <span style="display:inline-block;width:64px;height:64px;border-radius:9999px;background:#ecfeff;line-height:0">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin:12px">
        <path d="M7 17l9.9-9.9" stroke="#0891b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7 7h10v10" stroke="#0891b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </div>

  <h1 style="font-size:20px;margin:0 0 8px 0">Logga in med engångslänk</h1>
  <p style="margin:0 0 16px 0;color:#3f3f46">Klicka på knappen nedan för att logga in i Skolapp.</p>

  <div style="text-align:center;margin:24px 0">
    <a href="{{ .MagicLink }}" style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:8px;font-weight:600">Öppna Skolapp</a>
  </div>

  <p style="margin:0 0 8px 0;color:#52525b">Länken är tidsbegränsad och kan användas en gång.</p>
  <p style="margin:0;color:#52525b">Behöver du hjälp? <a href="mailto:hej@skolapp.se" style="color:#0891b2">Kontakta oss</a>.</p>
</div>
```

3) Reset password
- Ämne: "Återställ ditt lösenord till Skolapp"
- HTML:

```html
<div style="max-width:560px;margin:0 auto;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0a0a0a;background:#ffffff;padding:24px">
  <div style="line-height:0;text-align:center;margin-bottom:16px">
    <span style="display:inline-block;width:64px;height:64px;border-radius:9999px;background:#fff7ed;line-height:0">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin:12px">
        <path d="M12 15v3" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 11V7a4 4 0 118 0v4" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="6" y="11" width="12" height="8" rx="2" stroke="#ea580c" stroke-width="2"/>
      </svg>
    </span>
  </div>

  <h1 style="font-size:20px;margin:0 0 8px 0">Återställ lösenord</h1>
  <p style="margin:0 0 16px 0;color:#3f3f46">Klicka på knappen nedan för att skapa ett nytt lösenord.</p>

  <div style="text-align:center;margin:24px 0">
    <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#ea580c;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:8px;font-weight:600">Välj nytt lösenord</a>
  </div>

  <p style="margin:0 0 8px 0;color:#52525b">Om du inte begärt detta kan du ignorera meddelandet.</p>
  <p style="margin:0;color:#52525b">Behöver du hjälp? <a href="mailto:hej@skolapp.se" style="color:#ea580c">hej@skolapp.se</a>.</p>
</div>
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


