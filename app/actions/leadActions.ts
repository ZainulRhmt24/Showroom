"use server"

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { LeadType, LeadStatus, LeadSource, ActivityType } from '@prisma/client'
import { requireAuth, requireManagerOrOwner } from './authActions'
import { normalizePhone } from '@/lib/utils'

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
  showroomId?: string
  branchId?: string
  assignedTo?: string
  source?: LeadSource
  customerId?: string
  nextFollowUpAt?: Date
}) {
  try {
    let validCarId = data.carId;
    if (validCarId) {
      const carExists = await prisma.car.findUnique({ where: { id: validCarId } });
      if (!carExists) {
        validCarId = undefined; // Drop relational link, but keep carName
      }
    }

    let targetShowroomId = data.showroomId;
    if (!targetShowroomId && data.ownerId) {
      const membership = await prisma.userMembership.findFirst({
        where: { userId: data.ownerId }
      });
      if (membership) {
        targetShowroomId = membership.showroomId;
      }
    }

    if (!targetShowroomId) {
      // Fallback for absolute default
      const defaultShowroom = await prisma.showroom.findFirst();
      if (defaultShowroom) {
        targetShowroomId = defaultShowroom.id;
      }
    }

    let targetCustomerId = data.customerId;

    if (!targetCustomerId && data.whatsapp) {
      const normalizedPhone = normalizePhone(data.whatsapp);
      
      // Upsert Customer
      let customer = await prisma.customer.findFirst({
        where: { showroomId: targetShowroomId, phone: normalizedPhone }
      });
      
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            showroomId: targetShowroomId as string,
            name: data.name,
            phone: normalizedPhone,
            email: data.email,
            source: data.source,
          }
        });
      }
      
      targetCustomerId = customer.id;
    }

    const { membership, user } = await requireAuth().catch(() => ({ membership: null, user: null }));

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
        showroomId: targetShowroomId as string,
        branchId: data.branchId || null,
        assignedTo: data.assignedTo || null,
        ownerId: data.ownerId, // Legacy fallback
        source: data.source,
        customerId: targetCustomerId,
        nextFollowUpAt: data.nextFollowUpAt
      },
    })
    
    if (membership && targetCustomerId) {
      await prisma.leadActivity.create({
        data: {
          showroomId: targetShowroomId as string,
          customerId: targetCustomerId,
          leadId: lead.id,
          type: ActivityType.NOTE,
          content: `Lead baru dibuat (${data.type}) oleh ${user ? user.name : 'Sistem'}`,
          createdById: membership.userId
        }
      })
    }
    
    revalidatePath('/admin')
    revalidatePath('/admin/pipeline')
    if (targetCustomerId) revalidatePath(`/admin/customers/${targetCustomerId}`)
    
    return { success: true, lead }
  } catch (error) {
    console.error('Error creating lead:', error)
    return { success: false, error: 'Gagal membuat prospek pelanggan' }
  }
}

export async function getLeads(ownerId?: string) {
  try {
    const { membership } = await requireAuth()
    
    let whereClause: any = { showroomId: membership.showroomId }
    
    // SALES only sees leads assigned to them explicitly
    // Business Rule Recommendation: SALES only sees explicitly assigned leads
    if (membership.role === 'SALES') {
      whereClause.assignedTo = membership.userId
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { 
        car: true,
        branch: { select: { name: true } },
        customer: true
      }
    })
    
    // We attach the assigned user info on the fly to avoid changing schema further
    // by fetching users based on assignedTo string (userId)
    const assignedUserIds = leads.map(l => l.assignedTo).filter(Boolean)
    const assignedUsers = await prisma.user.findMany({
      where: { id: { in: assignedUserIds as string[] } },
      select: { id: true, name: true }
    })
    
    return leads.map(l => ({
      ...l,
      assignedUser: assignedUsers.find(u => u.id === l.assignedTo) || null
    }))
  } catch (error) {
    console.error('Error fetching leads:', error)
    return []
  }
}

