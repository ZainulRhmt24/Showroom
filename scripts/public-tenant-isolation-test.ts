/**
 * Integration test for Phase 2.5 public tenant isolation.
 *
 * It creates uniquely named fixtures and removes only those fixtures in finally.
 * Run after `prisma migrate deploy` with: npm run test:public-tenant
 */
import assert from 'node:assert/strict'
import { prisma } from '../lib/prisma'
import { getPublicBranches, getPublicCarBySlug, getPublicCatalog, getPublicShowroomBySlug } from '../lib/public-showroom'

const token = `phase25-${Date.now()}`
const slugA = `${token}-showroom-a`
const slugB = `${token}-showroom-b`
const carSlugA = `${token}-car-a`
const carSlugB = `${token}-car-b`
const branchSlugA = `${token}-branch-a`
const branchSlugB = `${token}-branch-b`
let userId: string | undefined
let showroomAId: string | undefined
let showroomBId: string | undefined

const carData = (slug: string, name: string, showroomId: string, ownerId: string) => ({
  slug, name, brand: 'Toyota', year: 2024, price: 300_000_000, monthly: 5_000_000, dp: 60_000_000,
  transmission: 'Automatic' as const, fuel: 'Bensin' as const, engine: '2.0L', mileage: 10_000,
  color: 'Hitam', type: 'SUV' as const, condition: 'Bekas' as const, location: 'Jakarta', image: '/cars/fortuner.jpg',
  gallery: [], description: 'Fixture public vehicle', features: [], showroomId, ownerId,
})

async function main() {
  try {
    const user = await prisma.user.create({ data: { name: 'Phase 2.5 Test', email: `${token}@example.test`, role: 'USER' } })
    userId = user.id
    const [showroomA, showroomB] = await Promise.all([
      prisma.showroom.create({ data: { name: 'Showroom A', slug: slugA } }),
      prisma.showroom.create({ data: { name: 'Showroom B', slug: slugB } }),
    ])
    showroomAId = showroomA.id
    showroomBId = showroomB.id
    await Promise.all([
      prisma.car.create({ data: carData(carSlugA, 'Car A', showroomA.id, user.id) }),
      prisma.car.create({ data: carData(carSlugB, 'Car B', showroomB.id, user.id) }),
      prisma.branch.create({ data: { slug: branchSlugA, name: 'Branch A', city: 'Jakarta', address: 'Address A', ownerId: user.id, showroomId: showroomA.id } }),
      prisma.branch.create({ data: { slug: branchSlugB, name: 'Branch B', city: 'Bandung', address: 'Address B', ownerId: user.id, showroomId: showroomB.id } }),
    ])

    const tenantA = await getPublicShowroomBySlug(slugA)
    const tenantB = await getPublicShowroomBySlug(slugB)
    assert.ok(tenantA && tenantB, 'Both showrooms must resolve by slug')
    assert.equal('ownerId' in tenantA, false, 'Public showroom projection must not expose ownerId')

    const [catalogA, catalogB, branchesA, branchesB] = await Promise.all([getPublicCatalog(tenantA.id), getPublicCatalog(tenantB.id), getPublicBranches(tenantA.id), getPublicBranches(tenantB.id)])
    assert.deepEqual(catalogA.cars.map(car => car.slug), [carSlugA], 'Tenant A catalog must only contain Car A')
    assert.deepEqual(catalogB.cars.map(car => car.slug), [carSlugB], 'Tenant B catalog must only contain Car B')
    assert.deepEqual(branchesA.map(branch => branch.slug), [branchSlugA], 'Tenant A must only expose Branch A')
    assert.deepEqual(branchesB.map(branch => branch.slug), [branchSlugB], 'Tenant B must only expose Branch B')
    assert.equal(await getPublicCarBySlug(tenantA.id, carSlugB), null, 'Tenant A may not resolve Tenant B car')
    assert.equal(await getPublicCarBySlug(tenantB.id, carSlugA), null, 'Tenant B may not resolve Tenant A car')
    assert.equal('ownerId' in catalogA.cars[0], false, 'Public car projection must not expose ownerId')
    console.log('Public tenant isolation: PASS')
  } finally {
    if (showroomAId || showroomBId) await prisma.car.deleteMany({ where: { showroomId: { in: [showroomAId, showroomBId].filter((id): id is string => Boolean(id)) } } })
    if (showroomAId || showroomBId) await prisma.showroom.deleteMany({ where: { id: { in: [showroomAId, showroomBId].filter((id): id is string => Boolean(id)) } } })
    if (userId) await prisma.user.delete({ where: { id: userId } })
    await prisma.$disconnect()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
