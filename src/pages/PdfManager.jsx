import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Plus, FolderOpen, Trash2, RefreshCw, Hash, Layers, Image, Calendar, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { listPdfs, addPdf, addPdfsDir, removePdf } from '../api/client'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Badge, Empty, Skeleton } from '../components/ui/Misc'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/layout/PageHeader'
import { fmt } from '../utils/helpers'

function AddPdfModal({ open, onClose }) {
  const qc = useQueryClient()
  const [path, setPath] = useState('')
  const [force, setForce] = useState(false)
  const mut = useMutation({
    mutationFn: () => addPdf(path.trim(), force),
    onSuccess: (d) => { if (d.status==='ok') { toast.success('PDF ingested'); qc.invalidateQueries(['pdfs']); qc.invalidateQueries(['stats']); onClose(); setPath('') } else toast.error(d.data?.message||'Failed') },
    onError: () => toast.error('Server error'),
  })
  return (
    <Modal open={open} onClose={onClose} title="Add PDF by File Path">
      <div className="space-y-4">
        <Input label="Absolute file path" placeholder="C:\papers\paper.pdf" value={path} onChange={e=>setPath(e.target.value)} hint="The server must have read access to this path" />
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" className="w-3.5 h-3.5 accent-brand-500" checked={force} onChange={e=>setForce(e.target.checked)} />
          <span className="text-sm text-[var(--text-sub)]">Force re-ingest if already indexed</span>
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" loading={mut.isPending} onClick={()=>mut.mutate()} disabled={!path.trim()}>Ingest PDF</Button>
        </div>
      </div>
    </Modal>
  )
}

function AddDirModal({ open, onClose }) {
  const qc = useQueryClient()
  const [dir, setDir] = useState('')
  const [force, setForce] = useState(false)
  const [result, setResult] = useState(null)
  const mut = useMutation({
    mutationFn: () => addPdfsDir(dir.trim(), force),
    onSuccess: (d) => { if (d.status==='ok') { setResult(d.data); qc.invalidateQueries(['pdfs']); qc.invalidateQueries(['stats']); toast.success('Batch complete') } else toast.error('Failed') },
    onError: () => toast.error('Server error'),
  })
  const handleClose = () => { onClose(); setResult(null); setDir('') }
  return (
    <Modal open={open} onClose={handleClose} title="Add PDFs from Directory" size="lg">
      {!result ? (
        <div className="space-y-4">
          <Input label="Directory path" placeholder="C:\papers\" value={dir} onChange={e=>setDir(e.target.value)} hint="All .pdf files in this directory will be ingested" />
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" className="w-3.5 h-3.5 accent-brand-500" checked={force} onChange={e=>setForce(e.target.checked)} />
            <span className="text-sm text-[var(--text-sub)]">Force re-ingest existing files</span>
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={handleClose}>Cancel</Button>
            <Button size="sm" icon={FolderOpen} loading={mut.isPending} onClick={()=>mut.mutate()} disabled={!dir.trim()}>Start Batch</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[['OK', 'ok', 'emerald'],['Skipped','skipped','amber'],['Errors','error','red']].map(([label,key,color])=>(
              <div key={label} className={`text-center p-3 rounded-xl bg-${color}-500/5 border border-${color}-500/15`}>
                <p className={`text-2xl font-bold font-display text-${color}-500`}>{result.results?.filter(r=>r.status===key).length??0}</p>
                <p className="text-xs text-[var(--text-sub)] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-[var(--border)] p-2 bg-[var(--muted)]">
            {result.results?.map((r,i)=>(
              <div key={i} className="flex items-center gap-2 text-xs font-mono py-1 px-2">
                <span className={r.status==='ok'?'text-emerald-400':r.status==='error'?'text-red-400':'text-amber-400'}>{r.status}</span>
                <span className="text-[var(--text-sub)] truncate">{r.filename||r.message}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end"><Button size="sm" onClick={handleClose}>Done</Button></div>
        </div>
      )}
    </Modal>
  )
}

function RemoveModal({ pdf, open, onClose }) {
  const qc = useQueryClient()
  const mut = useMutation({
    mutationFn: () => removePdf(pdf.pdf_id),
    onSuccess: () => { toast.success('PDF removed'); qc.invalidateQueries(['pdfs']); qc.invalidateQueries(['stats']); onClose() },
    onError: () => toast.error('Remove failed'),
  })
  return (
    <Modal open={open} onClose={onClose} title="Remove PDF" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
          <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">This action is irreversible</p>
            <p className="text-xs text-[var(--text-sub)] mt-0.5">All chunks and figures for <strong>{pdf?.filename}</strong> will be permanently deleted.</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="danger" size="sm" loading={mut.isPending} onClick={()=>mut.mutate()}>Delete Permanently</Button>
        </div>
      </div>
    </Modal>
  )
}

function PdfRow({ pdf, onRemove }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)] transition-colors group">
      <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/15 flex items-center justify-center shrink-0">
        <FileText size={13} className="text-brand-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text)] truncate">{pdf.filename}</p>
        <p className="text-[11px] font-mono text-[var(--text-dim)] mt-0.5">{pdf.pdf_id}</p>
      </div>
      <div className="hidden xl:flex items-center gap-4 text-xs text-[var(--text-dim)]">
        <span className="flex items-center gap-1"><Hash size={10}/>{pdf.total_pages||'?'} pages</span>
        <span className="flex items-center gap-1"><Layers size={10}/>{pdf.total_chunks||'?'} chunks</span>
        <span className="flex items-center gap-1"><Image size={10}/>{pdf.total_images||0} figs</span>
        <span className="flex items-center gap-1"><Calendar size={10}/>{fmt.date(pdf.indexed_at)}</span>
      </div>
      <Badge variant={pdf.total_chunks > 0 ? 'green' : 'amber'}>{pdf.total_chunks > 0 ? 'indexed' : 'empty'}</Badge>
      <button onClick={()=>onRemove(pdf)}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-dim)] hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
        <Trash2 size={13} />
      </button>
    </div>
  )
}

