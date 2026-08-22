import { useState } from 'react'
import Sidebar, { type NavItem } from './components/Sidebar'
import KanbanBoard from './components/KanbanBoard'
import TemplatesView from './components/TemplatesView'

const NAV: NavItem[] = [
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'templates', label: 'DM Templates' },
]

export default function App() {
  const [active, setActive] = useState('pipeline')

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-[13px]">
      <header className="flex items-center gap-3 h-[46px] px-5 border-b border-border bg-surface flex-shrink-0">
        <span className="text-[15px] font-extrabold tracking-tight text-accent">
          dm<span className="text-txt2 font-normal">first</span>
        </span>
        <div className="flex-1" />
        <span className="text-xs text-txt2">Type 3 &middot; Pure leadMarketing reuse</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={NAV} selected={active} onSelect={setActive} />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {active === 'pipeline' && <KanbanBoard />}
          {active === 'templates' && <TemplatesView />}
        </main>
      </div>
    </div>
  )
}
