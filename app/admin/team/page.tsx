"use client"

import { useState, useEffect, useTransition } from 'react'
import { Users, Plus, ShieldCheck, Mail, User as UserIcon, Trash2, Edit, AlertTriangle, X } from 'lucide-react'
import { useAdminData } from '../layout'
import { getTeamMembers, addTeamMember, updateTeamMemberRole, removeTeamMember } from '@/app/actions/teamActions'
import { MembershipRole } from '@prisma/client'

export default function TeamPage() {
  const { sessionUser, currentBranch, dbBranches } = useAdminData()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', email: '', role: 'SALES' as MembershipRole, branchId: '' })
  const [errorMsg, setErrorMsg] = useState('')
  const [tempPasswordMsg, setTempPasswordMsg] = useState('')

  const isOwner = sessionUser?.role === 'OWNER'
  const isManager = sessionUser?.role === 'MANAGER'
  const isSales = sessionUser?.role === 'SALES'

  const fetchMembers = async () => {
    setLoading(true)
    const data = await getTeamMembers()
    setMembers(data)
    setLoading(false)
  }

  useEffect(() => {
    if (sessionUser && !isSales) {
      fetchMembers()
    } else {
      setLoading(false)
    }
  }, [sessionUser])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    startTransition(async () => {
      const res = await addTeamMember(addForm)
      if (res.success) {
        setIsAddModalOpen(false)
        setAddForm({ name: '', email: '', role: 'SALES', branchId: '' })
        if (res.tempPassword) {
          setTempPasswordMsg(`Akun berhasil dibuat. Berikan password sementara ini kepada staf: ${res.tempPassword}. Password ini HANYA ditampilkan SATU KALI.`)
        }
        fetchMembers()
      } else {
        setErrorMsg(res.error || 'Gagal menambahkan anggota')
      }
    })
  }

  const handleRoleChange = async (membershipId: string, newRole: MembershipRole) => {
    if (confirm(`Ubah role anggota ini menjadi ${newRole}?`)) {
      startTransition(async () => {
        const res = await updateTeamMemberRole(membershipId, newRole)
        if (res.success) {
          fetchMembers()
        } else {
          alert(res.error)
        }
      })
    }
  }

  const handleRemoveMember = async (membershipId: string) => {
    if (confirm('Hapus anggota ini dari showroom?')) {
      startTransition(async () => {
        const res = await removeTeamMember(membershipId)
        if (res.success) {
          fetchMembers()
        } else {
          alert(res.error)
        }
      })
    }
  }

  if (isSales) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="h-16 w-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="font-display text-2xl font-black text-foreground">Akses Ditolak</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Hanya Owner dan Manager yang memiliki izin untuk melihat informasi manajemen tim.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {tempPasswordMsg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between gap-4 shadow-sm animate-in fade-in zoom-in-95">
          <div>{tempPasswordMsg}</div>
          <button onClick={() => setTempPasswordMsg('')} className="rounded p-1 hover:bg-emerald-500/20">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Manajemen Tim</h2>
          <p className="text-xs text-muted-foreground">
            Kelola staf dan akses untuk showroom <strong>{currentBranch?.name || 'Cabang Ini'}</strong>
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="h-4 w-4" /> Tambah Staf Baru
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-bold">Nama Staf</th>
                <th className="px-6 py-4 font-bold">Kontak</th>
                <th className="px-6 py-4 font-bold">Peran (Role)</th>
                <th className="px-6 py-4 font-bold">Cabang</th>
                <th className="px-6 py-4 font-bold">Bergabung Pada</th>
                {isOwner && <th className="px-6 py-4 font-bold text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">Memuat data tim...</td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">Belum ada anggota tim terdaftar.</td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {member.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{member.user.name}</p>
                          {member.user.id === sessionUser.userId && (
                            <span className="inline-block mt-0.5 rounded border border-primary/20 bg-primary/10 px-1.5 text-[9px] font-bold text-primary">
                              Anda
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3 w-3" /> {member.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        member.role === 'OWNER' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        member.role === 'MANAGER' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {member.branch ? <span className="font-bold">{member.branch.name}</span> : <span className="text-[10px] uppercase">Semua Cabang</span>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(member.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    {isOwner && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {member.user.id !== sessionUser.userId && (
                            <>
                              <select
                                value={member.role}
                                onChange={(e) => handleRoleChange(member.id, e.target.value as MembershipRole)}
                                disabled={isPending}
                                className="rounded border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:border-primary focus:outline-none"
                              >
                                <option value="OWNER">Owner</option>
                                <option value="MANAGER">Manager</option>
                                <option value="SALES">Sales</option>
                              </select>
                              <select
                                value={member.branchId || ''}
                                onChange={(e) => {
                                  if (confirm(`Ubah penempatan cabang anggota ini?`)) {
                                    startTransition(async () => {
                                      const res = await updateTeamMemberRole(member.id, member.role, e.target.value || undefined)
                                      if (res.success) fetchMembers()
                                      else alert(res.error)
                                    })
                                  }
                                }}
                                disabled={isPending}
                                className="rounded border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:border-primary focus:outline-none ml-2"
                              >
                                <option value="">Semua Cabang</option>
                                {dbBranches.map((b: any) => (
                                  <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                disabled={isPending}
                                className="rounded p-1.5 text-rose-500 hover:bg-rose-500/10 transition"
                                title="Keluarkan dari Showroom"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl p-6">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">Tambah Anggota Tim Baru</h3>
            
            {errorMsg && (
              <div className="mb-4 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Nama Lengkap</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted p-2.5 pl-9 font-bold outline-none focus:border-primary"
                    placeholder="Nama Staf"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted p-2.5 pl-9 font-bold outline-none focus:border-primary"
                    placeholder="email@contoh.com"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Peran (Role)</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value as MembershipRole })}
                  className="w-full rounded-xl border border-border bg-muted p-2.5 font-bold outline-none focus:border-primary"
                >
                  <option value="SALES">Sales (Hanya akses CRM & Leads)</option>
                  <option value="MANAGER">Manager (Akses Operasional)</option>
                  <option value="OWNER">Owner (Akses Penuh)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Penempatan Cabang (Opsional)</label>
                <select
                  value={addForm.branchId}
                  onChange={(e) => setAddForm({ ...addForm, branchId: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted p-2.5 font-bold outline-none focus:border-primary"
                >
                  <option value="">Semua Cabang</option>
                  {dbBranches.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl bg-primary/5 p-3 mt-2 border border-primary/10">
                <p className="text-[10px] text-muted-foreground">
                  Jika staf belum memiliki akun, password akan dibuatkan secara acak dan akan ditampilkan setelah disimpan. Staf wajib mengganti password saat login pertama kali.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-border px-5 py-2 font-bold hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground hover:bg-primary/90"
                >
                  {isPending ? 'Menambahkan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
