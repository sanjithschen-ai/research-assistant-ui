import { cn } from '../../utils/helpers'
import { SearchX } from 'lucide-react'

const badgeStyles = {
  default: 'bg-[var(--muted)] text-[var(--text-sub)] border-[var(--border)]',
  indigo:  'bg-brand-500/10 text-brand-400 border-brand-500/20 dark:text-brand-300',
  green:   'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  amber:   'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  red:     'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
  blue:    'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
}

export function Badge({ children, variant = 'default', className }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border font-mono',
      badgeStyles[variant], className
    )}>
      {children}
    </span>
  )
}

export function Spinner({ size = 18, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      className={cn('animate-spin text-brand-500', className)} fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.15" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />
}

export function Empty({ icon: Icon = SearchX, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center">
        <Icon size={22} className="text-[var(--text-dim)]" />
      </div>
      <div>
        <p className="font-semibold text-[var(--text)] font-display">{title}</p>
        {description && <p className="text-sm text-[var(--text-sub)] mt-1 max-w-xs mx-auto">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function ScorePill({ score }) {
  const pct = Math.round((score ?? 0) * 100)
  const v = pct > 70 ? 'green' : pct > 40 ? 'amber' : 'default'
  return <Badge variant={v}>{pct}%</Badge>
}

export function Divider({ label, className }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 h-px bg-[var(--border)]" />
      {label && <span className="text-xs text-[var(--text-dim)] font-mono">{label}</span>}
      <div className="flex-1 h-px bg-[var(--border)]" />
    </div>
  )
}
