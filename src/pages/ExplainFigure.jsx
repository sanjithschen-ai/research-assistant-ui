import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Image, Sparkles, SlidersHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import { explainImage } from '../api/client'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Input, Select } from '../components/ui/Input'
import Button from '../components/ui/Button'
import DropZone from '../components/ui/DropZone'
import ResultCard from '../components/ui/ResultCard'
import TTSPlayer from '../components/ui/TTSPlayer'
import PageHeader from '../components/layout/PageHeader'

export default function ExplainFigure() {
  const [file, setFile]         = useState(null)
  const [query, setQuery]       = useState('')
  const [topK, setTopK]         = useState(3)
  const [showOpts, setShowOpts] = useState(false)
  const [result, setResult]     = useState(null)

  const mut = useMutation({
    mutationFn: () => explainImage(file, query.trim() || 'Explain this image in the context of AI/ML research', topK),
    onSuccess: (data) => setResult(data),
    onError:   () => toast.error('Explanation failed — check server logs'),
  })

  const submit = () => {
    if (!file) { toast.error('Please upload an image first'); return }
    setResult(null); mut.mutate()
  }

  return (
    <div className="animate-fade-in">
      <PageHeader icon={Image} title="Explain a Figure"
        subtitle="Upload any image file from your PC → AI reads it visually + pulls matching paper context to explain it" />

      <div className="grid xl:grid-cols-2 gap-5">
        {/* Left: upload */}
        <Card>
          <CardHeader>
            <Image size={13} className="text-brand-400" />
            <span className="font-semibold text-sm font-display text-[var(--text)]">Upload Figure</span>
          </CardHeader>
          <CardBody className="space-y-4">
            <DropZone onFile={setFile} value={file} onClear={()=>setFile(null)}
              accept={{'image/*':['.png','.jpg','.jpeg','.webp','.bmp']}}
              label="Drop image file here" hint="PNG, JPG, WEBP supported" />

            <Input label="Your question (optional)"
              placeholder="What does this architecture diagram show?"
              value={query} onChange={e=>setQuery(e.target.value)} />

            <button onClick={()=>setShowOpts(!showOpts)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-sub)] hover:text-[var(--text)] transition-colors font-display">
              <SlidersHorizontal size={11} />{showOpts?'Hide':'Show'} options
            </button>
            {showOpts && (
              <div className="animate-slide-up">
                <Select label="Context chunks (Top-K)" value={topK} onChange={e=>setTopK(Number(e.target.value))}>
                  {[1,2,3,5,8].map(n=><option key={n} value={n}>{n} chunks</option>)}
                </Select>
              </div>
            )}

            <Button className="w-full" icon={Sparkles} loading={mut.isPending} onClick={submit} disabled={!file}>
              Explain Figure
            </Button>
          </CardBody>
        </Card>

        {/* Right: result */}
        <div className="space-y-4">
          {mut.isPending && (
            <Card>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-brand-400">LLaVA is analysing your figure…</p>
                </div>
              </CardBody>
            </Card>
          )}

          {result && (
            <>
              <Card>
                <CardHeader>
                  <Sparkles size={13} className="text-brand-400" />
                  <span className="font-semibold text-sm font-display text-[var(--text)]">Explanation</span>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
                </CardBody>
              </Card>

              {/* TTS Player */}
              <TTSPlayer text={result.explanation} />

              {result.text_results?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[var(--text-sub)] uppercase tracking-wider font-display">
                    Research context used
                  </p>
                  {result.text_results.map((r,i) => (
                    <ResultCard key={r.chunk_id||i} result={r} index={i} />
                  ))}
                </div>
              )}
            </>
          )}

          {!result && !mut.isPending && (
            <div className="h-full min-h-[200px] rounded-xl border-2 border-dashed border-[var(--border)] flex items-center justify-center">
              <p className="text-sm text-[var(--text-dim)] font-mono">Explanation will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
