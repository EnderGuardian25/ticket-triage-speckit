import { db } from '@/lib/db'
import TicketBoard from '@/components/TicketBoard'

export const dynamic = 'force-dynamic'

export default async function TicketsPage() {
  const [tickets, ownerRows] = await Promise.all([
    db.ticket.findMany({
      where: { status: 'open' },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    }),
    db.ticket.findMany({
      select: { owner: true },
      where: { owner: { not: null } },
    }),
  ])

  const initialOwnerSuggestions = [
    ...new Set(ownerRows.map((r) => r.owner).filter((o): o is string => o !== null)),
  ].sort()

  return <TicketBoard initialTickets={tickets} initialOwnerSuggestions={initialOwnerSuggestions} />
}
