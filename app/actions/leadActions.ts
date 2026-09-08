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
    const targetOwnerId = data.ownerId || 'admin_owner_1';
    
    // Ensure User exists to prevent Foreign Key constraint error
    const userExists = await prisma.user.findUnique({ where: { id: targetOwnerId } });
    if (!userExists) {
      await prisma.user.create({
        data: {
          id: targetOwnerId,
          name: 'Showroom Admin',
          email: `${targetOwnerId}@denkenmotors.id`,
          role: 'OWNER'
        }
      });
    }

    // Ensure Car exists to prevent Foreign Key constraint error
    let validCarId = data.carId;
    if (validCarId) {
      const carExists = await prisma.car.findUnique({ where: { id: validCarId } });
      if (!carExists) {
        validCarId = undefined; // Drop relational link, but keep carName
      }
    }

    const lead = await prisma.lead.create({
      data: {
        type: data.type,
        name: data.name,
        whatsapp: data.whatsapp,
        email: data.email,
        city: data.city,
        carId: validCarId,
        carName: data.carName,
        details: data.details || {},
        ownerId: targetOwnerId,
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
    } else if (status !== 'Disetujui' && lead.carId) {
      // Revert if status changed back from approved
      await prisma.car.update({
        where: { id: lead.carId },
        data: {
          isSoldOut: false,
          badge: 'READY STOCK',
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
    const lead = await prisma.lead.findUnique({ where: { id } })
    if (lead && lead.status === 'Disetujui' && lead.carId) {
      await prisma.car.update({
        where: { id: lead.carId },
        data: {
          isSoldOut: false,
          badge: 'READY STOCK',
        },
      })
      revalidatePath('/')
      revalidatePath(`/mobil/${lead.carId}`)
    }

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
