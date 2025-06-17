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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <LogViewer />
        </Providers>
      </body>
    </html>
  )
}