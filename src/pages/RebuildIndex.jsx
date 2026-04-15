import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, AlertTriangle, CheckCircle, Layers, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import { rebuildIndex } from '../api/client'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import PageHeader from '../components/layout/PageHeader'

export default function RebuildIndex() {
  const qc = useQueryClient()
  const [result, setResult] = useState(null)
  const mut = useMutation({
    mutationFn: rebuildIndex,
    onSuccess: (d) => { if (d.status==='ok') { setResult(d.data); toast.success('Index rebuilt'); qc.invalidateQueries(['stats']) } else toast.error('Rebuild failed') },
    onError: () => toast.error('Server error'),
  })

  return (
    <div className="animate-fade-in max-w-2xl">
      <PageHeader icon={RefreshCw} title="Rebuild FAISS Index" subtitle="Use this if search results feel stale or wrong — clears FAISS and re-embeds every chunk and figure from scratch via Cloudflare BGE" />

      <Card className="mb-4 border-amber-500/20">
        <CardBody>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--text)] font-display mb-1">When to rebuild?</p>
              <ul className="space-y-0.5 text-sm text-[var(--text-sub)]">
                <li>• After removing PDFs to reclaim vector space</li>
                <li>• If search results seem stale or incorrect</li>
                <li>• After the embedding model is changed</li>
                <li>• If the FAISS index becomes corrupted</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><RefreshCw size={13} className="text-brand-400"/><span className="font-semibold text-sm font-display text-[var(--text)]">Index Rebuild</span></CardHeader>
        <CardBody className="space-y-5">
          <div className="space-y-1.5">
            {['Clear all existing FAISS vectors','Re-embed every text chunk via Cloudflare BGE','Re-embed every figure caption via Cloudflare BGE','Rebuild the dual FAISS index'].map((s,i)=>(
              <div key={i} className="flex items-center gap-2.5 text-sm text-[var(--text-sub)]">
                <span className="w-5 h-5 rounded-full bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center text-[10px] font-mono text-[var(--text-dim)] shrink-0">{i+1}</span>
                {s}
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-400 font-medium">May take several minutes for large document collections.</p>

          {mut.isPending && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-brand-500/20 bg-brand-500/5">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <div><p className="text-sm font-medium text-brand-400">Rebuilding…</p><p className="text-xs text-[var(--text-dim)]">Do not close this page</p></div>
            </div>
          )}

          {result && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 animate-slide-up">
              <CheckCircle size={18} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-400">Rebuild complete</p>
                <div className="flex items-center gap-4 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-[var(--text-sub)]"><Layers size={10}/>{result.chunks} chunks</span>
                  <span className="flex items-center gap-1 text-xs text-[var(--text-sub)]"><Image size={10}/>{result.images} figures</span>
                </div>
              </div>
            </div>
          )}

          <Button className="w-full" icon={RefreshCw} loading={mut.isPending} onClick={()=>{setResult(null);mut.mutate()}}>
            {result ? 'Rebuild Again' : 'Rebuild FAISS Index'}
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}
