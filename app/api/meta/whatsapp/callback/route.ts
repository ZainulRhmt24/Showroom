import { NextResponse } from 'next/server'
import { requireOwner } from '@/app/actions/authActions'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { encryptToken } from '@/lib/encryption'

export async function GET(request: Request) {
  try {
    const { showroom } = await requireOwner()
    
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    const safeBaseUrl = new URL(request.url).origin

    if (error) {
       console.error('Meta OAuth Error:', error, searchParams.get('error_description'))
       return NextResponse.redirect(`${safeBaseUrl}/admin/settings/whatsapp?error=whatsapp_connect_failed`)
    }

    const cookieStore = await cookies()
    const storedState = cookieStore.get('whatsapp_oauth_state')?.value
    
    // Clear state
    cookieStore.delete('whatsapp_oauth_state')

    if (!state || !storedState || state !== storedState) {
       console.error('Invalid OAuth state', { state: state ? 'provided' : 'missing', storedState: storedState ? 'exists' : 'missing' })
       return NextResponse.redirect(`${safeBaseUrl}/admin/settings/whatsapp?error=whatsapp_connect_failed`)
    }

    if (!code) {
       console.error('Missing code from Meta')
       return NextResponse.redirect(`${safeBaseUrl}/admin/settings/whatsapp?error=whatsapp_connect_failed`)
    }

    const clientId = process.env.META_APP_ID
    const clientSecret = process.env.WHATSAPP_APP_SECRET
    const redirectUri = 'https://showroom-os-wktd.vercel.app/api/meta/whatsapp/callback'

    if (!clientId || !clientSecret) {
       console.error('Missing META_APP_ID or WHATSAPP_APP_SECRET')
       return NextResponse.redirect(`${safeBaseUrl}/admin/settings/whatsapp?error=whatsapp_connect_failed`)
    }

    console.log('WhatsApp OAuth callback received, state valid, exchanging code')

    // 1. Exchange Code
    const tokenUrl = `https://graph.facebook.com/v25.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`
    
    const tokenRes = await fetch(tokenUrl)
    const tokenData = await tokenRes.json()

    if (!tokenRes.ok || !tokenData.access_token) {
       console.error('Token exchange failed', tokenRes.status, tokenData)
       return NextResponse.redirect(`${safeBaseUrl}/admin/settings/whatsapp?error=whatsapp_connect_failed`)
    }

    const accessToken = tokenData.access_token

    // 2. Debug Token to find WABA (from granular scopes)
    const debugRes = await fetch(`https://graph.facebook.com/v25.0/debug_token?input_token=${accessToken}&access_token=${clientId}|${clientSecret}`)
    const debugData = await debugRes.json()

    if (!debugRes.ok || !debugData.data || !debugData.data.is_valid) {
      console.error('Debug token failed', debugData)
      return NextResponse.redirect(`${safeBaseUrl}/admin/settings/whatsapp?error=whatsapp_connect_failed`)
    }

    let wabaId = debugData.data.granular_scopes?.find((s: any) => s.scope === 'whatsapp_business_management' || s.scope === 'whatsapp_business_messaging')?.target_ids?.[0]

    // 3. Fallback: Fetch WABA directly if not in scopes
    if (!wabaId) {
       const wabaRes = await fetch(`https://graph.facebook.com/v25.0/me/whatsapp_business_accounts?access_token=${accessToken}`)
       const wabaData = await wabaRes.json()
       if (!wabaRes.ok || !wabaData.data?.[0]?.id) {
           console.error('WABA discovery failed', wabaData)
           return NextResponse.redirect(`${safeBaseUrl}/admin/settings/whatsapp?error=whatsapp_connect_failed`)
       }
       wabaId = wabaData.data[0].id
    }

    // 4. Discover phone numbers
    const phoneRes = await fetch(`https://graph.facebook.com/v25.0/${wabaId}/phone_numbers?access_token=${accessToken}`)
    const phoneData = await phoneRes.json()
    
    if (!phoneRes.ok || !phoneData.data?.[0]) {
       console.error('Phone number discovery failed', phoneData)
       return NextResponse.redirect(`${safeBaseUrl}/admin/settings/whatsapp?error=whatsapp_connect_failed`)
    }

    const phoneObj = phoneData.data[0]
    const phoneNumberId = phoneObj.id
    const displayPhoneNumber = phoneObj.display_phone_number

    console.log('Discovered WABA success', { wabaId: !!wabaId, phoneNumberId: !!phoneNumberId })

    // 5. Encrypt token
    const encryptedToken = encryptToken(accessToken)

    // 6. Upsert WhatsAppAccount
    const existingAccount = await prisma.whatsAppAccount.findUnique({
      where: { showroomId: showroom.id }
    })

    if (existingAccount) {
      await prisma.whatsAppAccount.update({
        where: { id: existingAccount.id },
        data: {
          accessToken: encryptedToken,
          businessAccountId: wabaId,
          phoneNumberId: phoneNumberId,
          displayPhoneNumber: displayPhoneNumber,
          status: 'CONNECTED',
          updatedAt: new Date()
        }
      })
    } else {
      await prisma.whatsAppAccount.create({
        data: {
          showroomId: showroom.id,
          accessToken: encryptedToken,
          businessAccountId: wabaId,
          phoneNumberId: phoneNumberId,
          displayPhoneNumber: displayPhoneNumber,
          status: 'CONNECTED'
        }
      })
    }

    // 7. Subscribe to webhooks
    const subRes = await fetch(`https://graph.facebook.com/v25.0/${wabaId}/subscribed_apps`, {
      method: 'POST',
      headers: {
         'Authorization': `Bearer ${accessToken}`,
         'Content-Type': 'application/json'
      }
    })
    
    if (!subRes.ok) {
       console.error('Failed to subscribe app to WABA webhooks', await subRes.json())
       // Still proceed since token and account is saved successfully
    }

    return NextResponse.redirect(`${safeBaseUrl}/admin/settings/whatsapp?connected=1`)
  } catch (error) {
    console.error('Unexpected error in WhatsApp OAuth callback:', error)
    const safeBaseUrl = new URL(request.url).origin
    return NextResponse.redirect(`${safeBaseUrl}/admin/settings/whatsapp?error=whatsapp_connect_failed`)
  }
}
