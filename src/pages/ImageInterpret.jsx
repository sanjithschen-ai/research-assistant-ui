import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Eye, Hash, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { describeImage } from '../api/client'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Input, Textarea } from '../components/ui/Input'
import Button from '../components/ui/Button'
import ResultCard from '../components/ui/ResultCard'
import TTSPlayer from '../components/ui/TTSPlayer'
import PageHeader from '../components/layout/PageHeader'

export default function ImageInterpret() {
  const [imageId, setImageId] = useState('')
  const [query, setQuery]     = useState('')
  const [result, setResult]   = useState(null)

  const mut = useMutation({
    mutationFn: () => describeImage(imageId.trim(), query),
    onSuccess:  (data) => setResult(data),
    onError:    () => toast.error('Could not fetch image — check the image ID'),
  })

  const submit = () => {
    if (!imageId.trim()) { toast.error('Please enter an image ID'); return }
    setResult(null)
    mut.mutate()
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={Eye}
        title="Image Interpretation"
        subtitle="Enter an Image ID (copy from Figure Explorer) — AI describes the indexed figure with full research context"
      />

      <div className="grid xl:grid-cols-2 gap-5">
        {/* Input */}
        <Card>
          <CardHeader>
            <Hash size={13} className="text-brand-400" />
            <span className="font-semibold text-sm font-display text-[var(--text)]">Look up by Image ID</span>
          </CardHeader>
          <CardBody className="space-y-4">

            <Input
              label="Image ID"
              placeholder="fe6e582c-231a-4b8d-9793-…"
              value={imageId}
              onChange={e => setImageId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              hint="Go to Figure Explorer → hover any figure → click the copy icon to get the full UUID"
            />

            <Textarea
              label="Question (optional)"
              placeholder="What does this figure represent in the context of the paper?"
              rows={3}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />

            <Button className="w-full" icon={Sparkles} loading={mut.isPending} onClick={submit} disabled={!imageId.trim()}>
              Interpret Image
            </Button>

            {/* Helper tip */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
              <Eye size={13} className="text-brand-400 shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--text-sub)] leading-relaxed">
                <strong className="text-[var(--text)]">How to get an Image ID:</strong> Open{' '}
                <span className="text-brand-400 font-medium">Figure Explorer</span> in the sidebar → hover over any figure → click the copy icon below it. Then paste the UUID here.
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Result */}
        <div className="space-y-4">
          {mut.isPending && (
            <Card><CardBody>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <div>
                  <p className="text-sm font-medium text-brand-400">Interpreting with LLaVA…</p>
                  <p className="text-xs text-[var(--text-dim)]">Fetching figure and retrieving research context</p>
                </div>
              </div>
            </CardBody></Card>
          )}

          {result && (
            <>
              {/* Figure preview */}
              {result.url && (
                <Card className="overflow-hidden">
                  <div className="bg-[var(--muted)]" style={{ maxHeight: 240 }}>
                    <img
                      src={result.url}
                      alt="Figure"
                      className="w-full object-contain"
                      style={{ maxHeight: 240 }}
                    />
                  </div>
                  {result.caption && (
                    <CardBody className="py-2.5">
                      <p className="text-xs text-[var(--text-sub)] italic leading-relaxed">{result.caption}</p>
                    </CardBody>
                  )}
                </Card>
              )}

              {/* Explanation */}
              <Card>
                <CardHeader>
                  <Sparkles size={13} className="text-brand-400" />
                  <span className="font-semibold text-sm font-display text-[var(--text)]">Interpretation</span>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
                </CardBody>
              </Card>

              {/* TTS */}
              <TTSPlayer text={result.explanation} />

              {/* Sources */}
              {result.text_results?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[var(--text-sub)] uppercase tracking-wider font-display">
                    Research context used
                  </p>
                  {result.text_results.map((r, i) => (
                    <ResultCard key={r.chunk_id || i} result={r} index={i} />
                  ))}
                </div>
              )}
            </>
          )}

          {!result && !mut.isPending && (
            <div className="min-h-[240px] rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2">
              <Hash size={22} className="text-[var(--text-dim)]" />
              <p className="text-sm text-[var(--text-dim)] font-mono">Paste an Image ID and click Interpret</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
