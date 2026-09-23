"use server"

import { prisma } from '@/lib/prisma'
import { requireAuth } from './authActions'
import { whatsappProvider } from '@/lib/whatsapp/provider'
import { revalidatePath } from 'next/cache'

export async function getConversations(customerId: string) {
  try {
    const { membership } = await requireAuth()

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { leads: true }
    })

    if (!customer || customer.showroomId !== membership.showroomId) {
      return { success: false, error: 'Akses ditolak.' }
    }

    // RBAC: If SALES, ensure the customer has a lead assigned to them
    if (membership.role === 'SALES') {
      const assignedLead = customer.leads.find(l => l.assignedTo === membership.userId)
      if (!assignedLead) {
        return { success: false, error: 'Akses ditolak. Customer tidak ditugaskan kepada Anda.' }
      }
    }

    let conversation = await prisma.conversation.findFirst({
      where: { customerId: customer.id, showroomId: customer.showroomId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!conversation) {
      // Create a default empty conversation if none exists so UI can start one
      conversation = await prisma.conversation.create({
        data: {
          showroomId: customer.showroomId,
          customerId: customer.id,
          channel: 'WHATSAPP',
          status: 'ACTIVE'
        },
        include: { messages: true }
      })
    }

    return { success: true, conversation }
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return { success: false, error: 'Gagal memuat percakapan.' }
  }
}

export async function sendManualMessage(conversationId: string, body: string) {
  try {
    const { membership } = await requireAuth()

    if (!body || !body.trim()) {
      return { success: false, error: 'Pesan tidak boleh kosong.' }
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        customer: {
          include: { leads: true }
        }
      }
    })

    if (!conversation || conversation.showroomId !== membership.showroomId) {
      return { success: false, error: 'Akses ditolak.' }
    }

    const customer = conversation.customer

    // RBAC check
    if (membership.role === 'SALES') {
      const assignedLead = customer.leads.find(l => l.assignedTo === membership.userId)
      if (!assignedLead) {
        return { success: false, error: 'Akses ditolak. Anda tidak berhak mengirim pesan ke customer ini.' }
      }
    }

    if (!customer.phone) {
      return { success: false, error: 'Customer tidak memiliki nomor telepon.' }
    }

    // Retrieve the Showroom's WhatsApp Account
    const account = await prisma.whatsAppAccount.findUnique({
      where: { showroomId: membership.showroomId }
    })

    if (!account) {
      return { success: false, error: 'Showroom Anda belum mengkonfigurasi akun WhatsApp.' }
    }

    // Attempt to send via Provider securely
    const result = await whatsappProvider.sendMessage({
      to: customer.phone,
      body: body.trim(),
      phoneNumberId: account.phoneNumberId,
      accessToken: account.accessToken || undefined
    })

    if (!result.success) {
      await prisma.$transaction([
        prisma.message.create({
          data: {
            conversationId: conversation.id,
            showroomId: membership.showroomId,
            direction: 'OUTBOUND',
            body: body.trim(),
            status: 'FAILED',
            failedReason: result.error || 'Gagal mengirim pesan.',
            createdAt: new Date()
          }
        }),
        prisma.leadActivity.create({
          data: {
            showroomId: membership.showroomId,
            customerId: customer.id,
            type: 'WHATSAPP',
            content: `Gagal mengirim pesan via WhatsApp API: ${body.trim().substring(0, 50)}${body.length > 50 ? '...' : ''}`,
            createdById: membership.userId
          }
        })
      ])
      revalidatePath(`/admin/customers/${customer.id}`)
      return { success: false, error: result.error || 'Gagal mengirim pesan.' }
    }

    // Save outbound message to DB and Lead Activity
    await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          showroomId: membership.showroomId,
          direction: 'OUTBOUND',
          body: body.trim(),
          externalMessageId: result.messageId,
          status: 'QUEUED',
          createdAt: new Date()
        }
      }),
      prisma.leadActivity.create({
        data: {
          showroomId: membership.showroomId,
          customerId: customer.id,
          type: 'WHATSAPP',
          content: `WhatsApp terkirim: ${body.trim().substring(0, 50)}${body.length > 50 ? '...' : ''}`,
          createdById: membership.userId
        }
      })
    ])

    revalidatePath(`/admin/customers/${customer.id}`)

    return { success: true }
  } catch (error) {
    console.error('Error sending manual message:', error)
    return { success: false, error: 'Terjadi kesalahan sistem.' }
  }
}