export default function PdfManager() {
  const [addOpen, setAddOpen] = useState(false)
  const [dirOpen, setDirOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const { data, isLoading, refetch } = useQuery({ queryKey:['pdfs'], queryFn:listPdfs })
  const pdfs = data?.pdfs ?? []

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={FileText}
        title="PDF Manager"
        subtitle={`Add papers by file path or folder, remove them, and track indexing status — ${pdfs.length} document${pdfs.length !== 1 ? 's' : ''} indexed`}
        action={<>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={()=>refetch()}>Refresh</Button>
          <Button variant="secondary" size="sm" icon={FolderOpen} onClick={()=>setDirOpen(true)}>Directory</Button>
          <Button size="sm" icon={Plus} onClick={()=>setAddOpen(true)}>Add PDF</Button>
        </>}
      />
      <Card>
        <CardHeader>
          <FileText size={13} className="text-brand-400" />
          <span className="font-semibold text-sm text-[var(--text)] font-display">Indexed Documents</span>
          <span className="ml-auto text-xs font-mono text-[var(--text-dim)] bg-[var(--muted)] px-2 py-0.5 rounded">{pdfs.length} total</span>
        </CardHeader>
        {isLoading
          ? <CardBody className="space-y-2">{[...Array(4)].map((_,i)=><Skeleton key={i} className="h-14 w-full"/>)}</CardBody>
          : pdfs.length === 0
            ? <CardBody><Empty icon={FileText} title="No PDFs indexed" description="Add a PDF by file path or ingest an entire directory." action={<Button size="sm" icon={Plus} onClick={()=>setAddOpen(true)}>Add your first PDF</Button>}/></CardBody>
            : <div>{pdfs.map(pdf=><PdfRow key={pdf.pdf_id} pdf={pdf} onRemove={setRemoveTarget}/>)}</div>
        }
      </Card>
      <AddPdfModal open={addOpen} onClose={()=>setAddOpen(false)}/>
      <AddDirModal open={dirOpen} onClose={()=>setDirOpen(false)}/>
      <RemoveModal pdf={removeTarget} open={!!removeTarget} onClose={()=>setRemoveTarget(null)}/>
    </div>
  )
}
