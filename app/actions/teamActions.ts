"use server"

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { requireAuth, requireManagerOrOwner, requireOwner } from './authActions'
import { hashPassword } from '@/lib/auth'

export type MembershipRole = 'OWNER' | 'MANAGER' | 'SALES'


// Get all team members in the current showroom
export async function getTeamMembers() {
  try {
    const { membership } = await requireManagerOrOwner()
    const members = await prisma.userMembership.findMany({
      where: { showroomId: membership.showroomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return members
  } catch (error) {
    console.error('Error fetching team members:', error)
    return []
  }
}

// Add a new team member
export async function addTeamMember(data: { name: string; email: string; role: MembershipRole; branchId?: string }) {
  try {
    const { membership: currentMembership } = await requireOwner()
    
    // Validate branch
    if (data.branchId) {
      const branch = await prisma.branch.findUnique({ where: { id: data.branchId } })
      if (!branch || branch.showroomId !== currentMembership.showroomId) {
        return { success: false, error: 'Cabang tidak valid atau akses ditolak' }
      }
    }

    // Check if user already exists globally
    let targetUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    let tempPassword: string | undefined
    if (!targetUser) {
      tempPassword = crypto.randomBytes(4).toString('hex') // 8 chars
      const hashedPass = await hashPassword(tempPassword)
      
      targetUser = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPass,
          mustChangePassword: true
        }
      })
    }

    // Check if membership already exists in this showroom
    const existingMembership = await prisma.userMembership.findUnique({
      where: {
        userId_showroomId: {
          userId: targetUser.id,
          showroomId: currentMembership.showroomId
        }
      }
    })

    if (existingMembership) {
      return { success: false, error: 'User ini sudah menjadi anggota showroom Anda.' }
    }

    const newMembership = await prisma.userMembership.create({
      data: {
        userId: targetUser.id,
        showroomId: currentMembership.showroomId,
        role: data.role,
        branchId: data.branchId || null
      },
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } },
        branch: { select: { id: true, name: true } }
      }
    })

    revalidatePath('/admin')
    revalidatePath('/admin/team')
    return { success: true, member: newMembership, tempPassword }
  } catch (error) {
    console.error('Error adding team member:', error)
    return { success: false, error: 'Gagal menambahkan anggota tim.' }
  }
}

// Update team member role
export async function updateTeamMemberRole(membershipId: string, newRole: MembershipRole, branchId?: string) {
  try {
    const { membership: currentMembership, user: currentUser } = await requireOwner()

    const targetMembership = await prisma.userMembership.findUnique({
      where: { id: membershipId }
    })

    if (!targetMembership || targetMembership.showroomId !== currentMembership.showroomId) {
      return { success: false, error: 'Anggota tim tidak ditemukan di showroom ini.' }
    }

    if (targetMembership.userId === currentUser.userId) {
      return { success: false, error: 'Anda tidak dapat mengubah role Anda sendiri dari menu ini.' }
    }

    if (branchId) {
      const branch = await prisma.branch.findUnique({ where: { id: branchId } })
      if (!branch || branch.showroomId !== currentMembership.showroomId) {
        return { success: false, error: 'Cabang tidak valid' }
      }
    }

    const updateData: { role: MembershipRole; branchId?: string | null } = { role: newRole }
    if (branchId !== undefined) {
      updateData.branchId = branchId || null
    }

    const updated = await prisma.userMembership.update({
      where: { id: membershipId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } },
        branch: { select: { id: true, name: true } }
      }
    })

    revalidatePath('/admin')
    revalidatePath('/admin/team')
    return { success: true, member: updated }
  } catch (error) {
    console.error('Error updating team member role:', error)
    return { success: false, error: 'Gagal mengubah role anggota tim.' }
  }
}

// Remove team member from showroom
export async function removeTeamMember(membershipId: string) {
  try {
    const { membership: currentMembership, user: currentUser } = await requireOwner()

    const targetMembership = await prisma.userMembership.findUnique({
      where: { id: membershipId }
    })

    if (!targetMembership || targetMembership.showroomId !== currentMembership.showroomId) {
      return { success: false, error: 'Anggota tim tidak ditemukan di showroom ini.' }
    }

    if (targetMembership.userId === currentUser.userId) {
      return { success: false, error: 'Anda tidak dapat menghapus diri Anda sendiri dari showroom.' }
    }

    await prisma.userMembership.delete({
      where: { id: membershipId }
    })

    revalidatePath('/admin')
    revalidatePath('/admin/team')
    return { success: true }
  } catch (error) {
    console.error('Error removing team member:', error)
    return { success: false, error: 'Gagal menghapus anggota tim dari showroom.' }
  }
}
