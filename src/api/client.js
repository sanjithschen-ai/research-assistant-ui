import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE, timeout: 300_000 })

// ── PDFs ──────────────────────────────────────────────────────────────────────

export const listPdfs = () =>
  api.get('/tools/list_pdfs').then(r => r.data.data)

export const addPdf = (file_path, force = false) =>
  api.post('/tools/add_pdf', { file_path, force, caption_images: true }).then(r => r.data)

export const addPdfsDir = (directory, force = false) =>
  api.post('/tools/add_pdfs_dir', { directory, force, caption_images: true }).then(r => r.data)

export const removePdf = (pdf_id) =>
  api.delete('/tools/remove_pdf', { data: { pdf_id } }).then(r => r.data)

// ── Q&A ───────────────────────────────────────────────────────────────────────

export const askQuestion = ({ question, top_k = 5, use_reranking = true, include_images = true }) =>
  api.post('/tools/ask', { question, top_k, use_reranking, include_images }).then(r => r.data.data)

// ── Images ────────────────────────────────────────────────────────────────────

export const explainImage = (file, query = '', top_k = 3) => {
  const form = new FormData()
  form.append('file', file)
  form.append('query', query)
  form.append('top_k', String(top_k))
  return api.post('/tools/explain_image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data.data)
}

export const describeImage = (image_id, query = '') =>
  api.post('/tools/describe_image', { image_id, query }).then(r => r.data.data)

export const searchImages = (query, top_k = 10) =>
  api.post('/tools/search', {
    query, top_k, faiss_candidates: 20, use_reranking: false, include_images: true,
  }).then(r => r.data.data)

// ── Visual Query ──────────────────────────────────────────────────────────────

export const visualQuery = (file, query, top_k = 3) => {
  const form = new FormData()
  form.append('file', file)
  form.append('query', query)
  form.append('top_k', String(top_k))
  return api.post('/tools/explain_image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data.data)
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export const getStats = () =>
  api.get('/tools/stats').then(r => r.data.data)

// ── Rebuild ───────────────────────────────────────────────────────────────────

export const rebuildIndex = () =>
  api.post('/tools/rebuild', {}).then(r => r.data)

// ── EDA ───────────────────────────────────────────────────────────────────────

export const getEdaInsights = (eda_summary) =>
  api.post('/tools/eda_insights', { eda_summary }).then(r => r.data.data)

export const extractDatasets = (paper_text = '', pdf_id = '', top_k = 8) =>
  api.post('/tools/extract_datasets', { paper_text, pdf_id, top_k }).then(r => r.data.data)

export default api
