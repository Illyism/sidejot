import './globals.css'
import { Analytics } from '@/components/plausible'
import { ThemeProvider } from '@/components/providers'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Toaster } from '@/components/ui/sonner'
import { META_THEME_COLORS, siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Suspense } from 'react'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  keywords: [
    'Task Planning',
    'Pomodoro Timer',
    'ADHD',
    'Productivity',
    'AI Assistant',
    'Focus Timer',
    'Task Management',
  ],
  authors: [
    {
      name: 'Sidejot',
      url: 'https://github.com/sidejot',
    },
  ],
  creator: 'Sidejot',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@illyism',
  },
  manifest: `${siteConfig.url}/_static/favicons/site.webmanifest`,
}

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link
            rel="icon"
            type="image/png"
            href="/_static/favicons/favicon-96x96.png"
            sizes="96x96"
          />
          <link
            rel="icon"
            type="image/svg+xml"
            href="/_static/favicons/favicon.svg"
          />
          <link rel="shortcut icon" href="/_static/favicons/favicon.ico" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/_static/favicons/apple-touch-icon.png"
          />
          <meta name="apple-mobile-web-app-title" content="Sidejot" />
          <link rel="manifest" href="/_static/favicons/site.webmanifest" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
            }}
          />
        </head>
        <body
          className={cn(
            'min-h-screen bg-background font-sans antialiased',
            geist.variable,
            geistMono.variable,
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <div vaul-drawer-wrapper="">
              <div className="relative flex min-h-screen flex-col bg-background">
                {children}
              </div>
            </div>
            <TailwindIndicator />
            <ThemeSwitcher />
            <Toaster />

            <Suspense fallback={null}>
              <Analytics />
            </Suspense>
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
