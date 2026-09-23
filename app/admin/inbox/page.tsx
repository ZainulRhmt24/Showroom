import { requireAuth } from '@/app/actions/authActions'
import InboxClient from '@/components/admin/inbox/InboxClient'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'WhatsApp Inbox - ShowroomOS'
}

export const dynamic = 'force-dynamic'

export default async function InboxPage() {
  const { membership } = await requireAuth()

  // Fetch sales users for assignment dropdown
  const salesMemberships = await prisma.userMembership.findMany({
    where: { showroomId: membership.showroomId, role: 'SALES' },
    include: { user: { select: { id: true, name: true } } }
  })

  const salesUsers = salesMemberships.map(m => m.user)

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50 border-t border-gray-200">
      <InboxClient 
        currentUser={{ id: membership.userId, role: membership.role }}
        salesUsers={salesUsers} 
      />
    </div>
  )
}
