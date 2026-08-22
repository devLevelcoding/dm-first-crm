import { useEffect, useState, type FormEvent } from 'react'
import { createResource, deleteResource, listResource } from '../api'
import type { DmTemplate } from '../types'

export default function TemplatesView() {
  const [rows, setRows] = useState<DmTemplate[]>([])
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    listResource<DmTemplate>('dm-templates').then(r => setRows(r.data)).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await createResource('dm-templates', { name, body })
      setName('')
      setBody('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const remove = async (id: number) => {
    await deleteResource('dm-templates', id)
    load()
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-txt">DM Templates</h1>
        <p className="text-xs text-txt2 mt-1">
          Use <code className="text-txt">{'{{name}}'}</code>, <code className="text-txt">{'{{city}}'}</code>,{' '}
          <code className="text-txt">{'{{country}}'}</code>, <code className="text-txt">{'{{category}}'}</code>.
        </p>
      </div>

      {error && <div className="mb-4 px-3 py-2 rounded bg-danger/10 border border-danger/30 text-danger text-xs">{error}</div>}

      <form onSubmit={submit} className="mb-6 p-4 rounded border border-border bg-surface flex flex-col gap-3">
        <input required placeholder="Template name" value={name} onChange={e => setName(e.target.value)} className="px-2 py-1.5 rounded bg-surface2 border border-border text-txt text-sm" />
        <textarea required rows={5} placeholder="Hey {{name}}! ..." value={body} onChange={e => setBody(e.target.value)} className="px-2 py-1.5 rounded bg-surface2 border border-border text-txt text-sm font-mono text-xs" />
        <button type="submit" className="self-end px-4 py-1.5 rounded text-xs font-medium bg-accent text-white hover:bg-accent/90">Save</button>
      </form>

      <div className="flex flex-col gap-2">
        {rows.length === 0 ? (
          <div className="text-txt2 text-sm text-center py-6 border border-border rounded bg-surface">No templates yet.</div>
        ) : rows.map(t => (
          <div key={t.id} className="p-3 rounded border border-border bg-surface">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-txt font-medium">{t.name}</span>
              <button onClick={() => void remove(t.id)} className="text-xs text-danger hover:underline">Delete</button>
            </div>
            <p className="text-xs text-txt2 whitespace-pre-wrap">{t.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
