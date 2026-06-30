import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import TicketBoard from '@/components/TicketBoard'
import type { Ticket } from '@prisma/client'

expect.extend(toHaveNoViolations)

const fixtureTickets: Ticket[] = [
  { id: 1, title: 'Fix auth bypass', priority: 'P0', owner: 'Amal', status: 'open', createdAt: new Date('2026-01-01T08:00:00.000Z') },
  { id: 2, title: 'DB pool exhausted', priority: 'P0', owner: null, status: 'open', createdAt: new Date('2026-01-09T10:00:00.000Z') },
  { id: 3, title: 'Dashboard spinner missing', priority: 'P1', owner: 'Kavya', status: 'open', createdAt: new Date('2026-01-05T12:00:00.000Z') },
  { id: 4, title: 'Email notifications delayed', priority: 'P1', owner: null, status: 'open', createdAt: new Date('2026-01-12T14:00:00.000Z') },
  { id: 5, title: 'Update onboarding docs', priority: 'P2', owner: 'Damian', status: 'open', createdAt: new Date('2026-01-03T09:00:00.000Z') },
]

describe('Accessibility — TicketBoard (FR-012 / SC-005)', () => {
  it('has no critical axe violations with a full set of tickets', async () => {
    const { container } = render(<TicketBoard initialTickets={fixtureTickets} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no critical axe violations when all priority groups are empty', async () => {
    const { container } = render(<TicketBoard initialTickets={[]} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
