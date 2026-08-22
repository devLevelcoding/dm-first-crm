import { useEffect, useState, type FormEvent } from 'react'
import { createResource, listResource, setStatus } from '../api'
import type { Lead } from '../types'
import ComposeModal from './ComposeModal'

const COLUMNS: { key: string; label: string; next?: string; alt?: string }[] = [
  { key: 'PENDING', label: 'Pending', next: 'DM_SENT', alt: 'SKIPPED' },
  { key: 'DM_SENT', label: 'DM Sent', next: 'REPLIED' },
  { key: 'REPLIED', label: 'Replied' },
  { key: 'SKIPPED', label: 'Skipped' },
]

export default function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [q, setQ] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [composeFor, setComposeFor] = useState<Lead | null>(null)
  const [values, setValues] = useState({ name: '', category: '', city: '', country: '', instagramUrl: '' })
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    listResource<Lead>('leads', q ? `&q=${encodeURIComponent(q)}` : '')
      .then(r => setLeads(r.data))
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
  }

  useEffect(() => { load() }, [q])

  const move = async (leadId: number, status: string) => {
    await setStatus(leadId, status)
    load()
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await createResource('leads', values)
      setValues({ name: '', category: '', city: '', country: '', instagramUrl: '' })
      setFormOpen(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-txt">Pipeline</h1>
          <p className="text-xs text-txt2 mt-1">Manual DM tracking — no send-from-here integration, same as the source.</p>
        </div>
        <div className="flex gap-2">
          <input
            placeholder="Search name/city/country…"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="px-2 py-1.5 rounded bg-surface2 border border-border text-txt text-sm w-56"
          />
          <button onClick={() => setFormOpen(f => !f)} className="px-3 py-1.5 rounded text-xs font-medium bg-accent text-white hover:bg-accent/90">
            {formOpen ? 'Cancel' : '+ New Lead'}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 px-3 py-2 rounded bg-danger/10 border border-danger/30 text-danger text-xs">{error}</div>}

      {formOpen && (
        <form onSubmit={submit} className="mb-5 p-4 rounded border border-border bg-surface slide-up grid grid-cols-2 gap-3">
          <input required placeholder="Name *" value={values.name} onChange={e => setValues(v => ({ ...v, name: e.target.value }))} className="px-2 py-1.5 rounded bg-surface2 border border-border text-txt text-sm" />
          <input placeholder="Category" value={values.category} onChange={e => setValues(v => ({ ...v, category: e.target.value }))} className="px-2 py-1.5 rounded bg-surface2 border border-border text-txt text-sm" />
          <input placeholder="City" value={values.city} onChange={e => setValues(v => ({ ...v, city: e.target.value }))} className="px-2 py-1.5 rounded bg-surface2 border border-border text-txt text-sm" />
          <input placeholder="Country" value={values.country} onChange={e => setValues(v => ({ ...v, country: e.target.value }))} className="px-2 py-1.5 rounded bg-surface2 border border-border text-txt text-sm" />
          <input placeholder="Instagram URL" value={values.instagramUrl} onChange={e => setValues(v => ({ ...v, instagramUrl: e.target.value }))} className="col-span-2 px-2 py-1.5 rounded bg-surface2 border border-border text-txt text-sm" />
          <button type="submit" className="col-span-2 px-4 py-1.5 rounded text-xs font-medium bg-accent text-white hover:bg-accent/90 self-end">Save</button>
        </form>
      )}

      <div className="grid grid-cols-4 gap-3">
        {COLUMNS.map(col => (
          <div key={col.key} className="flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-wide text-txt2 font-medium px-1">
              {col.label} ({leads.filter(l => l.instagramStatus === col.key).length})
            </div>
            {leads.filter(l => l.instagramStatus === col.key).map(lead => (
              <div key={lead.id} className="p-3 rounded border border-border bg-surface">
                <div className="text-sm text-txt font-medium">{lead.name}</div>
                <div className="text-[11px] text-txt2 mt-0.5">
                  {[lead.category, [lead.city, lead.country].filter(Boolean).join(', ')].filter(Boolean).join(' · ') || '—'}
                </div>
                {lead.instagramUrl && (
                  <a href={lead.instagramUrl} target="_blank" rel="noreferrer" className="text-[11px] text-accent hover:underline block mt-1">
                    @{lead.instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')}
                  </a>
                )}
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setComposeFor(lead)} className="text-[11px] text-accent hover:underline">Compose</button>
                  {col.next && (
                    <button onClick={() => void move(lead.id, col.next!)} className="text-[11px] text-ok hover:underline">
                      {col.next === 'DM_SENT' ? 'Mark Sent' : 'Mark Replied'}
                    </button>
                  )}
                  {col.alt && (
                    <button onClick={() => void move(lead.id, col.alt!)} className="text-[11px] text-txt2 hover:underline">Skip</button>
                  )}
                  {col.key !== 'PENDING' && (
                    <button onClick={() => void move(lead.id, 'PENDING')} className="text-[11px] text-txt2 hover:underline">Undo</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {composeFor && (
        <ComposeModal
          leadId={composeFor.id}
          leadName={composeFor.name}
          instagramUrl={composeFor.instagramUrl}
          onClose={() => setComposeFor(null)}
        />
      )}
    </div>
  )
}
