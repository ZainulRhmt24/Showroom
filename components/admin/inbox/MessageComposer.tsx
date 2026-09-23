import React, { useState } from 'react'
import { draftInboxReplyWithAI, sendInboxMessage } from '@/app/actions/inboxActions'

type Props = {
  conversationId: string
  onMessageSent: () => void
  latestInboundMessage?: string | null
}

export default function MessageComposer({ conversationId, onMessageSent, latestInboundMessage }: Props) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!message.trim() || sending) return

    setSending(true)
    setError(null)
    
    const res = await sendInboxMessage(conversationId, message)
    if (res.success) {
      setMessage('')
      onMessageSent()
    } else {
      setError(res.error || 'Gagal mengirim pesan.')
    }
    
    setSending(false)
  }

  const handleDraftAI = async () => {
    if (drafting) return
    setDrafting(true)
    setError(null)

    // Using the latest inbound message as context
    if (!latestInboundMessage) {
      setError('Belum ada pesan customer yang dapat dibalas.');
      setDrafting(false);
      return;
    }
    const customerMsg = latestInboundMessage.trim();
    
    const res = await draftInboxReplyWithAI(conversationId, customerMsg)
    if (res.success && res.aiDraft) {
      setMessage(res.aiDraft.draft)
    } else {
      setError(res.error || 'Gagal membuat draft AI.')
    }
    
    setDrafting(false)
  }

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {error && (
        <div className="mb-2 p-2 bg-red-50 text-red-600 text-sm border border-red-100 rounded-md">
          {error}
        </div>
      )}
      
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ketik balasan Anda di sini..."
          className="w-full border border-gray-300 rounded-lg p-3 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[100px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          disabled={sending}
        />
        <div className="absolute right-2 bottom-2 flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleDraftAI}
              disabled={drafting || sending}
              className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              {drafting ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700"></span>
              ) : (
                '✨ AI Draft'
              )}
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-1.5 rounded-md font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Mengirim...' : 'Kirim'}
            </button>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 mt-2">
        Pesan akan dikirim langsung ke WhatsApp customer melalui koneksi API. AI Draft tidak mengirim otomatis (Human-in-the-Loop).
      </p>
    </div>
  )
}
