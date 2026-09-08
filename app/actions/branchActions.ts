"use server"

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createBranch(data: {
  id?: string
  slug: string
  name: string
  city: string
  address: string
  mapUrl?: string
  ownerId: string
}) {
  try {
    // Ensure User exists before creating Branch
    const userExists = await prisma.user.findUnique({ where: { id: data.ownerId } });
    if (!userExists) {
      await prisma.user.create({
        data: {
          id: data.ownerId,
          name: 'Showroom Admin',
          email: `${data.ownerId}@denkenmotors.id`,
          role: 'OWNER'
        }
      });
    }

    const branch = await prisma.branch.create({
      data: {
        id: data.id,
        slug: data.slug,
        name: data.name,
        city: data.city,
        address: data.address,
        mapUrl: data.mapUrl || '',
        ownerId: data.ownerId,
      },
    })
    
    revalidatePath('/')
    return { success: true, branch }
  } catch (error) {
    console.error('Error creating branch:', error)
    return { success: false, error: 'Gagal membuat cabang' }
  }
}

export async function getBranches() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return branches
  } catch (error) {
    console.error('Error fetching branches:', error)
    return []
  }
}
