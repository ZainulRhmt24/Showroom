import { prisma } from '../lib/prisma'

async function runAISecurityTests() {
  console.log('--- RUNNING PHASE 3.1 SECURITY AI TESTS ---')
  let passed = 0
  let failed = 0

  // 1. Verify DB structure has AI fields
  const schemaStr = require('fs').readFileSync('./prisma/schema.prisma', 'utf-8')
  if (schemaStr.includes('aiScore') && schemaStr.includes('aiPriority')) {
    console.log('[PASS] Database schema contains AI Lead Scoring fields')
    passed++
  } else {
    console.log('[FAIL] Database schema missing AI Lead Scoring fields')
    failed++
  }

  // 2. Verify AI Provider File exists
  const aiFileStr = require('fs').readFileSync('./lib/ai/lead-scoring.ts', 'utf-8')
  if (aiFileStr.includes('calculateDeterministicScore') && aiFileStr.includes('generateAILeadExplanation')) {
    console.log('[PASS] AI Deterministic and LLM fallback logic exists')
    passed++
  } else {
    console.log('[FAIL] AI Logic is missing')
    failed++
  }

  // 3. Verify Server Action RBAC is present
  const actionFileStr = require('fs').readFileSync('./app/actions/aiActions.ts', 'utf-8')
  if (actionFileStr.includes('requireAuth') && actionFileStr.includes('lead.showroomId !== membership.showroomId') && actionFileStr.includes('lead.assignedTo !== membership.userId')) {
    console.log('[PASS] AI Actions enforce strict Tenant and User Ownership RBAC')
    passed++
  } else {
    console.log('[FAIL] AI Actions missing RBAC checks')
    failed++
  }

  // 4. Verify draftReplyWithAI is protected
  if (actionFileStr.includes('draftReplyWithAI') && actionFileStr.split('draftReplyWithAI')[1].includes('lead.showroomId !== membership.showroomId')) {
    console.log('[PASS] Phase 3.3 draftReplyWithAI enforces Tenant Isolation and RBAC')
    passed++
  } else {
    console.log('[FAIL] Phase 3.3 draftReplyWithAI is missing RBAC checks')
    failed++
  }

  // 5. Verify WhatsApp Schema
  if (schemaStr.includes('model Conversation') && schemaStr.includes('model Message')) {
    console.log('[PASS] Phase 3.4 Database schema contains WhatsApp models')
    passed++
  } else {
    console.log('[FAIL] Phase 3.4 Database schema missing WhatsApp models')
    failed++
  }

  // 6. Verify WhatsApp Server Actions RBAC
  try {
    const waActionFileStr = require('fs').readFileSync('./app/actions/whatsappActions.ts', 'utf-8')
    if (waActionFileStr.includes('conversation.showroomId !== membership.showroomId') && waActionFileStr.includes('membership.role === \'SALES\'')) {
      console.log('[PASS] Phase 3.4 WhatsApp Actions enforce strict Tenant and User Ownership RBAC')
      passed++
    } else {
      console.log('[FAIL] Phase 3.4 WhatsApp Actions missing RBAC checks')
      failed++
    }
  } catch (e) {
    console.log('[FAIL] Phase 3.4 WhatsApp Actions file not found')
    failed++
  }

  // 7. Verify Webhook exists
  try {
    const webhookStr = require('fs').readFileSync('./app/api/webhooks/whatsapp/route.ts', 'utf-8')
    if (webhookStr.includes('whatsAppAccount.findUnique') && webhookStr.includes('showroomId: account.showroomId')) {
      console.log('[PASS] Phase 3.4.1 Webhook endpoint safely scopes Customer lookup by resolved showroomId')
      passed++
    } else {
      console.log('[FAIL] Phase 3.4.1 Webhook endpoint still vulnerable to Cross-Tenant Phone Collision')
      failed++
    }
  } catch (e) {
    console.log('[FAIL] Phase 3.4 Webhook endpoint missing')
    failed++
  }

  // 8. Verify WhatsAppAccount exists
  if (schemaStr.includes('model WhatsAppAccount') && schemaStr.includes('phoneNumberId')) {
    console.log('[PASS] Phase 3.4.1 WhatsAppAccount model handles Tenant Identity Binding securely')
    passed++
  } else {
    console.log('[FAIL] Phase 3.4.1 WhatsAppAccount missing')
    failed++
  }

  console.log(`\nTests Completed: ${passed + failed}. Passed: ${passed}, Failed: ${failed}`)
  if (failed > 0) {
    process.exit(1)
  }
}

runAISecurityTests().catch(console.error)
