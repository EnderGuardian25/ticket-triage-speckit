'use client'

import { useState } from 'react'
import type { Ticket } from '@prisma/client'

interface TicketRowProps {
  ticket: Ticket
  onUpdate: (updated: Ticket) => void
  ownerSuggestions: string[]
}

const PRIORITIES = ['P0', 'P1', 'P2'] as const
const PRIORITY_COLORS: Record<string, string> = {
  P0: '#c0392b',
  P1: '#e67e22',
  P2: '#27ae60',
}

export default function TicketRow({ ticket, onUpdate, ownerSuggestions }: TicketRowProps) {
  const [priorityOpen, setPriorityOpen] = useState(false)
  const [ownerEditing, setOwnerEditing] = useState(false)
  const [ownerDraft, setOwnerDraft] = useState(ticket.owner ?? '')
  const [loading, setLoading] = useState(false)

  async function patchTicket(body: { priority?: string; owner?: string | null }) {
    setLoading(true)
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const updated: Ticket = await res.json()
        onUpdate(updated)
      }
    } finally {
      setLoading(false)
    }
  }

  function handlePrioritySelect(newPriority: string) {
    setPriorityOpen(false)
    if (newPriority !== ticket.priority) {
      void patchTicket({ priority: newPriority })
    }
  }

  function handleOwnerConfirm() {
    setOwnerEditing(false)
    const trimmed = ownerDraft.trim()
    const newOwner = trimmed === '' ? null : trimmed
    if (newOwner !== ticket.owner) {
      void patchTicket({ owner: newOwner })
    }
  }

  const color = PRIORITY_COLORS[ticket.priority] ?? '#888'

  return (
    <article
      aria-label={`Ticket ${ticket.id}: ${ticket.title}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '2.5rem 1fr 6rem 10rem 5rem',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1.25rem',
        opacity: loading ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <span style={{ color: '#aaa', fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums' }}>#{ticket.id}</span>

      <span style={{ fontWeight: 500 }}>{ticket.title}</span>

      {/* Priority selector — click 1 opens, click 2 selects (≤ 3 clicks total) */}
      <div style={{ position: 'relative' }}>
        <button
          aria-label={`Priority: ${ticket.priority}. Click to change.`}
          aria-expanded={priorityOpen}
          aria-haspopup="listbox"
          onClick={() => setPriorityOpen((o) => !o)}
          style={{
            background: color,
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '3px 10px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          {ticket.priority}
        </button>

        {priorityOpen && (
          <ul
            role="listbox"
            aria-label="Select priority"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 10,
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: 4,
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              listStyle: 'none',
              margin: '2px 0 0',
              padding: '4px 0',
              minWidth: 80,
            }}
          >
            {PRIORITIES.map((p) => (
              <li key={p} role="option" aria-selected={p === ticket.priority}>
                <button
                  onClick={() => handlePrioritySelect(p)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: p === ticket.priority ? '#f0f0f0' : 'transparent',
                    border: 'none',
                    padding: '6px 14px',
                    cursor: 'pointer',
                    fontWeight: p === ticket.priority ? 700 : 400,
                    color: PRIORITY_COLORS[p],
                  }}
                >
                  {p}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Owner inline editor */}
      <div>
        {ownerEditing ? (
          <div style={{ position: 'relative' }}>
            <input
              autoFocus
              aria-label="Owner name"
              list="owner-suggestions"
              value={ownerDraft}
              onChange={(e) => setOwnerDraft(e.target.value)}
              onBlur={handleOwnerConfirm}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleOwnerConfirm()
                if (e.key === 'Escape') {
                  setOwnerEditing(false)
                  setOwnerDraft(ticket.owner ?? '')
                }
              }}
              style={{
                width: '100%',
                border: '1px solid #aaa',
                borderRadius: 4,
                padding: '3px 6px',
                fontSize: '0.875rem',
              }}
            />
            <datalist id="owner-suggestions">
              {ownerSuggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        ) : (
          <button
            aria-label={ticket.owner ? `Owner: ${ticket.owner}. Click to edit.` : 'Unassigned. Click to assign.'}
            onClick={() => {
              setOwnerDraft(ticket.owner ?? '')
              setOwnerEditing(true)
            }}
            style={{
              background: 'transparent',
              border: '1px dashed #ccc',
              borderRadius: 4,
              padding: '3px 8px',
              cursor: 'pointer',
              color: ticket.owner ? '#333' : '#aaa',
              fontSize: '0.875rem',
              width: '100%',
              textAlign: 'left',
            }}
          >
            {ticket.owner ?? 'Unassigned'}
          </button>
        )}
      </div>

      <span style={{ color: '#aaa', fontSize: '0.75rem' }}>{ticket.status}</span>
    </article>
  )
}
