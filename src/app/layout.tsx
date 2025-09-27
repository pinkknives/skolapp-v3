import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { SessionProvider } from '@/components/providers/SessionProvider'
import Providers from './providers'
import { cookies } from 'next/headers'
import { WelcomeToast } from '@/components/auth/WelcomeToast'
import { ToastDebug } from '@/components/dev/ToastDebug'
import { OneSignalInit } from '@/components/push/OneSignalInit'

export const metadata: Metadata = {
  title: {
    default: 'Skolapp v3 - Modern designsystem',
    template: '%s | Skolapp v3'
  },
  description: 'Modern designsystem och progressiv webbapplikation med tillgänglighet, prestanda och användarupplevelse i fokus.',
  keywords: ['designsystem', 'tillgänglighet', 'progressiv webbapp', 'modern design', 'svenska'],
  authors: [{ name: 'Skolapp Team' }],
  creator: 'Skolapp Team',
  publisher: 'Skolapp',
  metadataBase: new URL('https://skolapp.example.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: 'https://skolapp.example.com',
    title: 'Skolapp v3 - Modern designsystem',
    description: 'Modern designsystem och progressiv webbapplikation med tillgänglighet, prestanda och användarupplevelse i fokus.',
    siteName: 'Skolapp v3',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Skolapp v3 - Modern designsystem',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skolapp v3 - Modern designsystem',
    description: 'Modern designsystem och progressiv webbapplikation med tillgänglighet, prestanda och användarupplevelse i fokus.',
    images: ['/og-image.png'],
    creator: '@skolapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-64x64.png', sizes: '64x64', type: 'image/png' },
    ],
    apple: [
      { url: '/brand/Skolapp-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/favicon.svg', color: '#377b7b' },
    ],
  },
  manifest: '/manifest.json',
  category: 'technology',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#377b7b' },
    { media: '(prefers-color-scheme: dark)', color: '#2f6767' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // SSR theme from cookie to minimize hydration differences
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get('theme')?.value
  const initialThemeClass = themeCookie === 'dark' ? 'dark' : undefined
  return (
    <html lang="sv" className={initialThemeClass} suppressHydrationWarning>{/* Changed to Swedish */}
      <head>
        <meta name="x-correlation-id" content="" />
        {/* Pre-render theme application via inline script to avoid FOUC */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var key = 'theme';
                  var saved = localStorage.getItem(key);
                  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved === 'light' || saved === 'dark' ? saved : (prefersDark ? 'dark' : 'light');
                  if (theme === 'dark') document.documentElement.classList.add('dark');
                  var meta = document.querySelector('meta#theme-color');
                  if (!meta) { meta = document.createElement('meta'); meta.id = 'theme-color'; meta.name = 'theme-color'; document.head.appendChild(meta); }
                  meta.setAttribute('content', theme === 'dark' ? '#2f6767' : '#377b7b');
                  var corr = document.querySelector('meta[name=\'x-correlation-id\']');
                  if (!corr) { corr = document.createElement('meta'); corr.setAttribute('name','x-correlation-id'); document.head.appendChild(corr); }
                  try { var header = document?.cookie?.match(/(^|;)\s*x-correlation-id=([^;]+)/); if (header && header[2]) corr.setAttribute('content', header[2]); } catch (e) {}
                  
                } catch (e) {}
              })();
            `,
          }}
        />
        <meta id="theme-color" name="theme-color" content="#377b7b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* GDPR and Privacy */}
        <meta name="privacy-policy" content="/privacy" />
        <meta name="terms-of-service" content="/terms" />
        
        {/* Security */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      </head>
      <body className="font-sans antialiased w-full" suppressHydrationWarning>
        {/* Focus visible helper for older browsers */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var supports = window.CSS && window.CSS.supports && window.CSS.supports('selector(:focus-visible)');
                  if (!supports) {
                    var add = function(){
                      try { document.body && document.body.classList.add('js-focus-visible'); } catch (e) {}
                    };
                    if (document.readyState === 'loading') {
                      document.addEventListener('DOMContentLoaded', add, { once: true });
                    } else {
                      add();
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        
        <SessionProvider>
          <Providers initialTheme={initialThemeClass === 'dark' ? 'dark' : 'light'}>
            <AuthProvider>
              <WelcomeToast />
              <OneSignalInit />
              <main className="w-full min-h-svh">
                {children}
              </main>
              {process.env.NODE_ENV !== 'production' ? <ToastDebug /> : null}
            </AuthProvider>
          </Providers>
        </SessionProvider>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && '${process.env.NODE_ENV}' === 'production') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      // Service worker registered successfully
                    })
                    .catch(function(error) {
                      // Service worker registration failed
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}