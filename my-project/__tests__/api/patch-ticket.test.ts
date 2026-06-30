import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    ticket: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { PATCH } from '@/app/api/tickets/[id]/route'
import { db } from '@/lib/db'

const existingTicket = {
  id: 3,
  title: 'Resolve CI pipeline timeout',
  priority: 'P1',
  owner: null,
  status: 'open',
  createdAt: new Date('2026-06-15T09:00:00.000Z'),
}

function makeRequest(id: string, body: unknown) {
  return new Request(`http://localhost:3000/api/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('PATCH /api/tickets/:id', () => {
  beforeEach(() => {
    vi.mocked(db.ticket.findUnique).mockResolvedValue(existingTicket)
    vi.mocked(db.ticket.update).mockResolvedValue({ ...existingTicket, priority: 'P0' })
  })

  it('returns 200 with updated ticket on valid priority change', async () => {
    vi.mocked(db.ticket.update).mockResolvedValue({ ...existingTicket, priority: 'P0' })
    const req = makeRequest('3', { priority: 'P0' })
    const res = await PATCH(req, { params: Promise.resolve({ id: '3' }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.priority).toBe('P0')
    expect(data).toHaveProperty('id')
    expect(data).toHaveProperty('title')
    expect(data).toHaveProperty('owner')
    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('createdAt')
  })

  it('returns 422 with issues array for invalid priority value', async () => {
    const req = makeRequest('3', { priority: 'critical' })
    const res = await PATCH(req, { params: Promise.resolve({ id: '3' }) })
    expect(res.status).toBe(422)
    const data = await res.json()
    expect(data.error).toBe('Validation failed')
    expect(Array.isArray(data.issues)).toBe(true)
    expect(data.issues.length).toBeGreaterThan(0)
    expect(data.issues[0]).toHaveProperty('field')
    expect(data.issues[0]).toHaveProperty('message')
  })

  it('returns 404 for a non-existent ticket id', async () => {
    vi.mocked(db.ticket.findUnique).mockResolvedValue(null)
    const req = makeRequest('99999', { priority: 'P1' })
    const res = await PATCH(req, { params: Promise.resolve({ id: '99999' }) })
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.error).toBe('Ticket not found')
    expect(data.id).toBe(99999)
  })

  it('returns 200 when setting owner to a string', async () => {
    vi.mocked(db.ticket.update).mockResolvedValue({ ...existingTicket, owner: 'Kavya' })
    const req = makeRequest('3', { owner: 'Kavya' })
    const res = await PATCH(req, { params: Promise.resolve({ id: '3' }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.owner).toBe('Kavya')
  })

  it('returns 200 and clears owner when null is sent', async () => {
    vi.mocked(db.ticket.update).mockResolvedValue({ ...existingTicket, owner: null })
    const req = makeRequest('3', { owner: null })
    const res = await PATCH(req, { params: Promise.resolve({ id: '3' }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.owner).toBeNull()
  })

  it('normalises empty string owner to null', async () => {
    vi.mocked(db.ticket.update).mockResolvedValue({ ...existingTicket, owner: null })
    const req = makeRequest('3', { owner: '' })
    const res = await PATCH(req, { params: Promise.resolve({ id: '3' }) })
    expect(res.status).toBe(200)
    expect(vi.mocked(db.ticket.update)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ owner: null }),
      })
    )
  })

  it('returns 200 no-op when body has neither priority nor owner', async () => {
    vi.mocked(db.ticket.update).mockResolvedValue(existingTicket)
    const req = makeRequest('3', {})
    const res = await PATCH(req, { params: Promise.resolve({ id: '3' }) })
    expect(res.status).toBe(200)
  })

  it('ignores unknown fields like title and status', async () => {
    vi.mocked(db.ticket.update).mockResolvedValue({ ...existingTicket, priority: 'P2' })
    const req = makeRequest('3', { priority: 'P2', title: 'should be ignored', status: 'closed' })
    const res = await PATCH(req, { params: Promise.resolve({ id: '3' }) })
    expect(res.status).toBe(200)
  })
})
