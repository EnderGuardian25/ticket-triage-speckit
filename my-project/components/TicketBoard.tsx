'use client'

import { useState } from 'react'
import type { Ticket } from '@prisma/client'
import PriorityGroup from './PriorityGroup'

interface TicketBoardProps {
  initialTickets: Ticket[]
  initialOwnerSuggestions?: string[]
}

const PRIORITY_LEVELS = ['P0', 'P1', 'P2'] as const

export default function TicketBoard({ initialTickets, initialOwnerSuggestions = [] }: TicketBoardProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)

  function handleUpdate(updated: Ticket) {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  const sessionOwners = tickets.map((t) => t.owner).filter((o): o is string => o !== null && o !== '')
  const ownerSuggestions = [...new Set([...initialOwnerSuggestions, ...sessionOwners])].sort()

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#1a1a1a' }}>
        Ticket Triage Dashboard
      </h1>
      {PRIORITY_LEVELS.map((level) => (
        <PriorityGroup
          key={level}
          level={level}
          tickets={tickets.filter((t) => t.priority === level)}
          onUpdate={handleUpdate}
          ownerSuggestions={ownerSuggestions}
        />
      ))}
    </main>
  )
}
