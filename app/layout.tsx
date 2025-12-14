import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Invariant — Constants Amidst Chaos',
  description: 'A magazine exploring the constants amidst chaos. Science, philosophy, and the enduring patterns of our world.',
  keywords: ['magazine', 'science', 'philosophy', 'culture', 'invariant', 'constants'],
  authors: [{ name: 'The Invariant' }],
  openGraph: {
    title: 'The Invariant',
    description: 'A magazine exploring the constants amidst chaos.',
    type: 'website',
    siteName: 'The Invariant',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Invariant',
    description: 'A magazine exploring the constants amidst chaos.',
  },
}

export function generateViewport() {
  return {
    themeColor: '#FDFBF7',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
