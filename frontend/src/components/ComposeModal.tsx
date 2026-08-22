import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { compose, listResource } from '../api'
import type { DmTemplate } from '../types'

interface Props {
  leadId: number
  leadName: string
  instagramUrl?: string | null
  onClose: () => void
}

export default function ComposeModal({ leadId, leadName, instagramUrl, onClose }: Props) {
  const [templates, setTemplates] = useState<DmTemplate[]>([])
  const [templateId, setTemplateId] = useState<number | undefined>(undefined)
  const [body, setBody] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listResource<DmTemplate>('dm-templates').then(r => setTemplates(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setCopied(false)
    compose(leadId, templateId)
      .then(r => setBody(r.body))
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
  }, [leadId, templateId])

  const copy = () => {
    if (!body) return
    void navigator.clipboard.writeText(body)
    setCopied(true)
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-surface border border-border rounded max-w-md w-full slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-txt">Compose DM — {leadName}</h2>
          <button onClick={onClose} className="text-txt2 hover:text-txt text-sm">✕</button>
        </div>
        <div className="p-4">
          {error && <div className="text-danger text-xs mb-3">{error}</div>}

          <label className="flex flex-col gap-1 text-xs text-txt2 mb-3">
            Template
            <select
              value={templateId ?? ''}
              onChange={e => setTemplateId(e.target.value ? Number(e.target.value) : undefined)}
              className="px-2 py-1.5 rounded bg-surface2 border border-border text-txt text-sm"
            >
              <option value="">Default DM opener</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>

          {body === null ? (
            <div className="text-txt2 text-xs">Loading…</div>
          ) : (
            <>
              <pre className="whitespace-pre-wrap text-xs text-txt bg-surface2 border border-border rounded p-3 font-sans mb-3">{body}</pre>
              <div className="flex gap-2">
                <button onClick={copy} className="px-4 py-1.5 rounded text-xs font-medium bg-accent text-white hover:bg-accent/90">
                  {copied ? 'Copied ✓' : 'Copy to clipboard'}
                </button>
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-1.5 rounded text-xs font-medium bg-surface2 text-txt2 hover:text-txt"
                  >
                    Open Instagram →
                  </a>
                )}
              </div>
              <p className="text-[11px] text-txt2 mt-2">
                Paste this into Instagram's own DM composer and send — no send-from-here integration
                exists (matches the source, which has none either).
              </p>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
