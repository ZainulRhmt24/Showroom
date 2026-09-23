import Image from 'next/image'
import Link from 'next/link'
import { Fuel, Gauge, MapPin, Settings2 } from 'lucide-react'
import type { PublicCar } from '@/lib/public-showroom'

const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })

export function PublicCarCard({ car, showroomSlug }: { car: PublicCar; showroomSlug: string }) {
  const reserved = car.badge === 'BOOKED'
  const image = car.image || '/placeholder-car.svg'
  const isRemote = image.startsWith('http')
  return <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
    <Link href={`/showroom/${showroomSlug}/cars/${car.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100">
      {isRemote ? <img src={image} alt={`${car.brand} ${car.name}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <Image src={image} alt={`${car.brand} ${car.name}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />}
      {(reserved || car.badge) && <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold ${reserved ? 'bg-amber-400 text-amber-950' : 'bg-slate-950 text-white'}`}>{reserved ? 'Reserved' : car.badge}</span>}
    </Link>
    <div className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{car.brand} · {car.year}</p><Link href={`/showroom/${showroomSlug}/cars/${car.slug}`} className="mt-1 block text-lg font-extrabold leading-snug text-slate-950 hover:underline">{car.name}</Link><p className="mt-3 text-xl font-black text-slate-950">{money.format(car.price)}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600"><span className="flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5" />{car.mileage.toLocaleString('id-ID')} km</span><span className="flex items-center gap-1.5"><Settings2 className="h-3.5 w-3.5" />{car.transmission}</span><span className="flex items-center gap-1.5"><Fuel className="h-3.5 w-3.5" />{car.fuel}</span><span className="flex min-w-0 items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 shrink-0" />{car.branch?.name || car.location}</span></div>
    </div>
  </article>
}
