"use server"

import { prisma } from '@/lib/prisma'
import { requireAuth, requireManagerOrOwner } from './authActions'
import { whatsappProvider } from '@/lib/whatsapp/provider'
import { generateAIDraftResponse } from '@/lib/ai/lead-scoring'
import { revalidatePath } from 'next/cache'

// Helper for tenant isolation & RBAC checks
async function verifyConversationAccess(conversationId: string) {
  const { membership, user } = await requireAuth()

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      customer: { include: { leads: true } }
    }
  })

  if (!conversation || conversation.showroomId !== membership.showroomId) {
    throw new Error('Akses ditolak atau percakapan tidak ditemukan.')
  }

  // RBAC: SALES logic
  if (membership.role === 'SALES') {
    const isAssigned = conversation.assignedToUserId === membership.userId
    const hasAssignedLead = conversation.customer.leads.some(l => l.assignedTo === membership.userId)

    if (!isAssigned && !hasAssignedLead) {
      throw new Error('Akses ditolak. Percakapan ini tidak ditugaskan kepada Anda.')
    }
  }

  return { conversation, membership, user }
}

export async function getInboxConversations(filter: string = 'all', cursor?: string) {
  try {
    const { membership } = await requireAuth()

    const whereClause: any = {
      showroomId: membership.showroomId
    }

    if (membership.role === 'SALES') {
      whereClause.OR = [
        { assignedToUserId: membership.userId },
        { customer: { leads: { some: { assignedTo: membership.userId } } } }
      ]
    }

    if (filter === 'unread') {
      whereClause.unreadCount = { gt: 0 }
    } else if (filter === 'assigned_to_me') {
      whereClause.assignedToUserId = membership.userId
    } else if (filter === 'unassigned') {
      whereClause.assignedToUserId = null
    } else if (filter === 'open') {
      whereClause.status = 'ACTIVE'
    } else if (filter === 'closed') {
      whereClause.status = 'CLOSED'
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      take: 20,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        lastMessageAt: 'desc'
      },
      include: {
        customer: {
          select: { id: true, name: true, phone: true, leads: { select: { status: true, assignedTo: true } } }
        },
        tags: true
      }
    })

    const hasNextPage = conversations.length === 20
    const nextCursor = hasNextPage ? conversations[conversations.length - 1].id : null

    return { success: true, conversations, nextCursor }
  } catch (error: any) {
    console.error('Error fetching inbox conversations:', error)
    return { success: false, error: error.message || 'Gagal memuat daftar percakapan.' }
  }
}

export async function getConversationMessages(conversationId: string, cursor?: string) {
  try {
    const { conversation } = await verifyConversationAccess(conversationId)

    const messages = await prisma.message.findMany({
      where: { conversationId },
      take: 50,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' } // fetch descending for pagination, frontend will reverse
    })

    const hasNextPage = messages.length === 50
    const nextCursor = hasNextPage ? messages[messages.length - 1].id : null

    return { success: true, messages: messages.reverse(), nextCursor, conversation }
  } catch (error: any) {
    console.error('Error fetching conversation messages:', error)
    return { success: false, error: error.message || 'Gagal memuat pesan.' }
  }
}

export async function sendInboxMessage(conversationId: string, body: string) {
  try {
    if (!body || !body.trim()) {
      return { success: false, error: 'Pesan tidak boleh kosong.' }
    }

    const { conversation, membership } = await verifyConversationAccess(conversationId)

    const account = await prisma.whatsAppAccount.findUnique({
      where: { showroomId: membership.showroomId }
    })

    if (!account) {
      return { success: false, error: 'Showroom Anda belum mengkonfigurasi akun WhatsApp.' }
    }

    const result = await whatsappProvider.sendMessage({
      to: conversation.customer.phone,
      body: body.trim(),
      phoneNumberId: account.phoneNumberId,
      accessToken: account.accessToken || undefined
    })

    const now = new Date()

    if (!result.success) {
      // Save FAILED outbound message
      await prisma.$transaction([
        prisma.message.create({
          data: {
            conversationId,
            showroomId: membership.showroomId,
            direction: 'OUTBOUND',
            body: body.trim(),
            status: 'FAILED',
            failedReason: result.error || 'Gagal mengirim pesan.',
            sentByUserId: membership.userId,
            createdAt: now
          }
        }),
        prisma.conversation.update({
          where: { id: conversationId },
          data: {
            lastMessageAt: now,
            lastMessagePreview: body.trim().substring(0, 50)
          }
        })
      ])
      revalidatePath('/admin/inbox')
      return { success: false, error: result.error || 'Gagal mengirim pesan.' }
    }

    // Save outbound message and update conversation atomic
    await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          showroomId: membership.showroomId,
          direction: 'OUTBOUND',
          body: body.trim(),
          externalMessageId: result.messageId,
          status: 'QUEUED',
          sentByUserId: membership.userId,
          createdAt: now
        }
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: now,
          lastMessagePreview: body.trim().substring(0, 50)
        }
      })
    ])

    revalidatePath('/admin/inbox')

    return { success: true }
  } catch (error: any) {
    console.error('Error sending inbox message:', error)
    return { success: false, error: error.message || 'Terjadi kesalahan saat mengirim pesan.' }
  }
}

