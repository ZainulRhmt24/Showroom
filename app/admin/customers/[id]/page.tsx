"use client"

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Phone, MapPin, Activity, Calendar, Clock, MessageSquare, Car, ExternalLink, RefreshCw, Send, Settings, Mail, Brain } from 'lucide-react'
import { getCustomerById, createLeadActivity } from '@/app/actions/customerActions'
import { updateLeadDetails } from '@/app/actions/leadActions'
import { analyzeLeadWithAI, draftReplyWithAI } from '@/app/actions/aiActions'
import { getConversations, sendManualMessage } from '@/app/actions/whatsappActions'

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [noteContent, setNoteContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [analyzingLeadId, setAnalyzingLeadId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<any>(null)

  const handleAnalyzeLead = async (leadId: string) => {
    setAnalyzingLeadId(leadId)
    try {
      const res = await analyzeLeadWithAI(leadId)
      if (!res.success) alert(res.error)
    } catch (e) {
      console.error(e)
    }
    await fetchCustomer()
    setAnalyzingLeadId(null)
  }


  const fetchCustomer = async () => {
    setLoading(true)
    const data = await getCustomerById(resolvedParams.id)
    if (data) {
      setCustomer(data)
      const convRes = await getConversations(data.id)
      if (convRes.success) {
        setConversation(convRes.conversation)
      }
    } else {
      router.push('/admin/customers')
    }
    setLoading(false)
  }


  useEffect(() => {
    fetchCustomer()
  }, [resolvedParams.id])

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim()) return
    setIsSubmitting(true)
    
    await createLeadActivity({
      customerId: customer.id,
      type: 'NOTE',
      content: noteContent
    })
    
    setNoteContent('')
    fetchCustomer()
    setIsSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground text-sm font-bold animate-pulse">
        Memuat detail pelanggan...
      </div>
    )
  }

  if (!customer) return null

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar
      </Link>
      
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Profil & Leads */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card Profil */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-xl">
                {customer.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">{customer.name}</h3>
                <p className="text-xs text-muted-foreground">Customer ID: {customer.id.slice(-6).toUpperCase()}</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-3 border-t border-border/40 text-sm font-medium">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <a href={`https://wa.me/${customer.phone}`} target="_blank" className="hover:underline text-emerald-600 dark:text-emerald-400">
                  +{customer.phone}
                </a>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="leading-snug">{customer.address}</span>
                </div>
              )}
              {customer.source && (
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>Source: {customer.source}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Riwayat Leads */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-foreground flex items-center justify-between">
              Riwayat Deals (Leads)
              <span className="bg-muted px-2 py-0.5 rounded-full text-xs">{customer.leads.length}</span>
            </h4>
            
            <div className="space-y-3">
              {customer.leads.map((lead: any) => (
                <div key={lead.id} className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-sm text-foreground">{lead.carName || 'Unit Showroom'}</p>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {lead.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Tipe: {lead.type}</span>
                    <span>Tgl: {new Date(lead.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                  
                  {/* AI Lead Scoring Section */}
                  <div className="mt-3 pt-3 border-t border-border/40">
                    {lead.aiScore !== null ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-primary">
                            <Brain className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold">AI Score: {lead.aiScore}/100</span>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            lead.aiPriority === 'VERY_HIGH' ? 'bg-red-500/10 text-red-500' :
                            lead.aiPriority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                            lead.aiPriority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-slate-500/10 text-slate-500'
                          }`}>
                            {lead.aiPriority}
                          </span>
                        </div>
                        {lead.aiExplanation && (
                          <div className="bg-background rounded-lg p-2.5 text-[11px] space-y-2 border border-border">
                            <div>
                              <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                AI Recommendation
                                {lead.aiExplanation.urgency && (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                    lead.aiExplanation.urgency === 'HIGH' ? 'bg-red-500/10 text-red-500' :
                                    lead.aiExplanation.urgency === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-slate-500/10 text-slate-500'
                                  }`}>
                                    {lead.aiExplanation.urgency} URGENCY
                                  </span>
                                )}
                              </p>
                              <p className="mt-1 text-muted-foreground">{lead.aiExplanation.summary}</p>
                            </div>

                            <div className="bg-primary/5 p-2 rounded border border-primary/10">
                              <p className="font-bold text-primary">💡 {lead.aiExplanation.recommendedAction}</p>
                              <p className="text-muted-foreground italic mt-0.5">{lead.aiExplanation.reason}</p>
                            </div>

                            {lead.aiExplanation.actions?.length > 0 && (
                              <div>
                                <p className="font-semibold text-foreground mb-1">Next Actions:</p>
                                <ul className="space-y-1">
                                  {lead.aiExplanation.actions.map((act: any, i: number) => (
                                    <li key={i} className="flex gap-1.5">
                                      <span className="text-muted-foreground">{i + 1}.</span>
                                      <div>
                                        <p className="font-medium text-foreground">{act.title}</p>
                                        <p className="text-muted-foreground">{act.description}</p>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {lead.aiExplanation.suggestedQuestions?.length > 0 && (
                              <div>
                                <p className="font-semibold text-foreground mb-1">Suggested Questions:</p>
                                <ul className="pl-3 list-disc space-y-0.5 text-muted-foreground">
                                  {lead.aiExplanation.suggestedQuestions.map((q: string, i: number) => (
                                    <li key={i}>{q}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleAnalyzeLead(lead.id)}
                            disabled={analyzingLeadId === lead.id}
                            className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-primary transition disabled:opacity-50"
                          >
                            <RefreshCw className={`h-3 w-3 ${analyzingLeadId === lead.id ? 'animate-spin' : ''}`} />
                            Perbarui AI
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAnalyzeLead(lead.id)}
                        disabled={analyzingLeadId === lead.id}
                        className="w-full rounded-lg bg-primary/10 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {analyzingLeadId === lead.id ? (
                          <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Menganalisis...</>
                        ) : (
                          <><Brain className="h-3.5 w-3.5" /> Dapatkan Rekomendasi AI</>
                        )}
                      </button>
                    )}
                    {/* Link to Inbox for AI Assistant */}
                    <div className="mt-2 pt-2 border-t border-border/40">
                      <Link
                        href={`/admin/inbox?conversationId=${conversation?.id || ''}`}
                        className="w-full rounded-lg bg-emerald-500/10 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> 💬 Buka WhatsApp & Bantu Balas
                      </Link>
                    </div>
                  </div>

                </div>
              ))}
              {customer.leads.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Belum ada deal tercatat.</p>
              )}
            </div>
          </div>

        </div>

        {/* Kolom Kanan: Timeline CRM */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col h-full min-h-[500px]">
            <h4 className="font-bold text-foreground flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4" /> CRM Timeline & Aktivitas
            </h4>
            
            {/* Input Note Baru */}
            <form onSubmit={handleAddNote} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Tambahkan catatan, hasil telepon, atau rencana follow-up..."
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm outline-none focus:border-primary transition"
              />
              <button 
                type="submit"
                disabled={isSubmitting || !noteContent.trim()}
                className="rounded-xl bg-primary px-4 flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            {/* Timeline Stream */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {customer.activities.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic">
                  Belum ada aktivitas pada pelanggan ini.
                </div>
              ) : (
                customer.activities.map((act: any) => (
                  <div key={act.id} className="flex gap-3 text-sm">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        act.type === 'NOTE' ? 'bg-blue-500/10 text-blue-500' :
                        act.type === 'STATUS_CHANGE' ? 'bg-emerald-500/10 text-emerald-500' :
                        act.type === 'FOLLOW_UP' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {act.type === 'NOTE' ? <MessageSquare className="h-3.5 w-3.5" /> :
                         act.type === 'STATUS_CHANGE' ? <RefreshCw className="h-3.5 w-3.5" /> :
                         act.type === 'FOLLOW_UP' ? <Calendar className="h-3.5 w-3.5" /> :
                         <Activity className="h-3.5 w-3.5" />
                        }
                      </div>
                      <div className="w-px h-full bg-border mt-1"></div>
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-foreground">{act.createdBy.name}</span>
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          • {new Date(act.createdAt).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/40 inline-block">
                        {act.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          

        </div>
      </div>
    </div>
  )
}
