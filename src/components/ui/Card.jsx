import { cn } from '../../utils/helpers'

export function Card({ children, className, ...props }) {
  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className }) {
  return <div className={cn('p-5', className)}>{children}</div>
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('flex items-center gap-2 px-5 py-3 border-t border-[var(--border)]', className)}>
      {children}
    </div>
  )
}