export async function markConversationAsRead(conversationId: string) {
  try {
    const { membership } = await requireAuth()
    
    // Explicitly verify access first so a user can't mark someone else's conv as read
    await verifyConversationAccess(conversationId)

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 }
    })

    revalidatePath('/admin/inbox')
    return { success: true }
  } catch (error: any) {
    console.error('Error marking as read:', error)
    return { success: false, error: error.message || 'Gagal mengubah status baca.' }
  }
}

export async function assignConversation(conversationId: string, userId: string | null) {
  try {
    // Only Manager or Owner can assign
    await requireManagerOrOwner()
    
    // Check if the user doing the assignment has access to the conversation's tenant
    const { conversation } = await verifyConversationAccess(conversationId)

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { assignedToUserId: userId }
    })

    revalidatePath('/admin/inbox')
    return { success: true }
  } catch (error: any) {
    console.error('Error assigning conversation:', error)
    return { success: false, error: error.message || 'Gagal menugaskan percakapan.' }
  }
}

export async function updateConversationStatus(conversationId: string, status: string) {
  try {
    await verifyConversationAccess(conversationId)

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status }
    })

    revalidatePath('/admin/inbox')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating status:', error)
    return { success: false, error: error.message || 'Gagal mengubah status percakapan.' }
  }
}

export async function draftInboxReplyWithAI(conversationId: string, customerMessage: string, additionalContext?: string) {
  try {
    const { conversation } = await verifyConversationAccess(conversationId)

    // Formulate a lead-like object for the AI function to reuse existing logic
    const leadContext = conversation.customer.leads[0] || {
      id: conversation.customerId, // fallback if no lead
      showroomId: conversation.showroomId,
      assignedTo: conversation.assignedToUserId,
      status: 'Inbox Inquiry',
      carName: null,
      source: 'WHATSAPP'
    }

    const aiDraft = await generateAIDraftResponse(leadContext, customerMessage, additionalContext)

    if (!aiDraft) {
      return { success: false, error: 'Draft AI sementara tidak tersedia. Silakan buat balasan secara manual.' }
    }

    return { success: true, aiDraft }
  } catch (error: any) {
    console.error('Error drafting AI reply in inbox:', error)
    return { success: false, error: error.message || 'Draft AI sementara tidak tersedia.' }
  }
}

// ------------------------------------------------------------------
// PHASE 3.6: CONVERSATION TAGS
// ------------------------------------------------------------------

export async function getConversationTags() {
  try {
    const { membership } = await requireAuth()
    const tags = await prisma.conversationTag.findMany({
      where: { showroomId: membership.showroomId },
      orderBy: { name: 'asc' }
    })
    return { success: true, tags }
  } catch (error: any) {
    console.error('Error fetching tags:', error)
    return { success: false, error: 'Gagal memuat tag.' }
  }
}

export async function createConversationTag(name: string, color?: string) {
  try {
    await requireManagerOrOwner() // Only manager or owner can create tags
    const { membership } = await requireAuth()
    
    if (!name || !name.trim()) return { success: false, error: 'Nama tag tidak boleh kosong.' }

    const tag = await prisma.conversationTag.create({
      data: {
        showroomId: membership.showroomId,
        name: name.trim().toUpperCase(),
        color
      }
    })
    
    revalidatePath('/admin/inbox')
    return { success: true, tag }
  } catch (error: any) {
    console.error('Error creating tag:', error)
    if (error.code === 'P2002') return { success: false, error: 'Tag dengan nama ini sudah ada.' }
    return { success: false, error: error.message || 'Gagal membuat tag.' }
  }
}

