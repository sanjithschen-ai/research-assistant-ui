// ─────────────────────────────────────────────────────────────────────────────
// useTTS.js  —  Edge TTS via FastAPI backend
// Calls POST /tools/tts → receives MP3 → plays via HTMLAudioElement
// ~300ms latency vs 4-6s with browser Web Speech API
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useCallback, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Strip markdown before sending to TTS
function cleanText(text) {
  return text
    .replace(/\[.*?\]/g, '')
    .replace(/\*{1,2}(.*?)\*{1,2}/g, '$1')
    .replace(/`{1,3}.*?`{1,3}/gs, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2500)
}

export function useTTS() {
  const [status, setStatus]   = useState('idle')   // idle | loading | playing | paused | error
  const audioRef              = useRef(null)
  const abortRef              = useRef(null)
  const lastTextRef           = useRef('')

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const _destroyAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended  = null
      audioRef.current.onerror  = null
      audioRef.current.src = ''
      audioRef.current = null
    }
  }, [])

  const speak = useCallback(async (rawText) => {
    // Cancel any in-flight request + current playback
    abortRef.current?.abort()
    _destroyAudio()

    const text = cleanText(rawText)
    if (!text) return
    lastTextRef.current = rawText

    setStatus('loading')

    abortRef.current = new AbortController()

    try {
      const resp = await fetch(`${API_BASE}/tools/tts`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text, voice: 'en-US-AriaNeural', rate: '+0%', volume: '+0%' }),
        signal:  abortRef.current.signal,
      })

      if (!resp.ok) {
        // Fallback to browser Web Speech API if endpoint not available
        console.warn('[TTS] Server endpoint failed, falling back to Web Speech API')
        _browserFallback(rawText)
        return
      }

      const blob    = await resp.blob()
      const url     = URL.createObjectURL(blob)
      const audio   = new Audio(url)
      audioRef.current = audio

      audio.onplay   = () => setStatus('playing')
      audio.onpause  = () => setStatus('paused')
      audio.onended  = () => { setStatus('idle'); URL.revokeObjectURL(url) }
      audio.onerror  = () => { setStatus('error'); URL.revokeObjectURL(url) }

      await audio.play()

    } catch (err) {
      if (err.name === 'AbortError') return   // user cancelled — silent
      console.error('[TTS] Error:', err)
      setStatus('error')
      // Fallback to Web Speech API
      _browserFallback(rawText)
    }
  }, [_destroyAudio])

  // Web Speech API fallback (if server TTS endpoint not reachable)
  const _browserFallback = useCallback((rawText) => {
    const synth = window.speechSynthesis
    if (!synth) { setStatus('error'); return }
    synth.cancel()
    const utt = new SpeechSynthesisUtterance(cleanText(rawText))
    utt.rate = 1.0
    utt.onstart  = () => setStatus('playing')
    utt.onend    = () => setStatus('idle')
    utt.onerror  = () => setStatus('error')
    synth.speak(utt)
  }, [])

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      setStatus('paused')
    }
  }, [])

  const resume = useCallback(() => {
    if (audioRef.current?.paused) {
      audioRef.current.play()
      setStatus('playing')
    }
  }, [])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    _destroyAudio()
    setStatus('idle')
  }, [_destroyAudio])

  const replay = useCallback(() => {
    if (lastTextRef.current) speak(lastTextRef.current)
  }, [speak])

  const toggle = useCallback(() => {
    if (status === 'playing') pause()
    else if (status === 'paused') resume()
    else if (status === 'idle' && lastTextRef.current) speak(lastTextRef.current)
  }, [status, pause, resume, speak])

  return {
    speak, pause, resume, stop, replay, toggle,
    status,               // 'idle' | 'loading' | 'playing' | 'paused' | 'error'
    isSupported: true,    // always true — has server fallback + browser fallback
  }
}
