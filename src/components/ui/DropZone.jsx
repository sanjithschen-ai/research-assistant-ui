import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileImage, X } from 'lucide-react'
import { cn } from '../../utils/helpers'

export default function DropZone({ onFile, accept, label = 'Drop file here or click to browse', hint, value, onClear }) {
  const onDrop = useCallback((files) => { if (files[0]) onFile(files[0]) }, [onFile])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, maxFiles:1, multiple:false })

  if (value) return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-brand-500/30 bg-brand-500/5">
      <FileImage size={15} className="text-brand-400 shrink-0" />
      <span className="text-sm text-[var(--text)] flex-1 truncate">{value.name}</span>
      <button onClick={onClear} className="text-[var(--text-dim)] hover:text-red-500 transition-colors"><X size={14} /></button>
    </div>
  )

  return (
    <div {...getRootProps()} className={cn(
      'flex flex-col items-center justify-center gap-3 py-8 px-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200',
      isDragActive
        ? 'border-brand-500 bg-brand-500/5'
        : 'border-[var(--border)] hover:border-brand-500/40 hover:bg-[var(--muted)]'
    )}>
      <input {...getInputProps()} />
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
        isDragActive ? 'bg-brand-500 text-white' : 'bg-[var(--muted)] text-[var(--text-sub)]')}>
        <Upload size={18} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--text)]">{label}</p>
        {hint && <p className="text-xs text-[var(--text-dim)] mt-1">{hint}</p>}
      </div>
    </div>
  )
}
