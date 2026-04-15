import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardBody, CardHeader } from './Card'
import ResultCard from './ResultCard'
import ImageCard from './ImageCard'
import ImageModal from './ImageModal'
import TTSPlayer from './TTSPlayer'
import { Divider } from './Misc'

export default function AnswerPanel({ data }) {
  const [showSources, setShowSources] = useState(true)
  const [expandedImg, setExpandedImg] = useState(null)

  if (!data) return null
  const { answer, text_results = [], image_results = [] } = data

  return (
    <div className="space-y-4 animate-slide-up">

      {/* Answer card */}
      <Card>
        <CardHeader>
          <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <Sparkles size={13} className="text-brand-400" />
          </div>
          <span className="font-semibold text-sm font-display text-[var(--text)]">Answer</span>
        </CardHeader>
        <CardBody>
          <p className="text-[var(--text)] leading-relaxed whitespace-pre-wrap text-sm">{answer}</p>
        </CardBody>
      </Card>

      {/* ── TTS Player — always shown after every answer ── */}
      <TTSPlayer text={answer} />

      {/* Related images */}
      {image_results.length > 0 && (
        <div>
          <Divider label={`${image_results.length} related figure${image_results.length > 1 ? 's' : ''}`} className="mb-4" />
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            {image_results.map(img => (
              <ImageCard key={img.image_id} img={img} onExpand={setExpandedImg} />
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {text_results.length > 0 && (
        <div>
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-sub)] hover:text-[var(--text)] transition-colors mb-3 font-display"
          >
            {showSources ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {text_results.length} source{text_results.length > 1 ? 's' : ''}
          </button>
          {showSources && (
            <div className="space-y-2">
              {text_results.map((r, i) => (
                <ResultCard key={r.chunk_id || i} result={r} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {expandedImg && <ImageModal img={expandedImg} onClose={() => setExpandedImg(null)} />}
    </div>
  )
}
