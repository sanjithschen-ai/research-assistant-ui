import { cn } from '../../utils/helpers'

const variants = {
  primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm',
  secondary:'bg-[var(--muted)] hover:bg-[var(--hover)] text-[var(--text)] border border-[var(--border)]',
  ghost:   'hover:bg-[var(--hover)] text-[var(--text-sub)] hover:text-[var(--text)]',
  danger:  'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20',
  outline: 'border border-[var(--border)] hover:border-brand-500/50 text-[var(--text-sub)] hover:text-[var(--text)] bg-[var(--surface)]',
}
const sizes = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl',
}

export default function Button({ children, variant='primary', size='md', className, loading, icon:Icon, disabled, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium font-display',
        'transition-all duration-150 select-none cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {loading
        ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : Icon && <Icon size={size === 'lg' ? 16 : 14} className="shrink-0" />
      }
      {children && <span>{children}</span>}
    </button>
  )
}
