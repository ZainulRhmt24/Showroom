"use server"

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from './authActions'
import { LeadSource, ActivityType } from '@prisma/client'
import { normalizePhone } from '@/lib/utils'

export async function getCustomers() {
  try {
    const { membership } = await requireAuth()
    
    let whereClause: any = { showroomId: membership.showroomId }
    
    // SALES only sees customers that have at least one lead explicitly assigned to them
    if (membership.role === 'SALES') {
      whereClause.leads = {
        some: {
          assignedTo: membership.userId
        }
      }
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { leads: true }
        }
      }
    })
    
    return customers
  } catch (error) {
    console.error('Error fetching customers:', error)
    return []
  }
}

export async function getCustomerById(id: string) {
  try {
    const { membership } = await requireAuth()

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        leads: {
          include: {
            car: true,
            branch: true,
          },
          orderBy: { createdAt: 'desc' }
        },
        activities: {
          include: {
            createdBy: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        followUps: {
          orderBy: { dueAt: 'asc' },
          include: {
            assignedTo: { select: { name: true } }
          }
        }
      }
    })

    if (!customer || customer.showroomId !== membership.showroomId) {
      return null
    }

    // Role Validation for SALES
    if (membership.role === 'SALES') {
      const hasAssignedLead = customer.leads.some(l => l.assignedTo === membership.userId)
      if (!hasAssignedLead) {
        return null // Sales can't view customer profile if they don't have leads assigned
      }
    }

    return customer
  } catch (error) {
    console.error('Error fetching customer:', error)
    return null
  }
}

export async function createCustomer(data: {
  name: string
  phone: string
  email?: string
  address?: string
  source?: LeadSource
  notes?: string
}) {
  try {
    const { membership, user } = await requireAuth()
    
    const normalizedPhone = normalizePhone(data.phone)
    
    // Check duplication within the tenant
    const existing = await prisma.customer.findFirst({
      where: {
        showroomId: membership.showroomId,
        phone: normalizedPhone
      }
    })

    if (existing) {
      return { success: false, isDuplicate: true, customer: existing, error: 'Customer dengan nomor ini sudah ada.' }
    }

    const customer = await prisma.customer.create({
      data: {
        ...data,
        phone: normalizedPhone,
        showroomId: membership.showroomId
      }
    })
    
    // Log Activity
    await prisma.leadActivity.create({
      data: {
        showroomId: membership.showroomId,
        customerId: customer.id,
        type: 'NOTE',
        content: `Customer baru ditambahkan oleh ${user.name}`,
        createdById: membership.userId
      }
    })

    revalidatePath('/admin/customers')
    return { success: true, customer }
  } catch (error) {
    console.error('Error creating customer:', error)
    return { success: false, error: 'Gagal membuat customer.' }
  }
}

export async function updateCustomer(id: string, data: {
  name?: string
  phone?: string
  email?: string
  address?: string
  source?: LeadSource
  notes?: string
}) {
  try {
    const { membership } = await requireAuth()
    
    const existing = await prisma.customer.findUnique({
      where: { id },
      include: { leads: true }
    })

    if (!existing || existing.showroomId !== membership.showroomId) {
      return { success: false, error: 'Akses ditolak.' }
    }

    // Role check: Only MANAGER/OWNER or SALES assigned to a lead can edit
    if (membership.role === 'SALES') {
      const hasAssignedLead = existing.leads.some(l => l.assignedTo === membership.userId)
      if (!hasAssignedLead) {
        return { success: false, error: 'Akses ditolak.' }
      }
    }

    let normalizedPhone = existing.phone
    if (data.phone) {
      normalizedPhone = normalizePhone(data.phone)
      
      if (normalizedPhone !== existing.phone) {
        const dupe = await prisma.customer.findFirst({
          where: { showroomId: membership.showroomId, phone: normalizedPhone }
        })
        if (dupe) {
          return { success: false, error: 'Nomor telepon sudah terdaftar di sistem.' }
        }
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...data,
        phone: normalizedPhone
      }
    })

    revalidatePath('/admin/customers')
    revalidatePath(`/admin/customers/${id}`)
    return { success: true, customer }
  } catch (error) {
    console.error('Error updating customer:', error)
    return { success: false, error: 'Gagal memperbarui customer.' }
  }
}

export async function createLeadActivity(data: {
  customerId?: string
  leadId?: string
  type: ActivityType
  content: string
}) {
  try {
    const { membership } = await requireAuth()

    // Needs at least one to be valid
    if (!data.customerId && !data.leadId) {
      return { success: false, error: 'Data tidak lengkap' }
    }

    const activity = await prisma.leadActivity.create({
      data: {
        showroomId: membership.showroomId,
        customerId: data.customerId || null,
        leadId: data.leadId || null,
        type: data.type,
        content: data.content,
        createdById: membership.userId
      }
    })

    if (data.customerId) revalidatePath(`/admin/customers/${data.customerId}`)
    if (data.leadId) revalidatePath(`/admin/pipeline`)
      
    return { success: true, activity }
  } catch (error) {
    console.error('Error creating activity:', error)
    return { success: false, error: 'Gagal menambah aktivitas.' }
  }
}
