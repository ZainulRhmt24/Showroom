import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { EditModeToggle } from '@/components/EditModeToggle'
import { StoreHydrator } from '@/components/StoreHydrator'
import { getAllContent } from '@/app/actions/contentActions'
import { prisma } from '@/lib/prisma'

export const revalidate = 60

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dbContent = await getAllContent()
  const dbCars = await prisma.car.findMany({ where: { badge: { not: 'SOLD OUT' } }, orderBy: { createdAt: 'desc' } })
  const dbBranches = await prisma.branch.findMany({ orderBy: { createdAt: 'asc' } })
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <EditModeToggle />
      <StoreHydrator initialContent={dbContent} initialCars={dbCars} initialBranches={dbBranches} />
    </>
  )
}
