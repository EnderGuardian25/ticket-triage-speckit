import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PatchTicketBodySchema } from '@/lib/validations'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params
  const numericId = parseInt(rawId, 10)

  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'Ticket not found', id: rawId }, { status: 404 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Validation failed', issues: [{ field: 'body', message: 'Invalid JSON' }] },
      { status: 422 }
    )
  }

  // Strip unknown fields before validation — only forward priority and owner
  const raw = body as Record<string, unknown>
  const stripped = {
    ...(raw['priority'] !== undefined ? { priority: raw['priority'] } : {}),
    ...(raw['owner'] !== undefined ? { owner: raw['owner'] } : {}),
  }

  const parsed = PatchTicketBodySchema.safeParse(stripped)
  if (!parsed.success) {
    const issues = parsed.error.errors.map((e) => ({
      field: e.path.join('.') || 'body',
      message: e.message,
    }))
    return NextResponse.json({ error: 'Validation failed', issues }, { status: 422 })
  }

  const existing = await db.ticket.findUnique({ where: { id: numericId } })
  if (!existing) {
    return NextResponse.json({ error: 'Ticket not found', id: numericId }, { status: 404 })
  }

  const updateData: { priority?: string; owner?: string | null } = {}
  if (parsed.data.priority !== undefined) updateData.priority = parsed.data.priority
  if (parsed.data.owner !== undefined) {
    updateData.owner = parsed.data.owner === '' ? null : parsed.data.owner
  }

  const updated = await db.ticket.update({
    where: { id: numericId },
    data: updateData,
  })

  return NextResponse.json(updated)
}
