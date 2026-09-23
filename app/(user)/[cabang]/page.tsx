import { Suspense } from 'react'
import HomeClient from './HomeClient'

export const revalidate = 60

export default async function Home() {
  return (
    <Suspense fallback={<div className="pt-32 pb-20 min-h-screen text-center"><p>Memuat halaman utama...</p></div>}>
      <HomeClient />
    </Suspense>
  )
}
