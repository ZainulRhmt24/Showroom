"use server"

import { prisma } from '@/lib/prisma'
import { requireAuth } from './authActions'
import { calculateDeterministicScore, generateAILeadExplanation, generateAIDraftResponse } from '@/lib/ai/lead-scoring'
import { revalidatePath } from 'next/cache'

export async function analyzeLeadWithAI(leadId: string) {
  try {
    const { membership } = await requireAuth()

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        activities: {
          select: { id: true, type: true }
        }
      }
    })

    if (!lead || lead.showroomId !== membership.showroomId) {
      return { success: false, error: 'Akses ditolak.' }
    }

    if (membership.role === 'SALES' && lead.assignedTo !== membership.userId) {
      return { success: false, error: 'Akses ditolak. Lead tidak ditugaskan kepada Anda.' }
    }

    // Calculate Deterministic Score
    const { score, priority } = calculateDeterministicScore(lead, lead.activities)

    // Prepare anonymized data for AI
    const anonymizedData = {
      status: lead.status,
      type: lead.type,
      source: lead.source,
      carName: lead.carName,
      createdAt: lead.createdAt.toISOString().split('T')[0],
      nextFollowUpAt: lead.nextFollowUpAt ? lead.nextFollowUpAt.toISOString().split('T')[0] : null,
      activityCount: lead.activities.length
    }

    // Call AI Explanation Layer
    const aiExplanation = await generateAILeadExplanation(anonymizedData, score, priority)

    // Save to Database
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        aiScore: score,
        aiPriority: priority,
        aiExplanation: aiExplanation as any,
        aiScoredAt: new Date()
      }
    })

    if (lead.customerId) {
      revalidatePath(`/admin/customers/${lead.customerId}`)
    }
    revalidatePath('/admin/pipeline')

    return { success: true, aiScore: score, aiPriority: priority, aiExplanation }
  } catch (error) {
    console.error('Error in analyzeLeadWithAI:', error)
    return { success: false, error: 'Gagal menganalisis lead.' }
  }
}

export async function draftReplyWithAI(leadId: string, customerMessage: string, additionalContext?: string) {
  try {
    const { membership } = await requireAuth()

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        showroomId: true,
        assignedTo: true,
        status: true,
        carName: true,
        source: true
      }
    })

    if (!lead || lead.showroomId !== membership.showroomId) {
      return { success: false, error: 'Akses ditolak.' }
    }

    if (membership.role === 'SALES' && lead.assignedTo !== membership.userId) {
      return { success: false, error: 'Akses ditolak. Lead tidak ditugaskan kepada Anda.' }
    }

    // Call AI Draft Generator
    const aiDraft = await generateAIDraftResponse(lead, customerMessage, additionalContext)

    if (!aiDraft) {
      return { success: false, error: 'Draft AI sementara tidak tersedia. Silakan buat balasan secara manual.' }
    }

    return { success: true, aiDraft }
  } catch (error) {
    console.error('Error in draftReplyWithAI:', error)
    return { success: false, error: 'Draft AI sementara tidak tersedia. Silakan buat balasan secara manual.' }
  }
}
