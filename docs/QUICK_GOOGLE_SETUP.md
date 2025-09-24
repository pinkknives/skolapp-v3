# Snabb Google OAuth Setup

## 1. Skapa .env.local fil

Skapa en `.env.local` fil i projektets rotkatalog med följande innehåll:

```bash
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=din_hemliga_nyckel_här

# Google OAuth (FYLL I DINA EGNA VÄRDEN)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase (valfritt för nu)
NEXT_PUBLIC_SUPABASE_URL=din_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=din_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Hämta Google Client Secret

1. Gå till [Google Cloud Console](https://console.cloud.google.com/)
2. Välj ditt projekt
3. Gå till "APIs & Services" > "Credentials"
4. Hitta din OAuth 2.0 Client ID
5. Klicka på den för att se detaljer
6. Kopiera "Client Secret" och lägg till i `.env.local`

## 3. Konfigurera Redirect URIs

I Google Cloud Console, under din OAuth 2.0 Client ID:

**Authorized JavaScript origins:**
- `http://localhost:3000`

**Authorized redirect URIs:**
- `http://localhost:3000/api/auth/callback/google`

## 4. Generera NextAuth Secret

Kör detta kommando för att generera en säker secret:

```bash
openssl rand -base64 32
```

Eller använd en online generator: https://generate-secret.vercel.app/32

## 5. Testa Google-inloggning

1. Starta utvecklingsservern:
```bash
npm run dev
```

2. Besök: http://localhost:3000/auth/signin
3. Klicka på "Fortsätt med Google"
4. Följ Google OAuth-flödet

## 6. Felsökning

**Problem: "Invalid redirect URI"**
- Kontrollera att redirect URI matchar exakt: `http://localhost:3000/api/auth/callback/google`

**Problem: "Client ID not found"**
- Verifiera att `GOOGLE_CLIENT_ID` är korrekt i `.env.local`
- Starta om servern efter ändringar

**Problem: "Client secret is missing"**
- Kontrollera att `GOOGLE_CLIENT_SECRET` är satt i `.env.local`

## 7. Produktionsdeployment

För produktion, uppdatera:
- `NEXTAUTH_URL=https://din-domän.com`
- `NEXT_PUBLIC_APP_URL=https://din-domän.com`
- Lägg till produktionsdomän i Google OAuth inställningar

## Status

✅ Google Client ID: Konfigurerat (fyll i ditt värde)  
⏳ Google Client Secret: Behöver hämtas från Google Console  
⏳ NextAuth Secret: Behöver genereras  
⏳ Redirect URIs: Behöver konfigureras i Google Console  

När alla steg är klara kommer Google-inloggning att fungera perfekt! 🚀
