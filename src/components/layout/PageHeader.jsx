export default function PageHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6 pb-5 border-b border-[var(--border)]">
      <div className="flex items-center gap-3.5">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/15 flex items-center justify-center shrink-0">
            <Icon size={17} className="text-brand-500" />
          </div>
        )}
        <div>
          <h1 className="font-bold text-lg text-[var(--text)] leading-tight font-display">{title}</h1>
          {subtitle && <p className="text-xs text-[var(--text-sub)] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  )
}
