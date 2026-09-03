import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { EditModeToggle } from '@/components/EditModeToggle'
import { StoreHydrator } from '@/components/StoreHydrator'
import { getAllContent } from '@/app/actions/contentActions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dbContent = await getAllContent()
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <EditModeToggle />
      <StoreHydrator initialContent={dbContent} />
    </>
  )
}
