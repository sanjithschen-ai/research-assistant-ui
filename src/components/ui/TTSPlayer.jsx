// ─────────────────────────────────────────────────────────────────────────────
// TTSPlayer.jsx  —  Audio controls powered by Edge TTS (FastAPI backend)
// Play · Pause/Resume · Stop · Replay
// ─────────────────────────────────────────────────────────────────────────────
import { Volume2, Pause, Play, Square, RotateCcw, Mic, Loader2 } from 'lucide-react'
import { useTTS } from '../../hooks/useTTS'
import { cn } from '../../utils/helpers'

// ── Animated waveform bars ────────────────────────────────────────────────────
function Waveform({ active }) {
  const heights = [3, 7, 12, 8, 14, 9, 5, 11, 7, 13, 6, 9]
  return (
    <div className="flex items-end gap-[3px] h-7 px-1">
      {heights.map((h, i) => (
        <div
          key={i}
          className={cn('w-[3px] rounded-full transition-all duration-300', active ? 'bg-brand-400' : 'bg-[var(--border)]')}
          style={{
            height: active ? `${h * 2}px` : '3px',
            animation: active ? `pulseSm ${0.5 + i * 0.07}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.04}s`,
          }}
        />
      ))}
    </div>
  )
}

// ── Main Player ───────────────────────────────────────────────────────────────
export default function TTSPlayer({ text }) {
  const { speak, toggle, stop, replay, status } = useTTS()

  const isLoading = status === 'loading'
  const isPlaying = status === 'playing'
  const isPaused  = status === 'paused'
  const isError   = status === 'error'
  const isIdle    = status === 'idle'

  return (
    <div className={cn(
      'relative rounded-2xl border transition-all duration-300 overflow-hidden',
      isPlaying ? 'border-brand-500/40 bg-brand-500/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
      : isPaused  ? 'border-amber-500/30 bg-amber-500/5'
      : isLoading ? 'border-brand-500/20 bg-brand-500/5'
      : isError   ? 'border-red-500/20 bg-red-500/5'
      : 'border-[var(--border)] bg-[var(--surface)]'
    )}>

      {/* Top shimmer when playing */}
      {isPlaying && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-400 to-transparent animate-shimmer" />
      )}

      <div className="flex items-center gap-4 px-5 py-4">

        {/* Left — icon */}
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
          isPlaying ? 'bg-brand-600 shadow-[0_0_14px_rgba(99,102,241,0.5)]'
          : isPaused  ? 'bg-amber-500/20 border border-amber-500/25'
          : isLoading ? 'bg-brand-500/15 border border-brand-500/20'
          : isError   ? 'bg-red-500/10 border border-red-500/20'
          : 'bg-[var(--muted)] border border-[var(--border)]'
        )}>
          {isLoading
            ? <Loader2  size={19} className="text-brand-400 animate-spin" />
            : isPlaying
            ? <Volume2  size={19} className="text-white" />
            : isPaused
            ? <Pause    size={19} className="text-amber-400" />
            : <Mic      size={19} className="text-[var(--text-sub)]" />
          }
        </div>

        {/* Middle — label + waveform */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-0.5">
            <p className={cn(
              'text-sm font-semibold font-display leading-none transition-colors',
              isPlaying ? 'text-brand-300'
              : isPaused  ? 'text-amber-400'
              : isLoading ? 'text-brand-400'
              : isError   ? 'text-red-400'
              : 'text-[var(--text)]'
            )}>
              {isLoading ? 'Generating audio…'
               : isPlaying ? 'Speaking'
               : isPaused  ? 'Paused'
               : isError   ? 'TTS unavailable'
               : 'Text to Speech'}
            </p>
            <Waveform active={isPlaying} />
          </div>
          <p className="text-xs text-[var(--text-dim)] truncate">
            {isLoading ? 'Edge TTS · en-US-AriaNeural · generating via server…'
             : isPlaying ? 'Edge TTS · Microsoft AriaNeural · streaming'
             : isPaused  ? 'Paused — click Resume to continue'
             : isError   ? 'Server TTS failed — check edge-tts is installed (pip install edge-tts)'
             : 'Click Play to read the answer aloud · Edge TTS via server'}
          </p>
        </div>

        {/* Right — controls */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Main Play / Pause / Resume button */}
          <button
            onClick={() => isIdle || isError ? speak(text) : toggle()}
            disabled={isLoading}
            title={isIdle ? 'Play' : isPlaying ? 'Pause' : 'Resume'}
            className={cn(
              'flex items-center gap-2 px-5 h-10 rounded-xl font-semibold text-sm font-display',
              'transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
              isIdle || isError
                ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm shadow-brand-600/30'
                : isPlaying
                ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/25'
                : 'bg-brand-500/15 hover:bg-brand-500/25 text-brand-400 border border-brand-500/25'
            )}
          >
            {isLoading  && <><Loader2 size={15} className="animate-spin shrink-0" /><span>Loading…</span></>}
            {isIdle     && <><Play    size={15} className="shrink-0" /><span>Play</span></>}
            {isError    && <><Play    size={15} className="shrink-0" /><span>Retry</span></>}
            {isPlaying  && <><Pause   size={15} className="shrink-0" /><span>Pause</span></>}
            {isPaused   && <><Play    size={15} className="shrink-0" /><span>Resume</span></>}
          </button>

          {/* Replay */}
          <button
            onClick={replay}
            disabled={isLoading}
            title="Replay from beginning"
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--border)]
              text-[var(--text-sub)] hover:text-[var(--text)] hover:border-brand-500/40 hover:bg-[var(--muted)]
              transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={14} />
          </button>

          {/* Stop — only when active */}
          {(isPlaying || isPaused || isLoading) && (
            <button
              onClick={stop}
              title="Stop"
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-red-500/20
                text-red-400 hover:bg-red-500/10 hover:border-red-500/40
                transition-all duration-150 active:scale-95"
            >
              <Square size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