export async function updateLeadStatus(id: string, status: LeadStatus, assignedTo?: string, notes?: string) {
  try {
    const { membership, user } = await requireAuth()
    const existing = await prisma.lead.findUnique({ where: { id } })
    if (!existing || existing.showroomId !== membership.showroomId) {
      return { success: false, error: 'Akses ditolak' }
    }
    if (membership.role === 'SALES' && existing.assignedTo !== membership.userId) {
      return { success: false, error: 'Anda hanya dapat mengubah prospek yang ditugaskan kepada Anda' }
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        status,
        ...(assignedTo !== undefined ? { assignedTo } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    })

    // Log Activity for status change
    if (existing.status !== status) {
      await prisma.leadActivity.create({
        data: {
          showroomId: membership.showroomId,
          customerId: existing.customerId,
          leadId: existing.id,
          type: ActivityType.STATUS_CHANGE,
          content: `Status diubah dari ${existing.status} ke ${status} oleh ${user.name}`,
          createdById: membership.userId
        }
      })
    }

    // Log Activity for Note if any note was just appended or passed specifically
    if (notes && notes !== existing.notes) {
      await prisma.leadActivity.create({
        data: {
          showroomId: membership.showroomId,
          customerId: existing.customerId,
          leadId: existing.id,
          type: ActivityType.NOTE,
          content: `Catatan baru: ${notes}`,
          createdById: membership.userId
        }
      })
    }

    if ((status === 'SPK' || status === 'Disetujui' || status === 'Selesai') && lead.carId) {
      const badgeText = status === 'SPK' ? 'BOOKED' : 'SOLD OUT'
      await prisma.car.update({
        where: { id: lead.carId },
        data: {
          isSoldOut: true,
          badge: badgeText,
        },
      }).catch(() => {})
      revalidatePath('/')
      revalidatePath(`/mobil/${lead.carId}`)
    } else if (lead.carId) {
      await prisma.car.update({
        where: { id: lead.carId },
        data: {
          isSoldOut: false,
          badge: 'READY STOCK',
        },
      }).catch(() => {})
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

export async function updateLeadDetails(id: string, data: { assignedTo?: string; notes?: string; status?: LeadStatus, nextFollowUpAt?: Date | null }) {
  try {
    const { membership, user } = await requireAuth()
    const existing = await prisma.lead.findUnique({ where: { id } })
    if (!existing || existing.showroomId !== membership.showroomId) {
      return { success: false, error: 'Akses ditolak' }
    }
    if (membership.role === 'SALES' && existing.assignedTo !== membership.userId) {
      return { success: false, error: 'Anda hanya dapat mengubah prospek yang ditugaskan kepada Anda' }
    }

    const lead = await prisma.lead.update({
      where: { id },
      data,
    })
    
    // Log Activity if follow-up changed
    if (data.nextFollowUpAt !== undefined) {
      await prisma.leadActivity.create({
        data: {
          showroomId: membership.showroomId,
          customerId: existing.customerId,
          leadId: existing.id,
          type: ActivityType.FOLLOW_UP,
          content: data.nextFollowUpAt ? `Follow-up dijadwalkan ulang oleh ${user.name}` : `Follow-up dibatalkan/selesai oleh ${user.name}`,
          createdById: membership.userId
        }
      })
    }

    revalidatePath('/admin')
    revalidatePath('/admin/pipeline')
    if (existing.customerId) revalidatePath(`/admin/customers/${existing.customerId}`)
    
    return { success: true, lead }
  } catch (error) {
    console.error('Error updating lead details:', error)
    return { success: false, error: 'Gagal memperbarui data prospek' }
  }
}

export async function deleteLead(id: string) {
  try {
    const { membership } = await requireManagerOrOwner()
    const existing = await prisma.lead.findUnique({ where: { id } })
    if (!existing || existing.showroomId !== membership.showroomId) {
      return { success: false, error: 'Akses ditolak' }
    }

    if (existing.status === 'Disetujui' && existing.carId) {
      await prisma.car.update({
        where: { id: existing.carId },
        data: {
          isSoldOut: false,
          badge: 'READY STOCK',
        },
      })
      revalidatePath('/')
      revalidatePath(`/mobil/${existing.carId}`)
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
