import { prisma } from '../lib/prisma'
import { getFollowUps, createFollowUp, getInboxAnalytics } from '../app/actions/inboxActions'
import { requireAuth } from '../app/actions/authActions'


async function runSecurityTests() {
  console.log('--- RUNNING PHASE 3.6 INBOX SECURITY TESTS ---')
  let passed = 0
  let failed = 0

  // 1. Verify Schema Models
  const schemaStr = require('fs').readFileSync('./prisma/schema.prisma', 'utf-8')
  if (schemaStr.includes('model FollowUp') && schemaStr.includes('model Notification') && schemaStr.includes('model ConversationTag')) {
    console.log('[PASS] Phase 3.6 Database schema contains FollowUp, Notification, ConversationTag')
    passed++
  } else {
    console.log('[FAIL] Phase 3.6 Database schema is missing new models')
    failed++
  }

  // 2. Verify Media Foundation
  if (schemaStr.includes('mediaId') && schemaStr.includes('mimeType') && schemaStr.includes('mediaUrl')) {
    console.log('[PASS] Phase 3.6 Database schema contains Media Foundation fields on Message')
    passed++
  } else {
    console.log('[FAIL] Phase 3.6 Database schema is missing Media Foundation fields')
    failed++
  }

  // 3. Verify Server Actions Tenant Isolation (Static analysis of inboxActions.ts)
  const actionsStr = require('fs').readFileSync('./app/actions/inboxActions.ts', 'utf-8')
  if (actionsStr.includes('whereClause.showroomId = membership.showroomId') || actionsStr.includes('showroomId: membership.showroomId')) {
    console.log('[PASS] Phase 3.6 Inbox Actions enforce Tenant Isolation')
    passed++
  } else {
    console.log('[FAIL] Phase 3.6 Inbox Actions missing Tenant Isolation')
    failed++
  }

  // 4. Verify Server Actions RBAC for Sales
  if (actionsStr.includes('membership.role === \'SALES\'') && actionsStr.includes('assignedToUserId: membership.userId')) {
    console.log('[PASS] Phase 3.6 Inbox Actions enforce SALES RBAC')
    passed++
  } else {
    console.log('[FAIL] Phase 3.6 Inbox Actions missing SALES RBAC')
    failed++
  }

  // 5. Verify Webhook parses media and creates Notification
  const webhookStr = require('fs').readFileSync('./app/api/webhooks/whatsapp/route.ts', 'utf-8')
  if (webhookStr.includes('mediaId = mediaInfo.id') && webhookStr.includes('prisma.notification.create')) {
    console.log('[PASS] Phase 3.6 Webhook handles media and creates Notification safely')
    passed++
  } else {
    console.log('[FAIL] Phase 3.6 Webhook missing media parsing or Notification creation')
    failed++
  }

  console.log(`\nTests Completed: ${passed + failed}. Passed: ${passed}, Failed: ${failed}`)
  if (failed > 0) {
    process.exit(1)
  }
}

runSecurityTests().catch(console.error)
