import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Invariant',
  description: 'A magazine exploring the constants amidst chaos. Science, philosophy, and the enduring patterns of our world.',
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
      <body>{children}</body>
    </html>
  )
}
