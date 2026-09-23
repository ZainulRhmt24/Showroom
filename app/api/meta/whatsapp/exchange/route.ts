import { NextResponse } from 'next/server'
import { requireAuth } from '@/app/actions/authActions'
import { prisma } from '@/lib/prisma'
import { encryptToken } from '@/lib/encryption'

export async function POST(req: Request) {
  try {
    const { membership, showroom } = await requireAuth()

    if (membership.role !== 'OWNER') {
      return NextResponse.json({ success: false, error: 'Hanya OWNER yang dapat menghubungkan WhatsApp.' }, { status: 403 })
    }

    const { code } = await req.json()
    if (!code) {
      return NextResponse.json({ success: false, error: 'Authorization code tidak valid.' }, { status: 400 })
    }

    const appId = process.env.META_APP_ID
    const appSecret = process.env.META_APP_SECRET
    const apiVersion = process.env.META_GRAPH_API_VERSION || 'v20.0'

    if (!appId || !appSecret) {
      console.error('META_APP_ID or META_APP_SECRET is missing from environment variables.')
      return NextResponse.json({ success: false, error: 'Konfigurasi Meta di server belum lengkap.' }, { status: 500 })
    }

    // 1. Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/${apiVersion}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`
    const tokenRes = await fetch(tokenUrl)
    const tokenData = await tokenRes.json()

    if (tokenData.error) {
      console.error('Meta Token Exchange Error:', tokenData.error)
      return NextResponse.json({ success: false, error: 'Gagal menukar kode otorisasi dengan Meta.' }, { status: 400 })
    }

    const accessToken = tokenData.access_token

    // 2. Discover WABA ID using debug_token
    const debugUrl = `https://graph.facebook.com/${apiVersion}/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`
    const debugRes = await fetch(debugUrl)
    const debugData = await debugRes.json()

    if (debugData.error || !debugData.data) {
      console.error('Meta Debug Token Error:', debugData.error)
      return NextResponse.json({ success: false, error: 'Gagal memverifikasi token dengan Meta.' }, { status: 400 })
    }

    // Extract WABA ID from granular_scopes
    const scopes = debugData.data.granular_scopes || []
    const messagingScope = scopes.find((s: any) => s.scope === 'whatsapp_business_messaging' || s.scope === 'whatsapp_business_management')
    
    let wabaId = null
    if (messagingScope && messagingScope.target_ids && messagingScope.target_ids.length > 0) {
      wabaId = messagingScope.target_ids[0]
    }

    if (!wabaId) {
      console.error('WABA ID not found in token scopes:', debugData.data)
      return NextResponse.json({ success: false, error: 'Tidak dapat menemukan WhatsApp Business Account dari otorisasi ini.' }, { status: 400 })
    }

    // 3. Discover Phone Number ID
    const phoneUrl = `https://graph.facebook.com/${apiVersion}/${wabaId}/phone_numbers?access_token=${accessToken}`
    const phoneRes = await fetch(phoneUrl)
    const phoneData = await phoneRes.json()

    if (phoneData.error || !phoneData.data || phoneData.data.length === 0) {
      console.error('Meta Phone Number Discovery Error:', phoneData.error)
      return NextResponse.json({ success: false, error: 'Tidak dapat menemukan nomor telepon di WhatsApp Business Account Anda.' }, { status: 400 })
    }

    // Usually, we just pick the first number or the one that is verified.
    const phoneNumberObj = phoneData.data[0]
    const phoneNumberId = phoneNumberObj.id
    const displayPhoneNumber = phoneNumberObj.display_phone_number

    // 4. Provision WhatsAppAccount
    // Tenant Binding & Isolation: check if this phoneNumberId is already used by another showroom
    const existingAccount = await prisma.whatsAppAccount.findUnique({
      where: { phoneNumberId }
    })

    if (existingAccount && existingAccount.showroomId !== showroom.id) {
      return NextResponse.json({ success: false, error: 'Nomor telepon ini sudah digunakan oleh showroom lain. Harap gunakan nomor yang berbeda atau hubungi support.' }, { status: 403 })
    }

    const encryptedToken = encryptToken(accessToken)

    // Upsert the connection securely
    await prisma.whatsAppAccount.upsert({
      where: { showroomId: showroom.id },
      update: {
        phoneNumberId,
        businessAccountId: wabaId,
        displayPhoneNumber,
        accessToken: encryptedToken,
        status: 'ACTIVE',
        updatedAt: new Date()
      },
      create: {
        showroomId: showroom.id,
        phoneNumberId,
        businessAccountId: wabaId,
        displayPhoneNumber,
        accessToken: encryptedToken,
        status: 'ACTIVE'
      }
    })

    // 5. Subscribe App to WABA
    const subscribeUrl = `https://graph.facebook.com/${apiVersion}/${wabaId}/subscribed_apps?access_token=${accessToken}`
    const subscribeRes = await fetch(subscribeUrl, { method: 'POST' })
    const subscribeData = await subscribeRes.json()

    let subscriptionSuccess = true
    if (subscribeData.error || !subscribeData.success) {
      console.error('Meta App Subscription Error:', subscribeData.error)
      subscriptionSuccess = false
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        businessAccountId: wabaId,
        phoneNumberId,
        displayPhoneNumber,
        subscriptionSuccess
      } 
    })
  } catch (error: any) {
    console.error('Token exchange error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan sistem saat memproses integrasi WhatsApp.' }, { status: 500 })
  }
}
