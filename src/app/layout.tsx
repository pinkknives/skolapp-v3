import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'

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
      { url: '/favicon.ico' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icons/safari-pinned-tab.svg', color: '#0ea5e9' },
    ],
  },
  manifest: '/manifest.json',
  category: 'technology',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#171717' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">{/* Changed to Swedish */}
      <head>
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
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Focus visible polyfill for older browsers */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (!window.CSS || !window.CSS.supports || !window.CSS.supports('selector(:focus-visible)')) {
                  document.body.classList.add('js-focus-visible');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('ServiceWorker registration failed: ', error);
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