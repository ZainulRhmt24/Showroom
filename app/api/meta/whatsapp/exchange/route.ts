import { NextResponse } from 'next/server'
import { requireOwner } from '@/app/actions/authActions'
import { prisma } from '@/lib/prisma'
import { encryptToken } from '@/lib/encryption'

export async function POST(req: Request) {
  try {
    const { showroom } = await requireOwner()
    const { code, browserWabaId } = await req.json()

    if (!code) {
      return NextResponse.json({ success: false, error: 'Authorization code tidak valid.' }, { status: 400 })
    }

    const appId = process.env.META_APP_ID
    const appSecret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET
    const apiVersion = process.env.META_GRAPH_API_VERSION || 'v25.0'

    if (!appId || !appSecret) {
      console.error('META_APP_ID or WHATSAPP_APP_SECRET is missing from environment variables.')
      return NextResponse.json({ success: false, error: 'Konfigurasi Meta di server belum lengkap.' }, { status: 500 })
    }

    // 1. Exchange code for access token using GET (as per Meta docs for FB JS SDK)
    const tokenUrl = `https://graph.facebook.com/${apiVersion}/oauth/access_token`
    const params = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      code,
      redirect_uri: 'https://showroom-os-wktd.vercel.app/admin/settings/whatsapp'
    })

    const tokenRes = await fetch(`${tokenUrl}?${params.toString()}`)
    const tokenData = await tokenRes.json()

    if (!tokenRes.ok || tokenData.error) {
      console.error('Meta Token Exchange Failed:', {
        status: tokenRes.status,
        error: tokenData.error?.message
      })
      return NextResponse.json({ success: false, error: 'Gagal menukar kode otorisasi dengan Meta.' }, { status: 400 })
    }

    const accessToken = tokenData.access_token

    // 2. Discover WABA ID using debug_token
    const debugUrl = `https://graph.facebook.com/${apiVersion}/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`
    const debugRes = await fetch(debugUrl)
    const debugData = await debugRes.json()

    if (debugData.error || !debugData.data || !debugData.data.is_valid) {
      console.error('Meta Debug Token Error or Invalid', debugData)
      return NextResponse.json({ success: false, error: 'Gagal memverifikasi token dengan Meta.' }, { status: 400 })
    }

    console.log('Debug token valid:', debugData.data.is_valid)
    
    // Check scopes
    const scopes = debugData.data.granular_scopes || []
    const messagingScopes = scopes.filter((s: any) => s.scope === 'whatsapp_business_messaging' || s.scope === 'whatsapp_business_management')
    
    let verifiedWabaId = null
    for (const scope of messagingScopes) {
      if (scope.target_ids && scope.target_ids.length > 0) {
        verifiedWabaId = scope.target_ids[0]
        break
      }
    }

    console.log('WABA ID present:', !!verifiedWabaId, '| Target ID Count:', messagingScopes.reduce((acc: number, cur: any) => acc + (cur.target_ids?.length || 0), 0))

    if (!verifiedWabaId) {
      console.error('WABA discovery failed: debug token contains no WhatsApp target_ids')
      return NextResponse.json({ success: false, error: 'Tidak dapat menemukan WhatsApp Business Account (Target ID kosong).' }, { status: 400 })
    }

    if (browserWabaId && browserWabaId !== verifiedWabaId) {
      console.error(`Browser WABA ID (${browserWabaId}) does not match Token Target ID (${verifiedWabaId})`)
      return NextResponse.json({ success: false, error: 'Verifikasi akun WhatsApp tidak valid (Mismatch).' }, { status: 400 })
    }

    // 3. Discover Phone Number ID
    const phoneUrl = `https://graph.facebook.com/${apiVersion}/${verifiedWabaId}/phone_numbers?access_token=${accessToken}`
    const phoneRes = await fetch(phoneUrl)
    const phoneData = await phoneRes.json()

    if (phoneData.error || !phoneData.data || phoneData.data.length === 0) {
      console.error('Meta Phone Number Discovery Error:', phoneData.error)
      return NextResponse.json({ success: false, error: 'Tidak dapat menemukan nomor telepon di WhatsApp Business Account Anda.' }, { status: 400 })
    }

    const phoneNumberObj = phoneData.data[0]
    const phoneNumberId = phoneNumberObj.id
    const displayPhoneNumber = phoneNumberObj.display_phone_number

    console.log('Phone ID present:', !!phoneNumberId)

    // 4. Provision WhatsAppAccount
    const existingAccount = await prisma.whatsAppAccount.findUnique({
      where: { phoneNumberId }
    })

    if (existingAccount && existingAccount.showroomId !== showroom.id) {
      return NextResponse.json({ success: false, error: 'Nomor telepon ini sudah digunakan oleh showroom lain. Harap gunakan nomor yang berbeda.' }, { status: 403 })
    }

    const encryptedToken = encryptToken(accessToken)

    await prisma.whatsAppAccount.upsert({
      where: { showroomId: showroom.id },
      update: {
        phoneNumberId,
        businessAccountId: verifiedWabaId,
        displayPhoneNumber,
        accessToken: encryptedToken,
        status: 'CONNECTED',
        updatedAt: new Date()
      },
      create: {
        showroomId: showroom.id,
        phoneNumberId,
        businessAccountId: verifiedWabaId,
        displayPhoneNumber,
        accessToken: encryptedToken,
        status: 'CONNECTED'
      }
    })

    // 5. Subscribe App to WABA
    const subscribeUrl = `https://graph.facebook.com/${apiVersion}/${verifiedWabaId}/subscribed_apps?access_token=${accessToken}`
    const subscribeRes = await fetch(subscribeUrl, { method: 'POST' })
    const subscribeData = await subscribeRes.json()

    if (subscribeData.error || !subscribeData.success) {
      console.error('Meta App Subscription Error:', subscribeData.error)
    }

    return NextResponse.json({
      success: true,
      data: {
        businessAccountId: verifiedWabaId,
        phoneNumberId,
        displayPhoneNumber
      }
    })
  } catch (error: any) {
    console.error('Token exchange error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan sistem saat memproses integrasi WhatsApp.' }, { status: 500 })
  }
}
