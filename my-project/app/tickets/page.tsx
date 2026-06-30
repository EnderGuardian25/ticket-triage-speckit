import { db } from '@/lib/db'
import TicketBoard from '@/components/TicketBoard'

export const dynamic = 'force-dynamic'

export default async function TicketsPage() {
  const tickets = await db.ticket.findMany({
    orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
  })

  return <TicketBoard initialTickets={tickets} />
}
