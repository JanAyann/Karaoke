import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Karaoke Reservation System',
  description: 'Real-time karaoke room management with YouTube integration',
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
