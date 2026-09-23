'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/app/actions/authActions'
import { requireManagerOrOwner } from '@/app/actions/authActions'
import { prisma } from '@/lib/prisma'

/** Protected admin helper; it never accepts a showroom id from the browser. */
export async function getCurrentPublicWebsite() {
  const { showroom } = await requireAuth()
  return { slug: showroom.slug, path: `/showroom/${showroom.slug}` }
}

const profileFields = ['name', 'logo', 'tagline', 'description', 'phone', 'whatsapp', 'email', 'address', 'city', 'province', 'heroTitle', 'heroDescription', 'primaryContactLabel', 'instagramUrl', 'facebookUrl'] as const
type ProfileField = typeof profileFields[number]
type PublicProfileInput = Partial<Record<ProfileField, string | null>>

const asNullableText = (value: unknown, maxLength = 2_000) => {
  if (typeof value !== 'string') return null
  const text = value.trim().slice(0, maxLength)
  return text || null
}

function asNullableUrl(value: unknown) {
  const text = asNullableText(value, 500)
  if (!text) return null
  if (text.startsWith('/')) return text
  try {
    const url = new URL(text)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch { return null }
}

export async function getPublicWebsiteSettings() {
  const { showroom } = await requireAuth()
  return prisma.showroom.findUnique({
    where: { id: showroom.id },
    select: { slug: true, name: true, logo: true, tagline: true, description: true, phone: true, whatsapp: true, email: true, address: true, city: true, province: true, heroTitle: true, heroDescription: true, primaryContactLabel: true, instagramUrl: true, facebookUrl: true },
  })
}

/** Minimal tenant-scoped public profile editor; this never accepts a showroom id. */
export async function updatePublicWebsiteSettings(input: PublicProfileInput) {
  try {
    const { showroom } = await requireManagerOrOwner()
    const data = {
      name: asNullableText(input.name, 160) || showroom.name,
      logo: asNullableUrl(input.logo),
      tagline: asNullableText(input.tagline, 280),
      description: asNullableText(input.description, 2_000),
      phone: asNullableText(input.phone, 40),
      whatsapp: asNullableText(input.whatsapp, 40),
      email: asNullableText(input.email, 254),
      address: asNullableText(input.address, 500),
      city: asNullableText(input.city, 120),
      province: asNullableText(input.province, 120),
      heroTitle: asNullableText(input.heroTitle, 180),
      heroDescription: asNullableText(input.heroDescription, 500),
      primaryContactLabel: asNullableText(input.primaryContactLabel, 80),
      instagramUrl: asNullableUrl(input.instagramUrl),
      facebookUrl: asNullableUrl(input.facebookUrl),
    }
    await prisma.showroom.update({ where: { id: showroom.id }, data })
    revalidatePath(`/showroom/${showroom.slug}`)
    revalidatePath(`/showroom/${showroom.slug}/about`)
    revalidatePath(`/showroom/${showroom.slug}/contact`)
    revalidatePath(`/showroom/${showroom.slug}/branches`)
    return { success: true }
  } catch (error) {
    console.error('Error updating public website settings:', error)
    return { success: false, error: 'Gagal menyimpan pengaturan website publik.' }
  }
}
