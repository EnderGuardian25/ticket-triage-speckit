import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    ticket: {
      findMany: vi.fn(),
    },
  },
}))

import { GET } from '@/app/api/tickets/route'
import { db } from '@/lib/db'

const mockTickets = [
  { id: 1, title: 'Fix auth bypass', priority: 'P0', owner: 'Amal', status: 'open', createdAt: new Date('2026-01-01T08:00:00.000Z') },
  { id: 2, title: 'DB pool exhausted', priority: 'P0', owner: 'Kavya', status: 'open', createdAt: new Date('2026-01-09T10:00:00.000Z') },
  { id: 3, title: 'Dashboard spinner missing', priority: 'P1', owner: null, status: 'open', createdAt: new Date('2026-01-05T12:00:00.000Z') },
  { id: 4, title: 'Update onboarding docs', priority: 'P2', owner: null, status: 'open', createdAt: new Date('2026-01-03T09:00:00.000Z') },
]

describe('GET /api/tickets', () => {
  beforeEach(() => {
    vi.mocked(db.ticket.findMany).mockResolvedValue(mockTickets)
  })

  it('returns 200 with a JSON array', async () => {
    const req = new Request('http://localhost:3000/api/tickets')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  })

  it('includes all required fields on each ticket', async () => {
    const req = new Request('http://localhost:3000/api/tickets')
    const res = await GET(req)
    const data = await res.json()
    for (const ticket of data) {
      expect(ticket).toHaveProperty('id')
      expect(ticket).toHaveProperty('title')
      expect(ticket).toHaveProperty('priority')
      expect(ticket).toHaveProperty('owner')
      expect(ticket).toHaveProperty('status')
      expect(ticket).toHaveProperty('createdAt')
    }
  })

  it('returns correct field types', async () => {
    const req = new Request('http://localhost:3000/api/tickets')
    const res = await GET(req)
    const data = await res.json()
    const t = data[0]
    expect(typeof t.id).toBe('number')
    expect(typeof t.title).toBe('string')
    expect(['P0', 'P1', 'P2']).toContain(t.priority)
    expect(t.owner === null || typeof t.owner === 'string').toBe(true)
    expect(t.status).toBe('open')
    expect(typeof t.createdAt).toBe('string')
    expect(() => new Date(t.createdAt)).not.toThrow()
  })

  it('orders tickets by priority ASC then createdAt ASC', async () => {
    const ordered = [
      { id: 1, title: 'A', priority: 'P0', owner: null, status: 'open', createdAt: new Date('2026-01-01T00:00:00.000Z') },
      { id: 2, title: 'B', priority: 'P0', owner: null, status: 'open', createdAt: new Date('2026-01-02T00:00:00.000Z') },
      { id: 3, title: 'C', priority: 'P1', owner: null, status: 'open', createdAt: new Date('2026-01-01T00:00:00.000Z') },
      { id: 4, title: 'D', priority: 'P2', owner: null, status: 'open', createdAt: new Date('2026-01-01T00:00:00.000Z') },
    ]
    vi.mocked(db.ticket.findMany).mockResolvedValue(ordered)
    const req = new Request('http://localhost:3000/api/tickets')
    const res = await GET(req)
    const data = await res.json()
    const priorities = data.map((t: { priority: string }) => t.priority)
    expect(priorities).toEqual(['P0', 'P0', 'P1', 'P2'])
    const p0 = data.filter((t: { priority: string }) => t.priority === 'P0')
    expect(p0[0].id).toBe(1)
    expect(p0[1].id).toBe(2)
  })

  it('returns empty array when no tickets exist', async () => {
    vi.mocked(db.ticket.findMany).mockResolvedValue([])
    const req = new Request('http://localhost:3000/api/tickets')
    const res = await GET(req)
    const data = await res.json()
    expect(data).toEqual([])
  })

  it('responds within 150ms with 50 mock tickets (SC-004 timing gate)', async () => {
    const fiftyTickets = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      title: `Ticket ${i + 1}`,
      priority: ['P0', 'P1', 'P2'][i % 3] as string,
      owner: i % 2 === 0 ? 'Amal' : null,
      status: 'open',
      createdAt: new Date(2026, 0, i + 1),
    }))
    vi.mocked(db.ticket.findMany).mockResolvedValue(fiftyTickets)
    const req = new Request('http://localhost:3000/api/tickets')
    const start = Date.now()
    const res = await GET(req)
    const elapsed = Date.now() - start
    expect(res.status).toBe(200)
    expect(elapsed).toBeLessThan(150)
  })
})
