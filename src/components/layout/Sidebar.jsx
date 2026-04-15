import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileText, HelpCircle, Image,
  ScanSearch, GalleryHorizontal, Eye, BarChart2,
  RefreshCw, Microscope, Sun, Moon,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const NAV = [
  { group: 'Library', items: [
    { to: '/',          icon: LayoutDashboard, label: 'Dashboard'       },
    { to: '/pdfs',      icon: FileText,        label: 'PDF Manager'     },
  ]},
  { group: 'Research', items: [
    { to: '/ask',       icon: HelpCircle,      label: 'Ask / RAG Q&A'  },
    { to: '/visual',    icon: ScanSearch,      label: 'Visual Query'    },
    { to: '/explain',   icon: Image,           label: 'Explain Figure'  },
  ]},
  { group: 'Figures', items: [
    { to: '/figures',   icon: GalleryHorizontal, label: 'Figure Explorer' },
    { to: '/interpret', icon: Eye,             label: 'Image Interpret' },
  ]},
  { group: 'System', items: [
    { to: '/stats',     icon: BarChart2,       label: 'Statistics'      },
    { to: '/rebuild',   icon: RefreshCw,       label: 'Rebuild Index'   },
  ]},
]

export default function Sidebar() {
  const { dark, toggle } = useTheme()

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 flex flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <Microscope size={15} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-[var(--text)] font-display leading-none">ResearchAI</p>
            <p className="text-[10px] text-[var(--text-dim)] font-mono mt-0.5 leading-none">Cloudflare × FAISS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAV.map(({ group, items }) => (
          <div key={group}>
            <p className="px-2 mb-1 text-[10px] font-semibold text-[var(--text-dim)] uppercase tracking-widest font-display">
              {group}
            </p>
            <div className="space-y-0.5">
              {items.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} end={to === '/'}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  {({ isActive }) => (
                    <>
                      <Icon size={14} className={isActive ? 'text-brand-500' : 'text-[var(--text-dim)]'} />
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[var(--border)] space-y-2">
        {/* Theme toggle */}
        <button onClick={toggle}
          className="nav-link w-full justify-between group">
          <div className="flex items-center gap-2.5">
            {dark ? <Moon size={14} className="text-[var(--text-dim)]" /> : <Sun size={14} className="text-[var(--text-dim)]" />}
            <span>{dark ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className={`w-8 h-4 rounded-full transition-all duration-300 relative ${dark ? 'bg-brand-600' : 'bg-slate-300'}`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${dark ? 'left-4' : 'left-0.5'}`} />
          </div>
        </button>

        {/* Status */}
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-sm" />
          <span className="text-[11px] text-[var(--text-dim)] font-mono">MCP Server v2.0</span>
        </div>
      </div>
    </aside>
  )
}
