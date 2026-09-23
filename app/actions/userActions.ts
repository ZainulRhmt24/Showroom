"use server"

import { prisma } from '@/lib/prisma'

export async function createUser(data: any) {
  try {
    const user = await prisma.user.upsert({
      where: { id: data.id || '' },
      update: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role === 'Owner' ? 'OWNER' : (data.role === 'Manager' ? 'ADMIN' : 'USER'),
      },
      create: {
        id: data.id, // match with local zustand id if provided
        name: data.name,
        email: data.email,
        password: data.password, // Note: In production this should be hashed
        role: data.role === 'Owner' ? 'OWNER' : (data.role === 'Manager' ? 'ADMIN' : 'USER'),
      }
    })
    return { success: true, user }
  } catch (error) {
    console.error('Failed to create user in DB:', error)
    return { success: false, error }
  }
}
