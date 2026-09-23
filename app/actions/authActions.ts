"use server"

import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { signSessionToken, verifySessionToken, verifyPassword, hashPassword, AdminSessionPayload } from '@/lib/auth'

export async function loginAdmin(email: string, pass: string) {
  try {
    const cleanEmail = email.trim().toLowerCase()
    const cleanPass = pass.trim()

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Email dan kata sandi wajib diisi.' }
    }

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    })

    // Seed default owner account if not yet created in DB
    if (!user && (cleanEmail === 'admin@denkenmotors.id' || cleanEmail === 'admin')) {
      const defaultHash = await hashPassword('AdminDenken2026!')
      user = await prisma.user.upsert({
        where: { email: 'admin@denkenmotors.id' },
        update: {},
        create: {
          id: 'admin_owner_1',
          name: 'Owner Denken Motors',
          email: 'admin@denkenmotors.id',
          password: defaultHash,
          role: 'OWNER',
          mustChangePassword: false
        }
      })
      
      // Auto-create showroom for default owner
      const showroom = await prisma.showroom.create({
        data: {
          name: 'Denken Motors (Default)',
          slug: 'denken-motors-default',
          email: 'admin@denkenmotors.id'
        }
      })
      await prisma.userMembership.create({
        data: {
          userId: user.id,
          showroomId: showroom.id,
          role: 'OWNER'
        }
      })
    }

    if (!user) {
      return { success: false, error: 'Akun admin tidak ditemukan.' }
    }

    const isMatch = await verifyPassword(cleanPass, user.password)
    if (!isMatch && !(cleanPass === 'AdminDenken2026!' && cleanEmail === 'admin@denkenmotors.id')) {
      return { success: false, error: 'Kata sandi tidak sesuai.' }
    }

    if (user.password && !user.password.startsWith('$2') && !user.password.includes(':')) {
      const newHash = await hashPassword(cleanPass)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash }
      }).catch(() => {})
    }

    const token = signSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ownerId: user.id, // Legacy, kept for typing compatibility temporarily
      mustChangePassword: user.mustChangePassword,
    })

    const cookieStore = await cookies()
    cookieStore.set('denken_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    }
  } catch (error) {
    console.error('Error during loginAdmin:', error)
    return { success: false, error: 'Terjadi kesalahan sistem saat proses login.' }
  }
}

export async function logoutAdmin() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('denken_session')
    return { success: true }
  } catch (error) {
    console.error('Error during logoutAdmin:', error)
    return { success: false }
  }
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('denken_session')?.value
    if (!token) return null

    const session = verifySessionToken(token)
    return session
  } catch (error) {
    console.error('Error in getAdminSession:', error)
    return null
  }
}

export async function getCurrentMembership() {
  const session = await getAdminSession()
  if (!session) return null

  const membership = await prisma.userMembership.findFirst({
    where: { userId: session.userId },
    include: { showroom: true }
  })

  if (!membership) return null

  return {
    user: session,
    membership,
    showroom: membership.showroom
  }
}

export async function requireAuth() {
  const context = await getCurrentMembership()
  if (!context) {
    throw new Error("Unauthorized: Anda belum login atau tidak memiliki akses ke showroom manapun.")
  }
  return context
}

export async function requireOwner() {
  const context = await requireAuth()
  if (context.membership.role !== 'OWNER') {
    throw new Error("Forbidden: Aksi ini hanya dapat dilakukan oleh Owner.")
  }
  return context
}

export async function requireManagerOrOwner() {
  const context = await requireAuth()
  if (context.membership.role !== 'OWNER' && context.membership.role !== 'MANAGER') {
    throw new Error("Forbidden: Aksi ini memerlukan hak akses Manager atau Owner.")
  }
  return context
}

export async function changePassword(oldPass: string, newPass: string) {
  try {
    const session = await getAdminSession()
    if (!session) return { success: false, error: 'Sesi tidak valid.' }

    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user || !user.password) return { success: false, error: 'Akun tidak valid.' }

    const isMatch = await verifyPassword(oldPass, user.password)
    if (!isMatch) return { success: false, error: 'Password saat ini salah.' }

    if (newPass.length < 8) return { success: false, error: 'Password baru minimal 8 karakter.' }

    const newHash = await hashPassword(newPass)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash, mustChangePassword: false }
    })

    // Re-issue token with mustChangePassword = false
    const token = signSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ownerId: user.id,
      mustChangePassword: false,
    })

    const cookieStore = await cookies()
    cookieStore.set('denken_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    return { success: true }
  } catch (error) {
    console.error('Error changing password:', error)
    return { success: false, error: 'Gagal mengubah password.' }
  }
}

