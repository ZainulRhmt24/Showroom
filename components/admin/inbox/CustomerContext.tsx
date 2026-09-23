import React from 'react'
import { ConversationItem, SalesUser, UserContext } from './InboxClient'
import Link from 'next/link'
import { assignConversation, updateConversationStatus, getConversationTags, assignTagToConversation, removeTagFromConversation } from '@/app/actions/inboxActions'

type Props = {
  conversation: ConversationItem
  currentUser: UserContext
  salesUsers: SalesUser[]
  onConversationUpdated: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export default function CustomerContext({ conversation, currentUser, salesUsers, onConversationUpdated, isMobileOpen, onMobileClose }: Props) {
  const isManagerOrOwner = currentUser.role === 'OWNER' || currentUser.role === 'MANAGER'
  const [availableTags, setAvailableTags] = React.useState<any[]>([])
  const [loadingTag, setLoadingTag] = React.useState(false)

  React.useEffect(() => {
    getConversationTags().then(res => {
      if (res.success) setAvailableTags(res.tags || [])
    })
  }, [])

  const handleAddTag = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tagId = e.target.value
    if (!tagId) return
    setLoadingTag(true)
    await assignTagToConversation(conversation.id, tagId)
    e.target.value = ''
    onConversationUpdated()
    setLoadingTag(false)
  }

  const handleRemoveTag = async (tagId: string) => {
    setLoadingTag(true)
    await removeTagFromConversation(conversation.id, tagId)
    onConversationUpdated()
    setLoadingTag(false)
  }

  const handleAssign = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    await assignConversation(conversation.id, val === 'UNASSIGNED' ? null : val)
    onConversationUpdated()
  }

  const handleStatus = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await updateConversationStatus(conversation.id, e.target.value)
    onConversationUpdated()
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      <div className={`w-full lg:w-72 border-l border-gray-200 bg-white p-4 flex-col gap-6 overflow-y-auto ${
        isMobileOpen ? 'flex fixed inset-y-0 right-0 z-50 shadow-2xl max-w-xs' : 'hidden lg:flex lg:relative'
      }`}>
        <div>
          <div className="flex items-center justify-between mb-3 lg:hidden">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Customer Info</h3>
            <button onClick={onMobileClose} className="p-1 rounded-full hover:bg-gray-100">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 hidden lg:block">Customer Info</h3>
          <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500">Nama</p>
            <p className="font-medium text-gray-900">{conversation.customer.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">No. WhatsApp</p>
            <p className="font-medium text-gray-900">{conversation.customer.phone}</p>
          </div>
          <div>
            <Link 
              href={`/admin/customers/${conversation.customer.id}`}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
            >
              Lihat Profil Lengkap &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Tags</span>
          {loadingTag && <span className="text-[10px] animate-pulse">Menyimpan...</span>}
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {conversation.tags?.length === 0 ? (
            <span className="text-xs text-gray-400 italic">Belum ada tag.</span>
          ) : (
            conversation.tags?.map((t: any) => (
              <span 
                key={t.id} 
                className="text-[10px] font-bold px-2 py-1 rounded-md border flex items-center gap-1"
                style={{ backgroundColor: `${t.color || '#3B82F6'}10`, color: t.color || '#3B82F6', borderColor: `${t.color || '#3B82F6'}30` }}
              >
                {t.name}
                {isManagerOrOwner && (
                  <button onClick={() => handleRemoveTag(t.id)} className="ml-1 opacity-50 hover:opacity-100 font-bold">&times;</button>
                )}
              </span>
            ))
          )}
        </div>
        {isManagerOrOwner && availableTags.length > 0 && (
          <select 
            onChange={handleAddTag}
            disabled={loadingTag}
            defaultValue=""
            className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white px-2 py-1.5 border disabled:opacity-50"
          >
            <option value="" disabled>+ Tambah Tag</option>
            {availableTags
              .filter(at => !conversation.tags?.some(ct => ct.id === at.id))
              .map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))
            }
          </select>
        )}
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Status Percakapan</label>
            <select 
              value={conversation.status}
              onChange={handleStatus}
              className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white px-3 py-2 border"
            >
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Assigned Sales</label>
            <select 
              value={conversation.assignedToUserId || 'UNASSIGNED'}
              onChange={handleAssign}
              disabled={!isManagerOrOwner}
              className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white px-3 py-2 border disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="UNASSIGNED">-- Belum Ditugaskan --</option>
              {salesUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            {!isManagerOrOwner && (
              <p className="text-[10px] text-gray-400 mt-1">Hanya Manager/Owner yang dapat mengubah PIC.</p>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
