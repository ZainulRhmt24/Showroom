"use client"

import React, { useState, useEffect } from 'react'
import { getInboxConversations, markConversationAsRead } from '@/app/actions/inboxActions'
import ConversationList from './ConversationList'
import ConversationDetail from './ConversationDetail'

export type ConversationItem = {
  id: string
  showroomId: string
  customerId: string
  channel: string
  status: string
  assignedToUserId: string | null
  unreadCount: number
  lastMessageAt: Date | null
  lastMessagePreview: string | null
  createdAt: Date
  customer: {
    id: string
    name: string
    phone: string
    leads: { status: string, assignedTo: string | null }[]
  }
  tags: { id: string, name: string, color: string | null }[]
}

export type UserContext = { id: string, role: string }
export type SalesUser = { id: string, name: string }

export default function InboxClient({ 
  currentUser,
  salesUsers 
}: { 
  currentUser: UserContext
  salesUsers: SalesUser[]
}) {
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const selectedConversation = conversations.find(c => c.id === selectedId) || null

  const loadConversations = async () => {
    setLoading(true)
    setError(null)
    const result = await getInboxConversations(filter)
    if (result.success) {
      setConversations(result.conversations || [])
    } else {
      setError(result.error || 'Gagal memuat percakapan.')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadConversations()
    // Implement simple polling for new messages
    const interval = setInterval(() => {
      loadConversations()
    }, 15000)
    return () => clearInterval(interval)
  }, [filter])

  const handleSelectConversation = async (id: string) => {
    setSelectedId(id)
    const conv = conversations.find(c => c.id === id)
    if (conv && conv.unreadCount > 0) {
      // Mark as read in DB
      await markConversationAsRead(id)
      // Update local state immediately
      setConversations(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c))
    }
  }

  // Derived state for searching
  const filteredConversations = conversations.filter(c => 
    c.customer.name.toLowerCase().includes(search.toLowerCase()) || 
    c.customer.phone.includes(search)
  )

  return (
    <div className="flex w-full h-full bg-white relative">
      <div className={`w-full md:w-[350px] lg:w-[400px] border-r border-gray-200 flex-col bg-white z-10 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
        <ConversationList 
          conversations={filteredConversations}
          selectedId={selectedId}
          onSelect={handleSelectConversation}
          filter={filter}
          onFilterChange={setFilter}
          search={search}
          onSearchChange={setSearch}
          loading={loading}
          error={error}
        />
      </div>

      <div className={`flex-1 flex-col w-full h-full bg-gray-50 ${selectedId ? 'flex' : 'hidden md:flex'}`}>
        {selectedConversation ? (
          <ConversationDetail 
            conversation={selectedConversation} 
            onBack={() => setSelectedId(null)}
            currentUser={currentUser}
            salesUsers={salesUsers}
            onConversationUpdated={loadConversations}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 flex-col gap-4">
            <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Pilih percakapan untuk mulai melihat pesan.</p>
          </div>
        )}
      </div>
    </div>
  )
}
