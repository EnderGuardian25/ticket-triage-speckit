import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TicketRow from '@/components/TicketRow'
import type { Ticket } from '@prisma/client'

const baseTicket: Ticket = {
  id: 1,
  title: 'Fix auth bypass',
  priority: 'P1',
  owner: 'Amal',
  status: 'open',
  createdAt: new Date('2026-01-01T08:00:00.000Z'),
}

function setup(ticket: Ticket = baseTicket, suggestions: string[] = []) {
  const onUpdate = vi.fn()
  const utils = render(
    <TicketRow ticket={ticket} onUpdate={onUpdate} ownerSuggestions={suggestions} />
  )
  return { ...utils, onUpdate }
}

describe('TicketRow — priority selector', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders the current priority', () => {
    setup()
    expect(screen.getByRole('button', { name: /Priority: P1/i })).toBeInTheDocument()
  })

  it('opens the priority dropdown on click', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: /Priority: P1/i }))
    expect(screen.getByRole('listbox', { name: /select priority/i })).toBeInTheDocument()
    expect(screen.getAllByRole('option').length).toBe(3)
  })

  it('calls fetch PATCH and onUpdate when a new priority is selected', async () => {
    const updatedTicket = { ...baseTicket, priority: 'P0' }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedTicket,
    } as Response)

    const { onUpdate } = setup()
    await userEvent.click(screen.getByRole('button', { name: /Priority: P1/i }))
    await userEvent.click(screen.getByRole('option', { name: /^P0$/ }).querySelector('button')!)
    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(updatedTicket))
    expect(fetch).toHaveBeenCalledWith(
      '/api/tickets/1',
      expect.objectContaining({ method: 'PATCH' })
    )
  })

  it('does not call fetch when the same priority is selected', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: /Priority: P1/i }))
    await userEvent.click(screen.getByRole('option', { name: /^P1$/ }).querySelector('button')!)
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('TicketRow — owner input', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders current owner value', () => {
    setup()
    expect(screen.getByRole('button', { name: /Owner: Amal/i })).toBeInTheDocument()
  })

  it('shows "Unassigned" when owner is null', () => {
    setup({ ...baseTicket, owner: null })
    expect(screen.getByRole('button', { name: /Unassigned/i })).toBeInTheDocument()
  })

  it('enters edit mode on click', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: /Owner: Amal/i }))
    expect(screen.getByRole('combobox', { name: /owner name/i })).toBeInTheDocument()
  })

  it('calls onUpdate with new owner on Enter confirmation', async () => {
    const updatedTicket = { ...baseTicket, owner: 'Kavya' }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedTicket,
    } as Response)

    const { onUpdate } = setup()
    await userEvent.click(screen.getByRole('button', { name: /Owner: Amal/i }))
    const input = screen.getByRole('combobox', { name: /owner name/i })
    await userEvent.clear(input)
    await userEvent.type(input, 'Kavya')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(updatedTicket))
  })

  it('calls onUpdate with null when blank owner is confirmed', async () => {
    const updatedTicket = { ...baseTicket, owner: null }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedTicket,
    } as Response)

    const { onUpdate } = setup()
    await userEvent.click(screen.getByRole('button', { name: /Owner: Amal/i }))
    const input = screen.getByRole('combobox', { name: /owner name/i })
    await userEvent.clear(input)
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(updatedTicket))
    expect(fetch).toHaveBeenCalledWith(
      '/api/tickets/1',
      expect.objectContaining({
        body: expect.stringContaining('"owner":null'),
      })
    )
  })

  it('shows autocomplete suggestions from ownerSuggestions prop', async () => {
    setup(baseTicket, ['Amal', 'Kavya', 'Damian'])
    await userEvent.click(screen.getByRole('button', { name: /Owner: Amal/i }))
    const datalist = document.getElementById('owner-suggestions')
    expect(datalist).not.toBeNull()
    const options = datalist!.querySelectorAll('option')
    expect(options.length).toBe(3)
    const values = Array.from(options).map((o) => o.value)
    expect(values).toContain('Amal')
    expect(values).toContain('Kavya')
    expect(values).toContain('Damian')
  })

  it('cancels edit on Escape and restores original value', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: /Owner: Amal/i }))
    const input = screen.getByRole('combobox', { name: /owner name/i })
    await userEvent.clear(input)
    await userEvent.type(input, 'Something else')
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: /Owner: Amal/i })).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })
})
