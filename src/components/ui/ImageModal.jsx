import { X, ExternalLink } from 'lucide-react'
import { imageUrl } from '../../utils/helpers'
import { Badge } from './Misc'

export default function ImageModal({ img, onClose }) {
  if (!img) return null
  const url = img.url || imageUrl(img.path)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose} />
      <div className="relative max-w-4xl w-full animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {img.source && <Badge variant="indigo">{img.source}</Badge>}
            {img.page && <Badge variant="default">Page {img.page}</Badge>}
          </div>
          <div className="flex items-center gap-2">
            {url && <a href={url} target="_blank" rel="noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--text-sub)] hover:text-brand-400 transition-all">
              <ExternalLink size={13} />
            </a>}
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--text-sub)] hover:text-red-400 transition-all">
              <X size={13} />
            </button>
          </div>
        </div>
        <div className="card overflow-hidden">
          {url
            ? <img src={url} alt={img.caption || 'Figure'} className="w-full object-contain max-h-[72vh]" />
            : <div className="h-64 flex items-center justify-center text-[var(--text-dim)] text-sm font-mono">No preview</div>
          }
        </div>
        {img.caption && <p className="mt-2.5 text-sm text-[var(--text-sub)] leading-relaxed px-1">{img.caption}</p>}
        <p className="mt-1 text-[11px] font-mono text-[var(--text-dim)] px-1 break-all">{img.image_id}</p>
      </div>
    </div>
  )
}
