'use client'

import type { Ticket } from '@prisma/client'
import TicketRow from './TicketRow'

interface PriorityGroupProps {
  level: 'P0' | 'P1' | 'P2'
  tickets: Ticket[]
  onUpdate: (updated: Ticket) => void
  ownerSuggestions: string[]
}

const LEVEL_LABELS: Record<string, string> = {
  P0: 'P0 — Critical',
  P1: 'P1 — High',
  P2: 'P2 — Normal',
}

const LEVEL_COLORS: Record<string, string> = {
  P0: '#c0392b',
  P1: '#e67e22',
  P2: '#27ae60',
}

export default function PriorityGroup({ level, tickets, onUpdate, ownerSuggestions }: PriorityGroupProps) {
  const color = LEVEL_COLORS[level]

  return (
    <section
      aria-label={`${level} priority tickets`}
      style={{ marginBottom: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #eee',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color }}>{LEVEL_LABELS[level]}</h2>
        <span
          aria-label={`${tickets.length} tickets`}
          style={{
            background: color,
            color: '#fff',
            borderRadius: '999px',
            padding: '2px 10px',
            fontSize: '0.8rem',
            fontWeight: 700,
            minWidth: 24,
            textAlign: 'center',
          }}
        >
          {tickets.length}
        </span>
      </header>

      {tickets.length === 0 ? (
        <p style={{ padding: '1rem 1.25rem', color: '#888', margin: 0 }}>
          No {level} tickets — all clear.
        </p>
      ) : (
        <ul role="list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {tickets.map((ticket) => (
            <li key={ticket.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <TicketRow ticket={ticket} onUpdate={onUpdate} ownerSuggestions={ownerSuggestions} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
