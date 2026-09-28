import { NextResponse } from 'next/server'
import { requireOwner } from '@/app/actions/authActions'
import crypto from 'crypto'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    await requireOwner()
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientId = process.env.META_APP_ID
  const configId = process.env.WHATSAPP_CONFIGURATION_ID
  
  if (!clientId || !configId) {
    return NextResponse.json({ error: 'Meta config missing' }, { status: 500 })
  }

  const state = crypto.randomBytes(32).toString('hex')
  const cookieStore = await cookies()
  cookieStore.set('whatsapp_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600 // 10 minutes
  })

  const redirectUri = 'https://showroom-os-wktd.vercel.app/api/meta/whatsapp/callback'
  
  const authUrl = new URL('https://www.facebook.com/v25.0/dialog/oauth')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('config_id', configId)
  authUrl.searchParams.set('state', state)

  console.log('Starting WhatsApp OAuth flow')

  return NextResponse.redirect(authUrl.toString())
}
