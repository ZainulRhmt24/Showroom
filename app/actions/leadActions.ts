"use server"

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { LeadType, LeadStatus } from '@prisma/client'

export async function createLead(data: {
  type: LeadType
  name: string
  whatsapp: string
  email?: string
  city?: string
  carId?: string
  carName?: string
  details?: Record<string, any>
  ownerId?: string
}) {
  try {
    const lead = await prisma.lead.create({
      data: {
        type: data.type,
        name: data.name,
        whatsapp: data.whatsapp,
        email: data.email,
        city: data.city,
        carId: data.carId,
        carName: data.carName,
        details: data.details || {},
        ownerId: data.ownerId || 'admin_owner_1',
      },
    })
    
    // Revalidate dashboard and paths if necessary
    revalidatePath('/admin')
    return { success: true, lead }
  } catch (error) {
    console.error('Error creating lead:', error)
    return { success: false, error: 'Gagal membuat prospek pelanggan' }
  }
}

export async function getLeads(ownerId: string = 'admin_owner_1') {
  try {
    const leads = await prisma.lead.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: { car: true }
    })
    return leads
  } catch (error) {
    console.error('Error fetching leads:', error)
    return []
  }
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  try {
    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
    })

    // If status is Disetujui, auto mark car as sold out
    if (status === 'Disetujui' && lead.carId) {
      await prisma.car.update({
        where: { id: lead.carId },
        data: {
          isSoldOut: true,
          badge: 'SOLD OUT',
        },
      })
      revalidatePath('/')
      revalidatePath(`/mobil/${lead.carId}`)
    }

    revalidatePath('/admin')
    return { success: true, lead }
  } catch (error) {
    console.error('Error updating lead status:', error)
    return { success: false, error: 'Gagal memperbarui status prospek' }
  }
}

export async function deleteLead(id: string) {
  try {
    await prisma.lead.delete({
      where: { id },
    })
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error deleting lead:', error)
    return { success: false, error: 'Gagal menghapus prospek' }
  }
}
