import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { whatsappProvider } from '@/lib/whatsapp/provider'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-hub-signature-256')

    if (signature && !whatsappProvider.verifyWebhookSignature(signature, rawBody)) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    const payload = JSON.parse(rawBody)

    // Handle incoming WhatsApp Messages
    if (payload.object === 'whatsapp_business_account') {
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          if (change.value?.messages) {
            await handleIncomingMessages(change.value)
          }
          if (change.value?.statuses) {
            await handleMessageStatuses(change.value)
          }
        }
      }
    }

    // Acknowledge receipt to Meta
    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    // Always return 200 so Meta doesn't retry infinitely on fatal errors
    return new NextResponse('Error processed', { status: 200 })
  }
}

async function handleIncomingMessages(value: any) {
  const phoneNumberId = value.metadata.phone_number_id
  const messages = value.messages || []
  const contacts = value.contacts || []

  for (const message of messages) {
    const fromPhone = message.from
    const externalMessageId = message.id
    const timestamp = new Date(parseInt(message.timestamp) * 1000)

    let textBody = ''
    let messageType = 'TEXT'
    let mediaId = null
    let mimeType = null
    let fileName = null
    let fileSize = null

    if (message.type === 'text') {
      textBody = message.text.body
    } else if (['image', 'document', 'audio', 'video', 'sticker'].includes(message.type)) {
      messageType = message.type.toUpperCase()
      const mediaInfo = message[message.type]
      mediaId = mediaInfo.id
      mimeType = mediaInfo.mime_type
      textBody = mediaInfo.caption || ''
      if (message.type === 'document' && mediaInfo.filename) {
        fileName = mediaInfo.filename
      }
    } else {
      textBody = '[Unsupported Message Type]'
      messageType = 'UNSUPPORTED'
    }

    // IDEMPOTENCY CHECK
    const existingMessage = await prisma.message.findUnique({
      where: { externalMessageId }
    })
    if (existingMessage) continue; // Already processed

    // FIND TENANT VIA WhatsAppAccount
    const account = await prisma.whatsAppAccount.findUnique({
      where: { phoneNumberId }
    })

    if (!account) {
      console.warn(`Unknown phone_number_id: ${phoneNumberId}. Ignoring message from ${fromPhone}.`)
      continue
    }

    // RESOLVE CUSTOMER WITHIN TENANT
    const customer = await prisma.customer.findFirst({
      where: { 
        phone: fromPhone,
        showroomId: account.showroomId 
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!customer) {
      console.log(`Customer phone ${fromPhone} not found in showroom ${account.showroomId}. Skipping message.`)
      continue
    }

    // Upsert Conversation
    let conversation = await prisma.conversation.findFirst({
      where: { customerId: customer.id, showroomId: customer.showroomId }
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          showroomId: customer.showroomId,
          customerId: customer.id,
          channel: 'WHATSAPP',
          status: 'ACTIVE'
        }
      })
    } else {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: { 
          updatedAt: new Date(),
          unreadCount: { increment: 1 },
          lastMessageAt: new Date(),
          lastMessagePreview: textBody.substring(0, 50) || `[${messageType}]`
        }
      })
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        showroomId: customer.showroomId,
        direction: 'INBOUND',
        messageType,
        body: textBody,
        externalMessageId,
        status: 'RECEIVED',
        createdAt: timestamp,
        mediaId,
        mimeType,
        fileName,
        fileSize
      }
    })

    // Create Notification
    if (conversation.assignedToUserId) {
      await prisma.notification.create({
        data: {
          showroomId: customer.showroomId,
          userId: conversation.assignedToUserId,
          title: `Pesan baru dari ${customer.name}`,
          message: textBody.substring(0, 50) || `[${messageType}]`,
          type: 'WHATSAPP',
          link: `/admin/inbox?conversationId=${conversation.id}`
        }
      })
    }
  }
}

async function handleMessageStatuses(value: any) {
  const statuses = value.statuses || []
  
  for (const status of statuses) {
    const externalMessageId = status.id
    const mappedStatus = mapWhatsAppStatus(status.status)

    await prisma.message.updateMany({
      where: { externalMessageId },
      data: { status: mappedStatus as any }
    })
  }
}

function mapWhatsAppStatus(status: string) {
  switch (status) {
    case 'sent': return 'SENT'
    case 'delivered': return 'DELIVERED'
    case 'read': return 'READ'
    case 'failed': return 'FAILED'
    default: return 'QUEUED'
  }
}
