import { useQuery } from '@tanstack/react-query'
import { BarChart2, RefreshCw, Cpu, Database, Server, Layers, Image, FileText } from 'lucide-react'
import { getStats } from '../api/client'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Misc'
import Button from '../components/ui/Button'
import PageHeader from '../components/layout/PageHeader'
import { fmt } from '../utils/helpers'

function Row({ icon:Icon, label, value, accent='text-brand-400' }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--border)] last:border-0">
      <Icon size={13} className={accent} />
      <span className="text-sm text-[var(--text-sub)] flex-1">{label}</span>
      <span className="text-sm font-mono text-[var(--text)] bg-[var(--muted)] px-2 py-0.5 rounded">{value??'—'}</span>
    </div>
  )
}

export default function Statistics() {
  const { data, isLoading, refetch, dataUpdatedAt } = useQuery({ queryKey:['stats'], queryFn:getStats, refetchInterval:60000 })
  const updated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : null

  return (
    <div className="animate-fade-in">
      <PageHeader icon={BarChart2} title="Statistics"
        subtitle={updated ? `FAISS index, document counts, and model info — last updated ${updated}` : 'Detailed FAISS index, document counts, and active model info'}
        action={<Button variant="outline" size="sm" icon={RefreshCw} onClick={()=>refetch()}>Refresh</Button>} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[['PDFs',fmt.number(data?.total_pdfs)],['Chunks',fmt.number(data?.total_chunks)],['Figures',fmt.number(data?.total_images)],['Vector Dim',data?.embed_dim]].map(([l,v])=>(
          <Card key={l}>
            <CardBody className="text-center py-6">
              {isLoading ? <Skeleton className="h-10 w-20 mx-auto mb-2" /> : <p className="text-4xl font-bold font-display text-[var(--text)]">{v||'—'}</p>}
              <p className="text-xs text-[var(--text-sub)] uppercase tracking-wider mt-1">{l}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader><Database size={13} className="text-brand-400"/><span className="font-semibold text-sm font-display text-[var(--text)]">Document Store</span></CardHeader>
          <CardBody className="py-0">
            <Row icon={FileText} label="PDFs indexed"        value={fmt.number(data?.total_pdfs)}   />
            <Row icon={Layers}   label="Text chunks"         value={fmt.number(data?.total_chunks)} accent="text-violet-400" />
            <Row icon={Image}    label="Figures extracted"   value={fmt.number(data?.total_images)} accent="text-emerald-400" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader><Cpu size={13} className="text-brand-400"/><span className="font-semibold text-sm font-display text-[var(--text)]">FAISS Index</span></CardHeader>
          <CardBody className="py-0">
            <Row icon={Layers} label="Text vectors"   value={fmt.number(data?.text_vectors)}  accent="text-blue-400"/>
            <Row icon={Image}  label="Image vectors"  value={fmt.number(data?.image_vectors)} accent="text-teal-400"/>
            <Row icon={Cpu}    label="Embedding dim"  value={data?.embed_dim}                 accent="text-amber-400"/>
          </CardBody>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader><Server size={13} className="text-brand-400"/><span className="font-semibold text-sm font-display text-[var(--text)]">Active Models</span></CardHeader>
          <CardBody className="py-0 grid xl:grid-cols-2 gap-x-8">
            <Row icon={Server} label="LLM"    value={data?.cf_llm_model||'@cf/mistral/mistral-7b-instruct-v0.1'} accent="text-indigo-400"/>
            <Row icon={Cpu}    label="Embed"  value="@cf/baai/bge-small-en-v1.5"    accent="text-sky-400"/>
            <Row icon={Layers} label="Rerank" value="@cf/baai/bge-reranker-base"    accent="text-violet-400"/>
            <Row icon={Image}  label="Vision" value="@cf/llava-hf/llava-1.5-7b-hf"  accent="text-rose-400"/>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
