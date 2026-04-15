import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { HelpCircle, Send, SlidersHorizontal, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { askQuestion } from '../api/client'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Textarea, Select } from '../components/ui/Input'
import Button from '../components/ui/Button'
import AnswerPanel from '../components/ui/AnswerPanel'
import EvalPanel from '../components/ui/EvalPanel'
import PageHeader from '../components/layout/PageHeader'
import { computeRetrievalMetrics, computeGenerationMetrics, fetchSemanticScores } from '../utils/evalMetrics'

const EXAMPLES = [
  'What datasets are used in this paper?',
  'Explain the SpiNNaker2 architecture.',
  'What are the key contributions?',
  'How does the attention mechanism work?',
  'What evaluation metrics were used?',
]

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function AskPage() {
  const [question, setQuestion]   = useState('')
  const [topK, setTopK]           = useState(5)
  const [rerank, setRerank]       = useState(true)
  const [images, setImages]       = useState(true)
  const [showOpts, setShowOpts]   = useState(false)
  const [result, setResult]       = useState(null)
  const [evalData, setEvalData]   = useState(null)
  const [evalOpen, setEvalOpen]   = useState(true)
  const [evalStatus, setEvalStatus] = useState(null) // 'running' | 'done' | null

  const mut = useMutation({
    mutationFn: () => askQuestion({ question: question.trim(), top_k: topK, use_reranking: rerank, include_images: images }),
    onSuccess: async (data) => {
      setResult(data)
      setEvalData(null)
      setEvalStatus('running')

      try {
        const textResults = data.text_results || []
        const answer      = data.answer || ''

        // Compute retrieval metrics immediately
        const rm = computeRetrievalMetrics(textResults)

        // Fetch semantic scores from CF (may take a few seconds)
        const { semanticFaithfulness, semanticRelevance } =
          await fetchSemanticScores(API_BASE, question.trim(), answer, textResults)

        const usedSemantic = semanticFaithfulness !== null || semanticRelevance !== null

        const gm = computeGenerationMetrics(
          question.trim(), answer, textResults,
          semanticFaithfulness, semanticRelevance
        )

        setEvalData({ rm, gm, usedSemantic })
        setEvalStatus('done')
      } catch (e) {
        console.error('Eval error:', e)
        setEvalStatus(null)
      }
    },
    onError: () => toast.error('Failed — is the server running?'),
  })

  const submit = () => {
    if (!question.trim()) return
    setResult(null); setEvalData(null); setEvalStatus(null)
    mut.mutate()
  }

  const qualColor = {
    excellent:'text-emerald-400', good:'text-emerald-400',
    fair:'text-amber-400', poor:'text-red-400'
  }

  return (
    <div className="animate-fade-in">
      <PageHeader icon={HelpCircle} title="Ask a Question"
        subtitle="Type a question → finds the most relevant chunks from your PDFs → Cloudflare LLM writes an answer with sources" />

      {/* Query card */}
      <Card className="mb-5">
        <CardBody className="space-y-4">
          <Textarea label="Your question"
            placeholder="Ask anything about your indexed research papers…"
            rows={4} value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.ctrlKey || e.metaKey) && submit()} />

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(q => (
              <button key={q} onClick={() => setQuestion(q)}
                className="text-xs px-2.5 py-1 rounded-full bg-[var(--muted)] text-[var(--text-sub)] border border-[var(--border)] hover:border-brand-500/40 hover:text-brand-400 transition-all">
                {q}
              </button>
            ))}
          </div>

          <div>
            <button onClick={() => setShowOpts(!showOpts)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-sub)] hover:text-[var(--text)] transition-colors font-display mb-3">
              <SlidersHorizontal size={12} />{showOpts ? 'Hide' : 'Show'} options
            </button>
            {showOpts && (
              <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-[var(--muted)] border border-[var(--border)] animate-slide-up">
                <Select label="Top-K Chunks" value={topK} onChange={e => setTopK(Number(e.target.value))}>
                  {[3, 5, 8, 10, 15].map(n => <option key={n} value={n}>{n} chunks</option>)}
                </Select>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-sub)] uppercase tracking-wider mb-1.5 font-display">Reranking</label>
                  <label className="flex items-center gap-2 h-9 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 accent-brand-500" checked={rerank} onChange={e => setRerank(e.target.checked)} />
                    <span className="text-sm text-[var(--text-sub)]">Cross-encoder</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-sub)] uppercase tracking-wider mb-1.5 font-display">Figures</label>
                  <label className="flex items-center gap-2 h-9 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 accent-brand-500" checked={images} onChange={e => setImages(e.target.checked)} />
                    <span className="text-sm text-[var(--text-sub)]">Include images</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-[var(--text-dim)] font-mono">Ctrl + Enter to submit · Eval runs automatically</p>
            <Button icon={Send} loading={mut.isPending} onClick={submit} disabled={!question.trim()}>
              Ask Question
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Loading */}
      {mut.isPending && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-brand-500/20 bg-brand-500/5 mb-5">
          <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-brand-400">Retrieving context and generating answer…</p>
        </div>
      )}

      {/* Answer */}
      {result && <div className="mb-6"><AnswerPanel data={result} /></div>}

      {/* Eval section */}
      {(evalStatus || evalData) && (
        <div className="mt-2">
          {/* Eval header bar */}
          <button
            onClick={() => setEvalOpen(o => !o)}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-brand-500/30 transition-all mb-3"
          >
            <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
              <FlaskConical size={14} className="text-brand-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-[var(--text)] font-display">RAG Evaluation</p>
              {evalStatus === 'running' && (
                <p className="text-xs text-brand-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin inline-block" />
                  Computing semantic scores via CF embeddings…
                </p>
              )}
              {evalStatus === 'done' && evalData && (
                <p className="text-xs text-[var(--text-sub)] mt-0.5">
                  Composite:&nbsp;
                  <span className={`font-bold font-mono ${qualColor[evalData.gm.quality]}`}>
                    {evalData.gm.composite}/10
                  </span>
                  &nbsp;·&nbsp;Confidence:&nbsp;
                  <span className="font-bold font-mono">{evalData.rm.retrieval_confidence}</span>
                  &nbsp;·&nbsp;Quality:&nbsp;
                  <span className={`font-bold ${qualColor[evalData.gm.quality]}`}>{evalData.gm.quality}</span>
                  &nbsp;·&nbsp;
                  <span className="text-brand-400">{evalData.usedSemantic ? 'Semantic ✓' : 'Heuristic fallback'}</span>
                </p>
              )}
            </div>
            {evalOpen ? <ChevronUp size={15} className="text-[var(--text-dim)]" /> : <ChevronDown size={15} className="text-[var(--text-dim)]" />}
          </button>

          {evalOpen && evalData && (
            <Card>
              <CardBody className="pt-4">
                <EvalPanel evalData={evalData} />
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
