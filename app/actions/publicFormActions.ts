"use server"

import { prisma } from '@/lib/prisma'

export async function getPublicCarsForForm(slug: string) {
  try {
    let showroom = await prisma.showroom.findUnique({
      where: { slug }
    })
    
    // Fallback untuk legacy route (seperti /jakarta) yang mungkin tidak ada di DB
    if (!showroom) {
      showroom = await prisma.showroom.findFirst()
    }
    
    if (!showroom) return []

    const cars = await prisma.car.findMany({
      where: { 
        showroomId: showroom.id,
        badge: { not: 'SOLD OUT' }
      },
      select: {
        id: true,
        name: true,
        brand: true,
        price: true,
        image: true,
        year: true,
        transmission: true,
        engine: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return cars
  } catch (error) {
    console.error("Error fetching cars for form:", error)
    return []
  }
}

export async function submitPublicLead(slug: string, data: {
  name: string
  whatsapp: string
  email?: string
  city?: string
  carId?: string
  carName?: string
  dp?: string
  tenor?: string
  paymentType?: string
  insuranceType?: string
  subject?: string
  message?: string
  tradeInDetails?: Record<string, any>
}) {
  try {
    let showroom = await prisma.showroom.findUnique({
      where: { slug }
    })

    if (!showroom) {
      showroom = await prisma.showroom.findFirst()
    }

    if (!showroom) return { success: false, error: 'Showroom tidak ditemukan' }

    // Buat Lead berdasarkan skema lama
    await prisma.lead.create({
      data: {
        showroomId: showroom.id,
        type: data.tradeInDetails ? 'Trade_In' : (data.subject === 'Beli Cash' ? 'Cash' : (data.subject === 'Konsultasi Pembelian' ? 'Kontak' : 'Kredit')),
        name: data.name,
        whatsapp: data.whatsapp,
        email: data.email || null,
        city: data.city || null,
        carId: data.carId || null,
        carName: data.carName || null,
        status: 'Baru',
        details: {
          dp: data.dp,
          tenor: data.tenor,
          paymentType: data.paymentType,
          insuranceType: data.insuranceType,
          subject: data.subject,
          message: data.message,
          ...data.tradeInDetails
        },
        notes: `
Nama Lengkap: ${data.name}
Kota Domisili: ${data.city || '-'}
Kendaraan: ${data.carName || '-'}
Rencana DP: ${data.dp ? `Rp ${Number(data.dp).toLocaleString('id-ID')}` : '-'}
Tenor: ${data.tenor ? `${data.tenor} Tahun` : '-'}
Skema Pembayaran: ${data.paymentType || '-'}
Asuransi: ${data.insuranceType || '-'}
${data.subject ? `Subject: ${data.subject}` : ''}
${data.message ? `Pesan: ${data.message}` : ''}
${data.tradeInDetails ? `Data Trade-In:
- Merek/Model Lama: ${data.tradeInDetails.oldCar?.brand} ${data.tradeInDetails.oldCar?.model}
- Tahun: ${data.tradeInDetails.oldCar?.year}
- Estimasi Penawaran: Rp ${Number(data.tradeInDetails.appraisalValue).toLocaleString('id-ID')}` : ''}
        `.trim()
      }
    })

    // (Opsional) Buat Customer jika memakai skema CRM baru
    let customer = await prisma.customer.findFirst({
      where: { phone: data.whatsapp, showroomId: showroom.id }
    })

    if (!customer) {
      await prisma.customer.create({
        data: {
          showroomId: showroom.id,
          name: data.name,
          phone: data.whatsapp,
          email: data.email,
          address: data.city,
          source: 'WEBSITE'
        }
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error submitting lead:", error)
    return { success: false, error: 'Gagal mengirim pengajuan' }
  }
}
