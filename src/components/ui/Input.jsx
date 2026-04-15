import { cn } from '../../utils/helpers'

export function Label({ children }) {
  return (
    <label className="block text-xs font-semibold text-[var(--text-sub)] uppercase tracking-wider mb-1.5 font-display">
      {children}
    </label>
  )
}

export function Input({ className, label, error, hint, ...props }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input
        className={cn('input-base h-9 px-3', error && 'border-red-500 focus:border-red-500 focus:shadow-none', className)}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-[var(--text-dim)]">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Textarea({ className, label, error, ...props }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <textarea
        className={cn('input-base px-3 py-2.5 resize-none', className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Select({ className, label, children, ...props }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <select className={cn('input-base h-9 px-3 cursor-pointer', className)} {...props}>
        {children}
      </select>
    </div>
  )
}
