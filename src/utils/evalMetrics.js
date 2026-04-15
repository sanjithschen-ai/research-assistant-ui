// ─────────────────────────────────────────────────────────────────────────────
// evalMetrics.js — All eval computation logic (ported from app.js)
// ─────────────────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','could','should','may','might','shall','can',
  'need','dare','ought','used','i','we','you','he','she','it','they','them',
  'their','our','your','my','this','that','these','those','which','who','what',
  'when','where','how','in','on','at','to','for','of','with','by','from','up',
  'about','into','through','during','before','after','above','below','between',
  'each','and','but','or','nor','so','yet','both','either','neither','not','no',
  'if','then','than','as','also','very','just','more','most','other','some',
  'such','only','same','too','s','t','paper','papers','model','models','method',
  'methods','approach','result','results','show','shows','showed','using','based',
  'used','study',
])

const FILLER_PHRASES = [
  'certainly','absolutely','of course','sure','great question','i understand',
  'as an ai','based on the context','i hope this helps','please note',
  'it is important to note','in conclusion','to summarize','in summary',
  'as mentioned','as stated','it should be noted',
]

function tokenise(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

function jaccard(setA, setB) {
  if (!setA.size || !setB.size) return 0
  let hits = 0
  for (const t of setA) if (setB.has(t)) hits++
  return hits / Math.max(setA.size, setB.size)
}

function sentenceGrounding(answer, contextTokens) {
  const sentences = answer.match(/[^.!?]+[.!?]+/g) || [answer]
  if (!sentences.length) return 0
  let grounded = 0
  for (const s of sentences) {
    const sToks = new Set(tokenise(s))
    for (const t of sToks) {
      if (contextTokens.has(t)) { grounded++; break }
    }
  }
  return grounded / sentences.length
}

export function computeGenerationMetrics(question, answer, textResults, semanticFaithfulness = null, semanticRelevance = null) {
  const contextAll = textResults.map(r => r.text || '').join(' ')
  const qToks = new Set(tokenise(question))
  const aToks = new Set(tokenise(answer))
  const cToks = new Set(tokenise(contextAll))

  let relevance, relevanceRaw, relevanceSource
  if (semanticRelevance !== null) {
    relevance = semanticRelevance
    relevanceRaw = (semanticRelevance / 10).toFixed(3)
    relevanceSource = 'semantic'
  } else {
    relevanceRaw = jaccard(qToks, aToks) || 0
    const lenBonus = Math.min(answer.split(/\s+/).length / 80, 1) * 0.15
    relevance = Math.min(10, (relevanceRaw + lenBonus) * 10 * 1.2)
    relevanceSource = 'heuristic'
  }

  let faithfulness, faithRaw, faithSource
  if (semanticFaithfulness !== null) {
    faithfulness = semanticFaithfulness
    faithRaw = (semanticFaithfulness / 10).toFixed(3)
    faithSource = 'semantic'
  } else {
    faithRaw = jaccard(aToks, cToks) || 0
    faithfulness = Math.min(10, faithRaw * 10 * 1.3)
    faithSource = 'heuristic'
  }

  const wordCount = answer.split(/\s+/).filter(Boolean).length
  const sentCount = (answer.match(/[.!?]+/g) || []).length
  const compRaw = Math.min(1, wordCount / 120) * 0.6 + Math.min(1, sentCount / 5) * 0.4
  const completeness = Math.min(10, compRaw * 10 * 1.1)

  const lowerAnswer = answer.toLowerCase()
  const fillerCount = FILLER_PHRASES.filter(f => lowerAnswer.includes(f)).length
  const conciseness = Math.max(0, 10 - fillerCount * 1.5 - Math.max(0, (wordCount - 300) / 60))

  const groundRaw = sentenceGrounding(answer, cToks) || 0
  const groundedness = Math.min(10, groundRaw * 10 * 1.15)

  const composite = relevance * 0.25 + faithfulness * 0.3 + completeness * 0.2 + conciseness * 0.1 + groundedness * 0.15
  const quality = composite >= 7.5 ? 'excellent' : composite >= 5.5 ? 'good' : composite >= 3.5 ? 'fair' : 'poor'

  return {
    relevance: +relevance.toFixed(2),
    faithfulness: +faithfulness.toFixed(2),
    completeness: +completeness.toFixed(2),
    conciseness: +conciseness.toFixed(2),
    groundedness: +groundedness.toFixed(2),
    composite: +composite.toFixed(2),
    quality, relevanceSource, faithSource,
    debug: {
      word_count: wordCount, sentence_count: sentCount, filler_hits: fillerCount,
      relevance_raw: +(+relevanceRaw).toFixed(3),
      faith_raw: +(+faithRaw).toFixed(3),
      ground_raw: +groundRaw.toFixed(3),
    },
  }
}

export function computeRetrievalMetrics(results) {
  const n = results.length
  if (!n) return {}
  const rawFaiss = results.map(r => r.faiss_score ?? 0)
  const rawRerank = results.map(r => r.rerank_score != null ? r.rerank_score : null)
  const validRerank = rawRerank.filter(v => v !== null)
  const mean = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0
  const std  = a => { if (!a.length) return 0; const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length) }
  const fMean = mean(rawFaiss), fStd = std(rawFaiss)
  const fMax = Math.max(...rawFaiss), fMin = Math.min(...rawFaiss)
  const uniquePages = new Set(results.map(r => `${r.pdf_id}__${r.page}`)).size
  const uniquePdfs  = new Set(results.map(r => r.pdf_id).filter(Boolean)).size
  const diversity   = uniquePages / n
  const top1Faiss   = rawFaiss[0] ?? 0
  const top1Rerank  = rawRerank[0] ?? null
  const scoreGap    = rawFaiss.length > 1 ? rawFaiss[0] - rawFaiss[rawFaiss.length - 1] : 0
  const conf        = top1Faiss >= 0.75 ? 'high' : top1Faiss >= 0.45 ? 'medium' : 'low'
  return {
    num_results: n, top1_faiss_score: top1Faiss, top1_rerank_score: top1Rerank,
    score_gap: scoreGap, retrieval_confidence: conf,
    unique_pdfs_in_results: uniquePdfs, unique_pages_in_results: uniquePages,
    chunk_diversity_ratio: diversity,
    faiss_scores: { mean: fMean, std: fStd, max: fMax, min: fMin },
    rerank_scores: validRerank.length ? { mean: mean(validRerank), std: std(validRerank) } : null,
    raw_faiss: rawFaiss, raw_rerank: rawRerank,
  }
}

export async function fetchSemanticScores(base, question, answer, textResults) {
  const context = textResults.map(r => r.text || '').join(' ').slice(0, 3000)
  async function call(textA, textB) {
    try {
      const r = await fetch(`${base}/tools/semantic_score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text_a: textA, text_b: textB }),
        signal: AbortSignal.timeout(15000),
      })
      if (!r.ok) return null
      const j = await r.json()
      if (j.status !== 'ok') return null
      return +(j.data.score * 10).toFixed(2)
    } catch { return null }
  }
  const [semanticFaithfulness, semanticRelevance] = await Promise.all([
    call(answer, context),
    call(answer, question),
  ])
  return { semanticFaithfulness, semanticRelevance }
}
