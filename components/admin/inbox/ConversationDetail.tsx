import React, { useEffect, useRef, useState } from 'react'
import { ConversationItem, SalesUser, UserContext } from './InboxClient'
import CustomerContext from './CustomerContext'
import MessageComposer from './MessageComposer'
import { getConversationMessages } from '@/app/actions/inboxActions'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

type Props = {
  conversation: ConversationItem
  onBack: () => void
  currentUser: UserContext
  salesUsers: SalesUser[]
  onConversationUpdated: () => void
}

type MessageItem = {
  id: string
  direction: 'INBOUND' | 'OUTBOUND'
  body: string
  status: string
  createdAt: Date
  sentByUserId: string | null
  failedReason: string | null
  messageType?: string
  fileName?: string | null
}

export default function ConversationDetail({ conversation, onBack, currentUser, salesUsers, onConversationUpdated }: Props) {
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showMobileContext, setShowMobileContext] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadMessages = async () => {
    setLoading(true)
    const res = await getConversationMessages(conversation.id)
    if (res.success && res.messages) {
      setMessages(res.messages as unknown as MessageItem[])
    }
    setLoading(false)
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
    }, 100)
  }

  useEffect(() => {
    loadMessages()
    // Poll for new messages for the active conversation
    const interval = setInterval(loadMessages, 10000)
    return () => clearInterval(interval)
  }, [conversation.id])

  return (
    <div className="flex w-full h-full">
      <div className="flex-1 flex flex-col h-full bg-[#E5DDD5]">
        {/* Header */}
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="md:hidden p-1 -ml-1 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-gray-600 font-bold text-lg">
              {conversation.customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 leading-tight">
                {conversation.customer.name}
              </h2>
              <p className="text-xs text-gray-500">
                {conversation.customer.phone}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border hidden md:inline-block ${conversation.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {conversation.status}
            </span>
            <button
              onClick={() => setShowMobileContext(true)}
              className="lg:hidden p-1.5 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 text-sm p-4 bg-white/50 rounded-lg max-w-sm mx-auto mt-10">
              Belum ada pesan.
            </div>
          ) : (
            messages.map((msg, index) => {
              const isOutbound = msg.direction === 'OUTBOUND'
              
              // Add date separator if date changes
              const msgDate = new Date(msg.createdAt)
              const prevMsgDate = index > 0 ? new Date(messages[index - 1].createdAt) : null
              const showDate = !prevMsgDate || msgDate.toDateString() !== prevMsgDate.toDateString()

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="bg-white/80 text-gray-500 text-xs px-3 py-1 rounded-md shadow-sm">
                        {format(msgDate, 'dd MMMM yyyy', { locale: idLocale })}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}>
                    <div className={`relative max-w-[85%] md:max-w-[70%] rounded-lg p-3 shadow-sm ${
                      isOutbound ? 'bg-[#D9FDD3] text-gray-900 rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'
                    }`}>
                      {msg.messageType && msg.messageType !== 'TEXT' && (
                        <div className="flex items-center gap-2 mb-1 opacity-70 border-b border-gray-900/10 pb-1 w-fit">
                          <span className="text-[10px] font-black tracking-widest">{msg.messageType}</span>
                          {msg.fileName && <span className="text-[10px] truncate max-w-[150px]">{msg.fileName}</span>}
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                      <div className="flex justify-end items-center gap-1 mt-1">
                        <span className="text-[10px] text-gray-500">
                          {format(new Date(msg.createdAt), 'HH:mm')}
                        </span>
                        {isOutbound && (
                          <span className="text-[10px] text-gray-400 ml-1">
                            {msg.status === 'SENT' ? '✓' : msg.status === 'DELIVERED' || msg.status === 'READ' ? '✓✓' : msg.status === 'FAILED' ? '⚠️' : '🕒'}
                          </span>
                        )}
                      </div>
                    </div>
                    {isOutbound && msg.failedReason && (
                      <span className="text-[10px] text-red-500 mt-1 max-w-[70%] text-right">{msg.failedReason}</span>
                    )}
                  </div>
                </React.Fragment>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        {conversation.status === 'ACTIVE' ? (
          <MessageComposer 
            conversationId={conversation.id} 
            onMessageSent={loadMessages}
            latestInboundMessage={
              messages
                .filter(m => m.direction === 'INBOUND')
                .pop()?.body || null
            }
          />
        ) : (
          <div className="p-4 bg-gray-50 text-center border-t border-gray-200">
            <p className="text-sm text-gray-500">Percakapan ini sudah ditutup. Ubah status menjadi Active untuk membalas.</p>
          </div>
        )}
      </div>

      <CustomerContext 
        conversation={conversation}
        currentUser={currentUser}
        salesUsers={salesUsers}
        onConversationUpdated={onConversationUpdated}
        isMobileOpen={showMobileContext}
        onMobileClose={() => setShowMobileContext(false)}
      />
    </div>
  )
}
