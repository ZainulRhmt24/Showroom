import { requireAuth } from '@/app/actions/authActions'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
import WhatsAppSettingsClient from '@/components/admin/settings/WhatsAppSettingsClient'

export default async function WhatsAppSettingsPage() {
  const { showroom, membership } = await requireAuth()

  if (membership.role !== 'OWNER') {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Akses ditolak. Hanya OWNER yang dapat mengakses pengaturan ini.</p>
      </div>
    )
  }

  const account = await prisma.whatsAppAccount.findUnique({
    where: { showroomId: showroom.id }
  })

  // Safe to pass to client. Only identifiers.
  const clientAccount = account ? {
    status: account.status,
    displayPhoneNumber: account.displayPhoneNumber,
    businessAccountId: account.businessAccountId,
    phoneNumberId: account.phoneNumberId,
    connectedAt: account.createdAt
  } : null

  return (
    <div className="max-w-3xl animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-black text-foreground">Pengaturan WhatsApp</h2>
        <p className="mt-1 text-sm text-muted-foreground">Hubungkan akun WhatsApp Business Anda untuk melayani pelanggan langsung dari ShowroomOS.</p>
      </div>
      
      <WhatsAppSettingsClient 
        account={clientAccount}
        metaAppId={process.env.META_APP_ID || ''}
        configId={process.env.WHATSAPP_CONFIGURATION_ID || ''}
      />
    </div>
  )
}