export async function assignTagToConversation(conversationId: string, tagId: string) {
  try {
    const { membership } = await verifyConversationAccess(conversationId)
    
    // Verify tag belongs to tenant
    const tag = await prisma.conversationTag.findUnique({ where: { id: tagId } })
    if (!tag || tag.showroomId !== membership.showroomId) {
      return { success: false, error: 'Tag tidak valid.' }
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        tags: { connect: { id: tagId } }
      }
    })

    revalidatePath('/admin/inbox')
    return { success: true }
  } catch (error: any) {
    console.error('Error assigning tag:', error)
    return { success: false, error: error.message || 'Gagal menambahkan tag.' }
  }
}

export async function removeTagFromConversation(conversationId: string, tagId: string) {
  try {
    // verifyConversationAccess already handles RBAC. A sales can remove tag from their own conversation.
    await verifyConversationAccess(conversationId)

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        tags: { disconnect: { id: tagId } }
      }
    })

    revalidatePath('/admin/inbox')
    return { success: true }
  } catch (error: any) {
    console.error('Error removing tag:', error)
    return { success: false, error: error.message || 'Gagal menghapus tag.' }
  }
}

// ------------------------------------------------------------------
// PHASE 3.6: FOLLOW-UPS
// ------------------------------------------------------------------

