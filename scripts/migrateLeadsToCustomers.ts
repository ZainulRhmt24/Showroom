import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1)
  }
  return cleaned
}

async function main() {
  console.log('Starting Lead to Customer migration...')
  
  const leads = await prisma.lead.findMany({
    where: { customerId: null }
  })
  
  console.log(`Found ${leads.length} leads to migrate.`)
  
  for (const lead of leads) {
    const normalized = normalizePhone(lead.whatsapp)
    
    // Check if customer exists
    let customer = await prisma.customer.findFirst({
      where: {
        showroomId: lead.showroomId,
        phone: normalized
      }
    })
    
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          showroomId: lead.showroomId,
          name: lead.name,
          phone: normalized,
          email: lead.email,
        }
      })
      console.log(`Created customer ${customer.name}`)
    } else {
      console.log(`Found existing customer ${customer.name}`)
    }
    
    await prisma.lead.update({
      where: { id: lead.id },
      data: { customerId: customer.id }
    })
    
    console.log(`Linked lead ${lead.id} to customer ${customer.id}`)
  }
  
  console.log('Migration complete.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
