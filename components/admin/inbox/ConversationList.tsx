import React from 'react'
import { ConversationItem } from './InboxClient'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

type Props = {
  conversations: ConversationItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  filter: string
  onFilterChange: (f: string) => void
  search: string
  onSearchChange: (s: string) => void
  loading: boolean
  error: string | null
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  search,
  onSearchChange,
  loading,
  error
}: Props) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 shrink-0">
        <h2 className="text-xl font-bold text-gray-900 mb-4">WhatsApp Inbox</h2>
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="Cari nama / nomor WA..." 
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <select 
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            <option value="all">Semua Percakapan</option>
            <option value="unread">Belum Dibaca</option>
            <option value="assigned_to_me">Tugas Saya</option>
            <option value="unassigned">Belum Ada PIC</option>
            <option value="open">Aktif</option>
            <option value="closed">Selesai</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500 text-sm">{error}</div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Belum ada percakapan WhatsApp.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex flex-col gap-1 relative ${selectedId === conv.id ? 'bg-blue-50/50' : ''}`}
              >
                {selectedId === conv.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                )}
                
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-semibold truncate pr-2 ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                    {conv.customer.name}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap mt-1">
                    {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true, locale: id }) : ''}
                  </span>
                </div>
                
                <div className="flex justify-between items-center gap-2">
                  <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                    {conv.lastMessagePreview || 'Belum ada pesan.'}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2 mt-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${conv.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {conv.status}
                  </span>
                  {conv.customer.leads[0]?.status && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border bg-orange-50 text-orange-700 border-orange-200">
                      {conv.customer.leads[0].status}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
