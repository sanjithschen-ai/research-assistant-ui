import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ScanSearch, Upload, Type, Sparkles, SlidersHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import { visualQuery } from '../api/client'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Input, Textarea, Select } from '../components/ui/Input'
import Button from '../components/ui/Button'
import DropZone from '../components/ui/DropZone'
import ResultCard from '../components/ui/ResultCard'
import ImageCard from '../components/ui/ImageCard'
import ImageModal from '../components/ui/ImageModal'
import PageHeader from '../components/layout/PageHeader'

export default function VisualQuery() {
  const [mode, setMode]         = useState('file')
  const [file, setFile]         = useState(null)
  const [desc, setDesc]         = useState('')
  const [topK, setTopK]         = useState(3)
  const [showOpts, setShowOpts] = useState(false)
  const [result, setResult]     = useState(null)
  const [expandedImg, setExpandedImg] = useState(null)

  const mut = useMutation({
    mutationFn: async () => {
      if (mode === 'file') return visualQuery(file, desc, topK)
      const r = await fetch('http://localhost:8000/tools/multimodal_rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text_query: desc, image_desc: desc }),
      })
      const json = await r.json()
      return json.data
    },
    onSuccess: (data) => setResult(data),
    onError:   () => toast.error('Visual query failed'),
  })

  const submit = () => {
    if (mode==='file' && !file) { toast.error('Please upload an image'); return }
    if (mode==='text' && !desc.trim()) { toast.error('Please describe the figure'); return }
    setResult(null); mut.mutate()
  }

  const textResults  = result?.text_results  || []
  const imageResults = result?.image_results || []
  const explanation  = result?.explanation || result?.answer

  return (
    <div className="animate-fade-in">
      <PageHeader icon={ScanSearch} title="Visual Query"
        subtitle="Upload an image or describe a figure in text → finds matching sections and figures across all your indexed papers" />

      <div className="grid xl:grid-cols-2 gap-5">
        {/* Input panel */}
        <Card>
          <CardHeader>
            <ScanSearch size={13} className="text-brand-400" />
            <span className="font-semibold text-sm font-display text-[var(--text)]">Query Input</span>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* Mode tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
              {[{key:'file',icon:Upload,label:'Upload Image'},{key:'text',icon:Type,label:'Describe It'}].map(({key,icon:Icon,label})=>(
                <button key={key} onClick={()=>{setMode(key);setResult(null)}}
                  className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium font-display transition-all ${
                    mode===key ? 'bg-brand-600 text-white shadow-sm' : 'text-[var(--text-sub)] hover:text-[var(--text)]'
                  }`}>
                  <Icon size={13}/>{label}
                </button>
              ))}
            </div>

            {mode==='file' ? (
              <>
                <DropZone onFile={setFile} value={file} onClear={()=>setFile(null)}
                  accept={{'image/*':['.png','.jpg','.jpeg','.webp']}}
                  label="Drop figure to search with" hint="Used as the visual query" />
                <Input label="Brief description (helps retrieval)"
                  placeholder="SpiNNaker2 architecture diagram…"
                  value={desc} onChange={e=>setDesc(e.target.value)} />
              </>
            ) : (
              <Textarea label="Describe the figure you're looking for"
                placeholder="A block diagram showing encoder-decoder architecture with attention layers…"
                rows={5} value={desc} onChange={e=>setDesc(e.target.value)} />
            )}

            <button onClick={()=>setShowOpts(!showOpts)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-sub)] hover:text-[var(--text)] transition-colors font-display">
              <SlidersHorizontal size={11}/>{showOpts?'Hide':'Show'} options
            </button>
            {showOpts && (
              <div className="animate-slide-up">
                <Select label="Top-K results" value={topK} onChange={e=>setTopK(Number(e.target.value))}>
                  {[2,3,5,8].map(n=><option key={n} value={n}>{n}</option>)}
                </Select>
              </div>
            )}

            <Button className="w-full" icon={Sparkles} loading={mut.isPending} onClick={submit}>
              Search Papers
            </Button>
          </CardBody>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {mut.isPending && (
            <Card><CardBody>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-brand-400">Searching indexed papers…</p>
              </div>
            </CardBody></Card>
          )}

          {explanation && (
            <Card>
              <CardHeader>
                <Sparkles size={13} className="text-brand-400"/>
                <span className="font-semibold text-sm font-display text-[var(--text)]">Result</span>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-wrap">{explanation}</p>
              </CardBody>
            </Card>
          )}

          {textResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[var(--text-sub)] uppercase tracking-wider font-display">
                {textResults.length} matching sections
              </p>
              {textResults.map((r,i) => <ResultCard key={r.chunk_id||i} result={r} index={i} />)}
            </div>
          )}

          {imageResults.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[var(--text-sub)] uppercase tracking-wider font-display mb-3">
                Related figures
              </p>
              <div className="grid grid-cols-2 gap-3">
                {imageResults.map(img => (
                  <ImageCard key={img.image_id} img={img} onExpand={setExpandedImg} />
                ))}
              </div>
            </div>
          )}

          {!result && !mut.isPending && (
            <div className="min-h-[200px] rounded-xl border-2 border-dashed border-[var(--border)] flex items-center justify-center">
              <p className="text-sm text-[var(--text-dim)] font-mono">Results will appear here</p>
            </div>
          )}
        </div>
      </div>

      {expandedImg && <ImageModal img={expandedImg} onClose={()=>setExpandedImg(null)} />}
    </div>
  )
}
