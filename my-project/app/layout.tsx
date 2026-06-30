import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ticket Triage Dashboard',
  description: 'PMO ticket triage dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0, backgroundColor: '#f5f5f5' }}>
        {children}
      </body>
    </html>
  )
}
