const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  console.log("USERS:", users.length, users)
  
  const leads = await prisma.lead.findMany()
  console.log("LEADS:", leads.length, leads.map(l => ({id: l.id, ownerId: l.ownerId, type: l.type})))
}
main().catch(console.error).finally(() => prisma.$disconnect())
