import { useQuery } from '@tanstack/react-query'
import { LayoutDashboard, FileText, Layers, Image, Cpu, Database, Server, TrendingUp } from 'lucide-react'
import { getStats } from '../api/client'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Misc'
import PageHeader from '../components/layout/PageHeader'
import { fmt } from '../utils/helpers'

function StatCard({ label, value, icon: Icon, color, loading, trend }) {
  const colors = {
    indigo: { bg:'bg-brand-500/10', border:'border-brand-500/15', icon:'text-brand-400', bar:'bg-brand-500' },
    violet: { bg:'bg-violet-500/10', border:'border-violet-500/15', icon:'text-violet-400', bar:'bg-violet-500' },
    emerald:{ bg:'bg-emerald-500/10', border:'border-emerald-500/15', icon:'text-emerald-400', bar:'bg-emerald-500' },
    amber:  { bg:'bg-amber-500/10', border:'border-amber-500/15', icon:'text-amber-400', bar:'bg-amber-500' },
  }
  const c = colors[color] || colors.indigo
  return (
    <Card className="overflow-hidden">
      <CardBody className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
            <Icon size={16} className={c.icon} />
          </div>
          {trend && <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium"><TrendingUp size={11}/>{trend}</span>}
        </div>
        {loading
          ? <Skeleton className="h-8 w-24 mb-1" />
          : <p className="text-3xl font-bold text-[var(--text)] font-display">{fmt.number(value)}</p>
        }
        <p className="text-xs text-[var(--text-sub)] mt-1 font-medium uppercase tracking-wide">{label}</p>
      </CardBody>
    </Card>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--text-sub)]">{label}</span>
      <span className="text-xs font-mono text-[var(--text)] bg-[var(--muted)] px-2 py-0.5 rounded truncate max-w-[220px]">{value || '—'}</span>
    </div>
  )
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey:['stats'], queryFn:getStats, refetchInterval:30000 })

  return (
    <div className="animate-fade-in">
      <PageHeader icon={LayoutDashboard} title="Dashboard" subtitle="Live snapshot of your indexed papers, vector store size, and active Cloudflare AI models" />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="PDFs Indexed"   value={data?.total_pdfs}   icon={FileText} color="indigo"  loading={isLoading} />
        <StatCard label="Text Chunks"    value={data?.total_chunks} icon={Layers}   color="violet"  loading={isLoading} />
        <StatCard label="Figures Stored" value={data?.total_images} icon={Image}    color="emerald" loading={isLoading} />
        <StatCard label="Embedding Dim"  value={data?.embed_dim}    icon={Cpu}      color="amber"   loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <Database size={14} className="text-brand-400" />
            <span className="font-semibold text-sm text-[var(--text)] font-display">Vector Store</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-sm" />
              <span className="text-xs text-emerald-400">Active</span>
            </div>
          </CardHeader>
          <CardBody className="py-0">
            <InfoRow label="Text Vectors"   value={fmt.number(data?.text_vectors)} />
            <InfoRow label="Image Vectors"  value={fmt.number(data?.image_vectors)} />
            <InfoRow label="Embedding Dim"  value={data?.embed_dim} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Server size={14} className="text-brand-400" />
            <span className="font-semibold text-sm text-[var(--text)] font-display">Cloudflare Workers AI</span>
          </CardHeader>
          <CardBody className="py-0">
            <InfoRow label="LLM"    value={data?.cf_llm_model} />
            <InfoRow label="Embed"  value="@cf/baai/bge-small-en-v1.5" />
            <InfoRow label="Rerank" value="@cf/baai/bge-reranker-base" />
            <InfoRow label="Vision" value="@cf/llava-hf/llava-1.5-7b-hf" />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