export async function getFollowUps(filter: 'TODAY' | 'OVERDUE' | 'UPCOMING' | 'COMPLETED' = 'TODAY') {
  try {
    const { membership } = await requireAuth()
    
    const whereClause: any = { showroomId: membership.showroomId }
    if (membership.role === 'SALES') {
      whereClause.assignedToUserId = membership.userId
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrowStart = new Date(todayStart)
    tomorrowStart.setDate(tomorrowStart.getDate() + 1)

    if (filter === 'COMPLETED') {
      whereClause.status = 'DONE'
    } else {
      whereClause.status = 'PENDING'
      if (filter === 'TODAY') {
        whereClause.dueAt = { gte: todayStart, lt: tomorrowStart }
      } else if (filter === 'OVERDUE') {
        whereClause.dueAt = { lt: todayStart }
      } else if (filter === 'UPCOMING') {
        whereClause.dueAt = { gte: tomorrowStart }
      }
    }

    const followUps = await prisma.followUp.findMany({
      where: whereClause,
      orderBy: { dueAt: 'asc' },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    })

    return { success: true, followUps }
  } catch (error: any) {
    console.error('Error fetching follow-ups:', error)
    return { success: false, error: 'Gagal memuat follow-ups.' }
  }
}

export async function createFollowUp(conversationId: string, dueAt: Date, note: string, assignedToUserId?: string) {
  try {
    const { conversation, membership } = await verifyConversationAccess(conversationId)
    
    if (!note || !note.trim()) return { success: false, error: 'Catatan tidak boleh kosong.' }

    // If SALES, they can only assign to themselves. If Manager/Owner, they can assign to anyone.
    let finalAssignee = membership.userId
    if (membership.role !== 'SALES' && assignedToUserId) {
      // Ensure target user is in the same tenant
      const targetUser = await prisma.userMembership.findUnique({
        where: { userId_showroomId: { userId: assignedToUserId, showroomId: membership.showroomId } }
      })
      if (!targetUser) return { success: false, error: 'User tidak ditemukan di showroom ini.' }
      finalAssignee = assignedToUserId
    } else if (membership.role === 'SALES' && assignedToUserId && assignedToUserId !== membership.userId) {
      return { success: false, error: 'Sales hanya bisa menugaskan follow-up untuk diri sendiri.' }
    }

    const followUp = await prisma.followUp.create({
      data: {
        showroomId: membership.showroomId,
        conversationId,
        customerId: conversation.customerId,
        assignedToUserId: finalAssignee,
        dueAt,
        note: note.trim()
      }
    })

    revalidatePath(`/admin/customers/${conversation.customerId}`)
    revalidatePath('/admin/follow-ups')
    return { success: true, followUp }
  } catch (error: any) {
    console.error('Error creating follow-up:', error)
    return { success: false, error: error.message || 'Gagal membuat follow-up.' }
  }
}

export async function updateFollowUpStatus(followUpId: string, status: 'DONE' | 'CANCELLED') {
  try {
    const { membership } = await requireAuth()
    
    const followUp = await prisma.followUp.findUnique({ where: { id: followUpId } })
    if (!followUp || followUp.showroomId !== membership.showroomId) {
      return { success: false, error: 'Follow-up tidak ditemukan.' }
    }

    if (membership.role === 'SALES' && followUp.assignedToUserId !== membership.userId) {
      return { success: false, error: 'Anda hanya dapat mengubah follow-up milik Anda sendiri.' }
    }

    await prisma.followUp.update({
      where: { id: followUpId },
      data: { status }
    })

    revalidatePath('/admin/follow-ups')
    revalidatePath(`/admin/customers/${followUp.customerId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error updating follow-up:', error)
    return { success: false, error: 'Gagal mengubah status follow-up.' }
  }
}

// ------------------------------------------------------------------
// PHASE 3.6: NOTIFICATIONS
// ------------------------------------------------------------------

export async function getNotifications() {
  try {
    const { membership } = await requireAuth()
    
    const notifications = await prisma.notification.findMany({
      where: { userId: membership.userId, showroomId: membership.showroomId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: membership.userId, showroomId: membership.showroomId, isRead: false }
    })

    return { success: true, notifications, unreadCount }
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return { success: false, error: 'Gagal memuat notifikasi.' }
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    const { membership } = await requireAuth()
    
    const notif = await prisma.notification.findUnique({ where: { id: notificationId } })
    if (!notif || notif.showroomId !== membership.showroomId || notif.userId !== membership.userId) {
      return { success: false, error: 'Notifikasi tidak ditemukan.' }
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error marking notification as read:', error)
    return { success: false, error: 'Gagal menandai notifikasi.' }
  }
}

export async function markAllNotificationsRead() {
  try {
    const { membership } = await requireAuth()
    
    await prisma.notification.updateMany({
      where: { userId: membership.userId, showroomId: membership.showroomId, isRead: false },
      data: { isRead: true }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error)
    return { success: false, error: 'Gagal menandai notifikasi.' }
  }
}

// ------------------------------------------------------------------
// PHASE 3.6: ANALYTICS
// ------------------------------------------------------------------

export async function getInboxAnalytics() {
  try {
    const { membership } = await requireAuth()
    
    const whereClause: any = { showroomId: membership.showroomId }
    if (membership.role === 'SALES') {
      whereClause.assignedToUserId = membership.userId
    }

    const [
      totalConversations,
      openConversations,
      closedConversations,
      messagesSent,
      messagesReceived,
      followUpsPending,
      followUpsOverdue
    ] = await Promise.all([
      prisma.conversation.count({ where: whereClause }),
      prisma.conversation.count({ where: { ...whereClause, status: 'ACTIVE' } }),
      prisma.conversation.count({ where: { ...whereClause, status: 'CLOSED' } }),
      
      // Messages sent by this tenant (or this sales rep if restricted)
      prisma.message.count({ 
        where: { 
          showroomId: membership.showroomId, 
          direction: 'OUTBOUND',
          ...(membership.role === 'SALES' ? { conversation: { assignedToUserId: membership.userId } } : {})
        } 
      }),
      
      // Messages received
      prisma.message.count({ 
        where: { 
          showroomId: membership.showroomId, 
          direction: 'INBOUND',
          ...(membership.role === 'SALES' ? { conversation: { assignedToUserId: membership.userId } } : {})
        } 
      }),

      prisma.followUp.count({ where: { ...whereClause, status: 'PENDING' } }),
      prisma.followUp.count({ where: { ...whereClause, status: 'PENDING', dueAt: { lt: new Date() } } })
    ])

    return { 
      success: true, 
      analytics: {
        totalConversations,
        openConversations,
        closedConversations,
        messagesSent,
        messagesReceived,
        followUpsPending,
        followUpsOverdue
      } 
    }
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return { success: false, error: 'Gagal memuat analitik inbox.' }
  }
}
