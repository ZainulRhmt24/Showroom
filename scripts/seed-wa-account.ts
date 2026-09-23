const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Ambil salah satu showroom (showroom pertama)
  const showroom = await prisma.showroom.findFirst()
  
  if (!showroom) {
    console.log("Belum ada showroom di database. Silakan login dan buat showroom terlebih dahulu.")
    return
  }

  // Cek apakah sudah ada akun WA
  const existing = await prisma.whatsAppAccount.findUnique({
    where: { showroomId: showroom.id }
  })

  if (existing) {
    console.log(`Showroom ${showroom.name} sudah memiliki konfigurasi WhatsApp.`)
    return
  }

  // Buat konfigurasi dummy WA
  const waAccount = await prisma.whatsAppAccount.create({
    data: {
      showroomId: showroom.id,
      phoneNumberId: 'DUMMY_PHONE_ID_123',
      displayPhoneNumber: '+6281234567890',
      status: 'ACTIVE'
    }
  })

  console.log(`✅ Berhasil membuat konfigurasi Dummy WhatsApp untuk showroom: ${showroom.name}`)
  console.log('Sekarang Anda bisa mengirim pesan (Draft/Simulasi) dari halaman Inbox CRM.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
