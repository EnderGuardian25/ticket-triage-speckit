import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.ticket.deleteMany()

  const now = new Date()
  const day = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000)

  await prisma.ticket.createMany({
    data: [
      { title: 'Fix critical authentication bypass', priority: 'P0', owner: 'Amal', createdAt: day(30) },
      { title: 'Database connection pool exhausted in prod', priority: 'P0', owner: 'Kavya', createdAt: day(22) },
      { title: 'SSL certificate expiring in 3 days', priority: 'P0', owner: null, createdAt: day(1) },
      { title: 'Dashboard loading spinner missing on slow connections', priority: 'P1', owner: 'Damian', createdAt: day(20) },
      { title: 'API rate limiting not enforced on bulk endpoints', priority: 'P1', owner: null, createdAt: day(18) },
      { title: 'User profile photo upload fails with PNG files', priority: 'P1', owner: 'Amal', createdAt: day(15) },
      { title: 'Email notifications delayed by up to 2 hours', priority: 'P1', owner: null, createdAt: day(12) },
      { title: 'Search results include archived tickets', priority: 'P1', owner: 'Kavya', createdAt: day(8) },
      { title: 'Export to CSV truncates titles over 100 chars', priority: 'P1', owner: null, createdAt: day(5) },
      { title: 'Update onboarding documentation for v2 flows', priority: 'P2', owner: 'Kavya', createdAt: day(25) },
      { title: 'Refactor legacy config parser to remove deprecated API', priority: 'P2', owner: null, createdAt: day(19) },
      { title: 'Improve error messages for 422 validation responses', priority: 'P2', owner: 'Damian', createdAt: day(10) },
    ],
  })

  console.log('Seeded 12 tickets across P0/P1/P2')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
