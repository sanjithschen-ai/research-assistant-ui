import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { GalleryHorizontal, Search, Sparkles, Hash } from 'lucide-react'
import toast from 'react-hot-toast'
import { listPdfs, searchImages, describeImage } from '../api/client'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Select } from '../components/ui/Input'
import Button from '../components/ui/Button'
import { Empty, Skeleton } from '../components/ui/Misc'
import ImageCard from '../components/ui/ImageCard'
import ImageModal from '../components/ui/ImageModal'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/layout/PageHeader'

function DescribeModal({ img, open, onClose }) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)

  const mut = useMutation({
    mutationFn: () => describeImage(img.image_id, query),
    onSuccess: (data) => setResult(data),
    onError:   () => toast.error('Description failed'),
  })

  const handleClose = () => { onClose(); setResult(null); setQuery('') }

  return (
    <Modal open={open} onClose={handleClose} title="AI Figure Description" size="lg">
      <div className="space-y-4">
        {img && (img.url || img.path) && (
          <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--muted)] max-h-60">
            <img
              src={img.url || `http://localhost:8000/images/${img.path?.split(/[/\\]/).pop()}`}
              alt="Figure" className="w-full h-full object-contain max-h-60" />
          </div>
        )}

        <div className="flex gap-2">
          <input
            className="input-base flex-1 h-9 px-3"
            placeholder="Ask something specific, or leave blank for a general description…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && mut.mutate()}
          />
          <Button icon={Sparkles} loading={mut.isPending} onClick={() => mut.mutate()}>
            Describe
          </Button>
        </div>

        {result && (
          <div className="p-4 rounded-xl bg-[var(--muted)] border border-[var(--border)] animate-slide-up">
            <p className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
            {result.caption && (
              <p className="text-xs text-[var(--text-dim)] mt-3 pt-3 border-t border-[var(--border)] font-mono">
                Stored caption: {result.caption}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <p className="text-[11px] font-mono text-[var(--text-dim)] flex-1 truncate">{img?.image_id}</p>
          <Button variant="ghost" size="sm" onClick={handleClose}>Close</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function FigureExplorer() {
  const [selectedPdf, setSelectedPdf] = useState('')
  const [expandedImg, setExpandedImg] = useState(null)
  const [describeImg, setDescribeImg] = useState(null)

  const { data: pdfData } = useQuery({ queryKey: ['pdfs'], queryFn: listPdfs })
  const pdfs = pdfData?.pdfs ?? []

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['figures', selectedPdf],
    queryFn:  () => searchImages(selectedPdf ? `figures from pdf ${selectedPdf}` : 'figure diagram', 50),
  })

  const allImages = data?.image_results ?? []
  const filtered  = selectedPdf ? allImages.filter(img => img.pdf_id === selectedPdf) : allImages

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={GalleryHorizontal}
        title="Figure Explorer"
        subtitle="All figures automatically extracted from your PDFs during indexing — browse, zoom, copy IDs, or ask AI to describe any one"
        action={
          <Button variant="outline" size="sm" icon={Search} onClick={() => refetch()}>Refresh</Button>
        }
      />

      {/* Filter bar */}
      <Card className="mb-5">
        <CardBody className="py-3">
          <div className="flex items-center gap-4">
            <div className="w-56">
              <Select value={selectedPdf} onChange={e => setSelectedPdf(e.target.value)}>
                <option value="">All PDFs</option>
                {pdfs.map(p => <option key={p.pdf_id} value={p.pdf_id}>{p.filename}</option>)}
              </Select>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
              <Hash size={11} />
              <span className="font-mono">{filtered.length} figure{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-full rounded-xl" style={{ aspectRatio:'16/10' }} />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody>
            <Empty icon={GalleryHorizontal} title="No figures found"
              description="Index PDFs with caption_images enabled to extract figures." />
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map(img => (
            <div key={img.image_id} className="group relative">
              <ImageCard img={img} onExpand={setExpandedImg} />
              <button
                onClick={() => setDescribeImg(img)}
                className="absolute bottom-[52px] inset-x-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold font-display
                  opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                  transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Sparkles size={11} /> Describe with AI
              </button>
            </div>
          ))}
        </div>
      )}

      {expandedImg && <ImageModal img={expandedImg} onClose={() => setExpandedImg(null)} />}
      <DescribeModal img={describeImg} open={!!describeImg} onClose={() => setDescribeImg(null)} />
    </div>
  )
}
