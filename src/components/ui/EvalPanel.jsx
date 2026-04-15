import { useEffect, useRef } from 'react'
import { cn } from '../../utils/helpers'

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function f(v, d = 3) { return v != null && !isNaN(+v) ? (+v).toFixed(d) : '—' }

function QualBadge({ q }) {
  const colors = {
    excellent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    good:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    fair:      'bg-amber-500/10  text-amber-400  border-amber-500/20',
    poor:      'bg-red-500/10    text-red-400    border-red-500/20',
  }
  return <span className={cn('inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border', colors[q] || colors.poor)}>{q}</span>
}

function ConfBadge({ c }) {
  const colors = { high:'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', medium:'text-amber-400 bg-amber-500/10 border-amber-500/20', low:'text-red-400 bg-red-500/10 border-red-500/20' }
  return <span className={cn('inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border', colors[c] || colors.low)}>{c}</span>
}

// ── Gauge chart via Canvas ────────────────────────────────────────────────────
function GaugeCanvas({ value, max = 10 }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width, h = canvas.height
    const cx = w / 2, cy = h * 0.72
    const r  = Math.min(w, h) * 0.38
    ctx.clearRect(0, 0, w, h)

    const startAngle = Math.PI * 1.15
    const endAngle   = Math.PI * 1.85
    const fillAngle  = startAngle + (endAngle - startAngle) * (value / max)

    const color = value >= 7.5 ? '#10B981' : value >= 5.5 ? '#6366F1' : value >= 3.5 ? '#F59E0B' : '#EF4444'

    // Track
    ctx.beginPath()
    ctx.arc(cx, cy, r, startAngle, endAngle)
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 10
    ctx.lineCap = 'round'
    ctx.stroke()

    // Fill
    ctx.beginPath()
    ctx.arc(cx, cy, r, startAngle, fillAngle)
    ctx.strokeStyle = color
    ctx.lineWidth = 10
    ctx.lineCap = 'round'
    ctx.stroke()

    // Center text
    ctx.fillStyle = color
    ctx.font = `bold 22px Inter, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(value.toFixed(1), cx, cy - 6)
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.font = `12px Inter, system-ui, sans-serif`
    ctx.fillText('/ 10', cx, cy + 16)
  }, [value, max])

  return <canvas ref={ref} width={160} height={120} className="mx-auto block" />
}

// ── Bar chart via Canvas ──────────────────────────────────────────────────────
function ScoreBarCanvas({ rawFaiss = [], rawRerank = [] }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const n = rawFaiss.length
    if (!n) return
    const padL = 28, padR = 8, padT = 8, padB = 24
    const plotW = w - padL - padR
    const plotH = h - padT - padB
    const barW  = (plotW / n) * 0.35
    const gap   = (plotW / n) * 0.1
    const hasR  = rawRerank.some(v => v !== null)

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padT + plotH - (plotH * i / 4)
      ctx.beginPath()
      ctx.moveTo(padL, y); ctx.lineTo(w - padR, y)
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 1; ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.font = '9px Inter,system-ui'
      ctx.textAlign = 'right'
      ctx.fillText((i * 0.25).toFixed(2), padL - 3, y + 3)
    }

    // Bars
    for (let i = 0; i < n; i++) {
      const slotX = padL + (plotW / n) * i + gap
      const fv = Math.min(rawFaiss[i] ?? 0, 1)
      const fH  = fv * plotH
      ctx.fillStyle = 'rgba(99,102,241,0.7)'
      ctx.fillRect(slotX, padT + plotH - fH, barW, fH)

      if (hasR && rawRerank[i] !== null) {
        const rv = Math.min(rawRerank[i] ?? 0, 1)
        const rH  = rv * plotH
        ctx.fillStyle = 'rgba(16,185,129,0.7)'
        ctx.fillRect(slotX + barW + 2, padT + plotH - rH, barW, rH)
      }

      // x label
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.font = '9px Inter,system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(`C${i+1}`, padL + (plotW / n) * i + plotW / n / 2, h - 6)
    }
  }, [rawFaiss, rawRerank])

  return <canvas ref={ref} width={280} height={130} className="w-full" />
}

// ── Mini metric card ──────────────────────────────────────────────────────────
function MCard({ label, value, sub, highlight, semantic }) {
  return (
    <div className={cn(
      'rounded-xl border p-3.5',
      highlight
        ? 'bg-brand-500/5 border-brand-500/20'
        : 'bg-[var(--muted)] border-[var(--border)]'
    )}>
      <p className={cn('text-[10px] font-semibold uppercase tracking-wider mb-1', highlight ? 'text-brand-400' : 'text-[var(--text-dim)]')}>
        {label}{semantic && <span className="ml-1 text-brand-400">● sem</span>}
      </p>
      <p className="text-xl font-bold text-[var(--text)] leading-none mb-1">{value}</p>
      <p className="text-[10px] text-[var(--text-dim)]">{sub}</p>
    </div>
  )
}

// ── Judge row ─────────────────────────────────────────────────────────────────
function JudgeRow({ name, score, color, semantic, reason }) {
  return (
    <div>
      <div className="flex items-center gap-2 py-2">
        <span className={cn('text-xs w-28 shrink-0', semantic ? 'text-brand-400 font-medium' : 'text-[var(--text-sub)]')}>
          {name}{semantic && <span className="ml-1 text-brand-400 text-[9px]">●</span>}
        </span>
        <div className="flex-1 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score * 10}%`, background: color }} />
        </div>
        <span className="text-sm font-bold font-mono text-[var(--text)] w-8 text-right">{score.toFixed(1)}</span>
      </div>
      <p className="text-[10px] text-[var(--text-dim)] pl-[7.5rem] pb-1 -mt-1 leading-relaxed">{reason}</p>
    </div>
  )
}

