import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import LogViewer from '@/components/Debug/LogViewer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DAINAGE - Developer Time Tracking',
  description: 'A powerful time tracking tool designed specifically for development teams',
  keywords: 'time tracking, development, productivity, toggl, sprint, velocity',
  authors: [{ name: 'DAINAGE Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://dainage.vercel.app',
    title: 'DAINAGE - Developer Time Tracking',
    description: 'A powerful time tracking tool designed specifically for development teams',
    siteName: 'DAINAGE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DAINAGE - Developer Time Tracking',
    description: 'A powerful time tracking tool designed specifically for development teams',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className={`${inter.className} antialiased`} data-version="v0.2.0-FINAL">
        <Providers>
          {children}
          <LogViewer />
          <div className="fixed bottom-4 left-4 bg-red-600 text-white text-lg font-bold px-4 py-3 rounded-md shadow-2xl z-[99999]" style={{ pointerEvents: 'none' }}>
            VERSION: 0.5.1-DURATION-DEBUG
          </div>
        </Providers>
      </body>
    </html>
  )
}