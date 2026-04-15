import { useState } from 'react'
import { Hash, Expand, Copy, Check } from 'lucide-react'
import { Card } from './Card'
import { Badge } from './Misc'
import { imageUrl } from '../../utils/helpers'

export default function ImageCard({ img, onExpand }) {
  const [copied, setCopied] = useState(false)
  const url = img.url || imageUrl(img.path)
  const copyId = () => { navigator.clipboard.writeText(img.image_id); setCopied(true); setTimeout(() => setCopied(false), 1800) }

  return (
    <Card className="group overflow-hidden">
      <div className="relative bg-[var(--muted)] overflow-hidden" style={{ aspectRatio:'16/10' }}>
        {url
          ? <img src={url} alt={img.caption || 'Figure'} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]" onError={e => { e.target.style.display='none' }} />
          : <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-dim)] font-mono">No preview</div>
        }
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {onExpand && (
            <button onClick={() => onExpand(img)}
              className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
              <Expand size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant={img.source === 'page_match' ? 'indigo' : 'default'}>{img.source || 'figure'}</Badge>
          <Badge variant="default"><Hash size={9} />p.{img.page}</Badge>
        </div>
        {img.caption && <p className="text-xs text-[var(--text-sub)] line-clamp-2 leading-relaxed">{img.caption}</p>}
        <button onClick={copyId}
          className="flex items-center gap-1 text-[10px] font-mono text-[var(--text-dim)] hover:text-brand-400 transition-colors w-full truncate">
          {copied ? <Check size={9} className="text-emerald-400 shrink-0" /> : <Copy size={9} className="shrink-0" />}
          <span className="truncate">{img.image_id}</span>
        </button>
      </div>
    </Card>
  )
}