// ── Main EvalPanel ────────────────────────────────────────────────────────────
export default function EvalPanel({ evalData }) {
  if (!evalData) return null
  const { rm, gm, usedSemantic } = evalData

  const confColor = { high: 'text-emerald-400', medium: 'text-amber-400', low: 'text-red-400' }
  const qualColor = {
    excellent: 'text-emerald-400', good: 'text-emerald-400',
    fair: 'text-amber-400', poor: 'text-red-400'
  }

  return (
    <div className="space-y-5 animate-slide-up">

      {/* Semantic badge */}
      <div className={cn(
        'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-medium',
        usedSemantic
          ? 'bg-brand-500/5 border-brand-500/20 text-brand-400'
          : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
      )}>
        <span className={cn('w-2 h-2 rounded-full shrink-0', usedSemantic ? 'bg-brand-400' : 'bg-amber-400')} />
        {usedSemantic
          ? 'Faithfulness & Relevance scored via CF Embeddings (semantic cosine similarity)'
          : 'CF semantic scoring unavailable — showing Jaccard heuristic fallback'}
      </div>

      {/* ── Retrieval Metrics ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] mb-3">Retrieval Metrics</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          <MCard label="Top-1 FAISS"  value={f(rm.top1_faiss_score)}     sub="cosine similarity" />
          <MCard label="Top-1 Rerank" value={rm.top1_rerank_score != null ? f(rm.top1_rerank_score) : '—'} sub="after reranking" />
          <MCard label="Score Gap"    value={f(rm.score_gap)}             sub="rank-1 minus rank-K" />
          <MCard label="Confidence"   value={<ConfBadge c={rm.retrieval_confidence} />} sub="signal strength" />
          <MCard label="Unique PDFs"  value={rm.unique_pdfs_in_results ?? '—'} sub="in results" />
          <MCard label="Unique Pages" value={rm.unique_pages_in_results ?? '—'} sub="in results" />
          <MCard label="Diversity"    value={f(rm.chunk_diversity_ratio, 2)} sub="pages / chunks" />
          <MCard label="Chunks"       value={rm.num_results ?? '—'}       sub="retrieved" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[var(--muted)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center gap-4 mb-3">
              <p className="text-xs font-semibold text-[var(--text-sub)]">FAISS vs Rerank per chunk</p>
              <div className="flex items-center gap-3 ml-auto">
                <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-dim)]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-brand-500/70 inline-block" />FAISS
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-dim)]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/70 inline-block" />Rerank
                </span>
              </div>
            </div>
            <ScoreBarCanvas rawFaiss={rm.raw_faiss} rawRerank={rm.raw_rerank} />
          </div>

          <div className="bg-[var(--muted)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-xs font-semibold text-[var(--text-sub)] mb-3">Score distribution (FAISS)</p>
            {[['mean', rm.faiss_scores?.mean, '#6366F1'],['max', rm.faiss_scores?.max, '#10B981'],['min', rm.faiss_scores?.min, '#EF4444'],['std', rm.faiss_scores?.std, '#64748B']].map(([l,v,c]) => (
              <div key={l} className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-[var(--text-dim)] w-7">{l}</span>
                <div className="flex-1 h-1.5 bg-[var(--muted)] rounded-full border border-[var(--border)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.round(Math.min(Math.abs(+(v??0)), 1) * 100)}%`, background: c }} />
                </div>
                <span className="text-[11px] font-mono text-[var(--text-sub)] w-11 text-right">{v != null ? (+v).toFixed(3) : '—'}</span>
              </div>
            ))}
            <p className="text-xs font-semibold text-[var(--text-sub)] mt-4 mb-2">Chunk diversity</p>
            <p className="text-[10px] text-[var(--text-dim)] mb-1">{rm.unique_pages_in_results} unique pages out of {rm.num_results} chunks</p>
            <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.round((rm.unique_pages_in_results / rm.num_results) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Generation Metrics ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] mb-3">Generation Metrics — Semantic Scoring</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          <MCard label="Relevance"    value={`${gm.relevance}/10`}    sub="question ↔ answer"        highlight={gm.relevanceSource==='semantic'} semantic={gm.relevanceSource==='semantic'} />
          <MCard label="Faithfulness" value={`${gm.faithfulness}/10`} sub="grounded in context"      highlight={gm.faithSource==='semantic'}    semantic={gm.faithSource==='semantic'} />
          <MCard label="Completeness" value={`${gm.completeness}/10`} sub="length & sentences"       />
          <MCard label="Conciseness"  value={`${gm.conciseness}/10`}  sub="no filler phrases"        />
          <MCard label="Groundedness" value={`${gm.groundedness}/10`} sub="sentences citing context" />
          <MCard label="Composite"    value={`${gm.composite}/10`}    sub={<QualBadge q={gm.quality} />} />
          <MCard label="Words"        value={gm.debug.word_count}     sub="in answer" />
          <MCard label="Sentences"    value={gm.debug.sentence_count} sub="in answer" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Judge rows */}
          <div className="bg-[var(--muted)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-xs font-semibold text-[var(--text-sub)] mb-1">Score breakdown</p>
            {[
              { name:'Relevance',    score:gm.relevance,    color:'#6366F1', semantic:gm.relevanceSource==='semantic', reason: gm.relevanceSource==='semantic' ? `Semantic cosine sim (answer↔question): ${gm.debug.relevance_raw}` : `Jaccard overlap: ${gm.debug.relevance_raw}` },
              { name:'Faithfulness', score:gm.faithfulness, color:'#10B981', semantic:gm.faithSource==='semantic',    reason: gm.faithSource==='semantic' ? `Semantic cosine sim (answer↔context): ${gm.debug.faith_raw}` : `Context token coverage: ${gm.debug.faith_raw}` },
              { name:'Completeness', score:gm.completeness, color:'#F59E0B', semantic:false, reason:`${gm.debug.word_count} words, ${gm.debug.sentence_count} sentences` },
              { name:'Conciseness',  score:gm.conciseness,  color:'#8B5CF6', semantic:false, reason:`Filler phrase hits: ${gm.debug.filler_hits}` },
              { name:'Groundedness', score:gm.groundedness, color:'#06B6D4', semantic:false, reason:`Grounded sentence ratio: ${gm.debug.ground_raw}` },
            ].map(d => <JudgeRow key={d.name} {...d} />)}
          </div>

          {/* Gauge + how it works */}
          <div className="space-y-4">
            <div className="bg-[var(--muted)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xs font-semibold text-[var(--text-sub)] mb-2 text-center">Composite score</p>
              <GaugeCanvas value={gm.composite} />
              <div className="text-center mt-1">
                <QualBadge q={gm.quality} />
              </div>
            </div>
            <div className="bg-[var(--muted)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xs font-semibold text-[var(--text-sub)] mb-3">How scoring works</p>
              <div className="grid grid-cols-1 gap-2 text-[11px] text-[var(--text-dim)] leading-relaxed">
                {[
                  ['Relevance',    gm.relevanceSource==='semantic' ? 'Cosine sim: answer ↔ question (CF embeddings)' : 'Jaccard overlap: question ↔ answer tokens'],
                  ['Faithfulness', gm.faithSource==='semantic' ? 'Cosine sim: answer ↔ context (CF embeddings)' : 'Answer tokens covered by retrieved context'],
                  ['Completeness', 'Word count (target ≈120) + sentence count (target ≈5)'],
                  ['Conciseness',  'Starts at 10, −1.5 per filler phrase, penalised over 300 words'],
                  ['Groundedness', 'Fraction of sentences containing ≥1 context token'],
                  ['Composite',    'Faith 30% · Relev 25% · Complet 20% · Ground 15% · Concise 10%'],
                ].map(([n, d]) => (
                  <div key={n}><strong className="text-[var(--text-sub)]">{n}:</strong> {d}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
