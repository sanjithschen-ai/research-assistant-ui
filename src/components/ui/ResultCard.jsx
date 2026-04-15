import { FileText } from 'lucide-react'
import { Card, CardBody } from './Card'
import { Badge, ScorePill } from './Misc'

export default function ResultCard({ result, index }) {
  const { text, page, title, faiss_score, rerank_score } = result
  const score = rerank_score ?? faiss_score
  return (
    <Card className="animate-slide-up" style={{ animationDelay:`${index*50}ms`, opacity:0, animationFillMode:'forwards' }}>
      <CardBody className="space-y-2.5 py-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={12} className="text-brand-400 shrink-0" />
            <span className="text-xs text-[var(--text-sub)] truncate">{title || 'Unknown'}</span>
            <Badge variant="default">p.{page}</Badge>
          </div>
          <div className="flex items-center gap-1.5">
            {score != null && <ScorePill score={score} />}
            {rerank_score != null && <Badge variant="indigo">reranked</Badge>}
          </div>
        </div>
        <p className="text-sm text-[var(--text)] leading-relaxed line-clamp-4">{text}</p>
      </CardBody>
    </Card>
  )
}
