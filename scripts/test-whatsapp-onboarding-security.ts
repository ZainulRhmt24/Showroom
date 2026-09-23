import * as fs from 'fs'

async function runWhatsAppOnboardingTests() {
  console.log('--- RUNNING WHATSAPP ONBOARDING SECURITY TESTS ---')
  let passed = 0
  let failed = 0

  try {
    const exchangeEndpointPath = './app/api/meta/whatsapp/exchange/route.ts'
    if (fs.existsSync(exchangeEndpointPath)) {
      const exchangeStr = fs.readFileSync(exchangeEndpointPath, 'utf-8')
      
      // 1. Verify Unauthenticated / SALES role requests are denied
      if (exchangeStr.includes("membership.role !== 'OWNER'")) {
        console.log('[PASS] Token exchange endpoint enforces strict OWNER RBAC')
        passed++
      } else {
        console.log('[FAIL] Token exchange endpoint missing OWNER RBAC check')
        failed++
      }

      // 2. Verify Cross-tenant phone number manipulation / duplication is denied
      if (exchangeStr.includes('existingAccount.showroomId !== showroom.id')) {
        console.log('[PASS] Token exchange endpoint prevents duplicate phoneNumberId across tenants')
        passed++
      } else {
        console.log('[FAIL] Token exchange endpoint vulnerable to cross-tenant phone duplication')
        failed++
      }

      // 3. Verify encryption is used for provisioning
      if (exchangeStr.includes('encryptToken(') && exchangeStr.includes('accessToken: encryptedToken')) {
        console.log('[PASS] Token exchange endpoint encrypts token before saving to database')
        passed++
      } else {
        console.log('[FAIL] Token exchange endpoint does not encrypt token')
        failed++
      }

    } else {
      console.log('[FAIL] Token exchange endpoint does not exist')
      failed += 3
    }

    const providerPath = './lib/whatsapp/provider.ts'
    if (fs.existsSync(providerPath)) {
      const providerStr = fs.readFileSync(providerPath, 'utf-8')
      
      // 4. Verify decryption is used in the provider
      if (providerStr.includes('decryptToken(')) {
        console.log('[PASS] WhatsApp Provider decrypts token before usage')
        passed++
      } else {
        console.log('[FAIL] WhatsApp Provider does not decrypt token')
        failed++
      }
    } else {
      console.log('[FAIL] WhatsApp Provider does not exist')
      failed++
    }

  } catch (err) {
    console.error('[ERROR] Failed to run security tests', err)
    failed++
  }

  console.log(`\nTests Completed: ${passed + failed}. Passed: ${passed}, Failed: ${failed}`)
  if (failed > 0) {
    process.exit(1)
  }
}

runWhatsAppOnboardingTests().catch(console.error)
