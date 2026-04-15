import { clsx } from 'clsx'

export const cn = (...args) => clsx(...args)

export const fmt = {
  score:    (v) => v != null ? (v * 100).toFixed(1) + '%' : '—',
  date:     (s) => s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
  truncate: (s, n = 120) => s?.length > n ? s.slice(0, n) + '…' : s,
  number:   (n) => n != null ? Number(n).toLocaleString() : '—',
}

export const imageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `http://localhost:8000/images/${path.split(/[/\\]/).pop()}`
}
