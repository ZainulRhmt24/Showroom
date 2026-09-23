'use client'

import { useEffect, useState, useTransition } from 'react'
import { ExternalLink, Save } from 'lucide-react'
import { getPublicWebsiteSettings, updatePublicWebsiteSettings } from '@/app/actions/showroomActions'

type Profile = Record<'slug' | 'name' | 'logo' | 'tagline' | 'description' | 'phone' | 'whatsapp' | 'email' | 'address' | 'city' | 'province' | 'heroTitle' | 'heroDescription' | 'primaryContactLabel' | 'instagramUrl' | 'facebookUrl', string | null>
const fields: { key: keyof Profile; label: string; multiline?: boolean; hint?: string }[] = [
  { key: 'name', label: 'Nama showroom' }, { key: 'tagline', label: 'Tagline' }, { key: 'logo', label: 'URL logo', hint: 'URL HTTPS atau path lokal, mis. /logo.png' },
  { key: 'heroTitle', label: 'Judul hero' }, { key: 'heroDescription', label: 'Deskripsi hero', multiline: true }, { key: 'primaryContactLabel', label: 'Label tombol kontak' },
  { key: 'description', label: 'Tentang showroom', multiline: true }, { key: 'whatsapp', label: 'WhatsApp' }, { key: 'phone', label: 'Telepon' }, { key: 'email', label: 'Email' },
  { key: 'address', label: 'Alamat', multiline: true }, { key: 'city', label: 'Kota' }, { key: 'province', label: 'Provinsi' },
  { key: 'instagramUrl', label: 'URL Instagram' }, { key: 'facebookUrl', label: 'URL Facebook' },
]

export default function PublicWebsiteSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()
  useEffect(() => { getPublicWebsiteSettings().then(value => setProfile(value as Profile | null)).catch(() => setMessage('Gagal memuat pengaturan.')) }, [])
  if (!profile) return <p className="py-12 text-sm text-muted-foreground">Memuat pengaturan website publik...</p>
  const change = (key: keyof Profile, value: string) => setProfile(current => current ? { ...current, [key]: value } : current)
  const save = (event: React.FormEvent) => { event.preventDefault(); setMessage(''); startTransition(async () => { const result = await updatePublicWebsiteSettings(profile); setMessage(result.success ? 'Pengaturan website publik berhasil disimpan.' : result.error || 'Gagal menyimpan pengaturan.') }) }
  return <div className="max-w-4xl animate-in fade-in duration-300"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><h2 className="font-display text-2xl font-black text-foreground">Public Website</h2><p className="mt-1 text-sm text-muted-foreground">Atur branding dan informasi yang tampil pada website publik showroom Anda.</p></div><a href={`/showroom/${profile.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted"><ExternalLink className="h-4 w-4" /> Preview Website</a></div><div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm"><span className="font-bold">Public URL: </span><code>/showroom/{profile.slug}</code></div><form onSubmit={save} className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"><div className="grid gap-5 sm:grid-cols-2">{fields.map(field => <label key={field.key} className={field.multiline ? 'sm:col-span-2' : ''}><span className="mb-1.5 block text-xs font-bold text-foreground">{field.label}</span>{field.multiline ? <textarea value={profile[field.key] || ''} onChange={event => change(field.key, event.target.value)} rows={4} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /> : <input value={profile[field.key] || ''} onChange={event => change(field.key, event.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />}{field.hint && <span className="mt-1 block text-[11px] text-muted-foreground">{field.hint}</span>}</label>)}</div><div className="mt-7 flex items-center gap-4"><button disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground disabled:opacity-60"><Save className="h-4 w-4" /> {pending ? 'Menyimpan...' : 'Simpan perubahan'}</button>{message && <p className="text-sm text-muted-foreground">{message}</p>}</div></form></div>
}
