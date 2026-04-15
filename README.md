# Research Assistant — Frontend

React + Vite + TailwindCSS frontend for the Research Assistant.

## Setup

```bash
npm install
npm run dev       # development  →  http://localhost:3000
npm run build     # production build  →  dist/
```

## Environment Variable

Create a `.env` file:

```
VITE_API_URL=https://YOUR_HF_USERNAME-research-assistant.hf.space
```

For local development:

```
VITE_API_URL=http://localhost:8000
```

## Deploy on Vercel

```bash
npm install -g vercel
npm run build
vercel --prod
```

Set `VITE_API_URL` in Vercel dashboard → Settings → Environment Variables.

## Pages

| Route        | Description                          |
| ------------ | ------------------------------------ |
| `/`          | Dashboard — system stats             |
| `/pdfs`      | PDF Manager — add/remove papers      |
| `/ask`       | Ask / RAG Q&A + eval metrics         |
| `/visual`    | Visual Query — search by image       |
| `/explain`   | Explain Figure — upload + explain    |
| `/figures`   | Figure Explorer — browse all figures |
| `/interpret` | Image Interpretation — by Image ID   |
| `/stats`     | Statistics                           |
| `/rebuild`   | Rebuild FAISS index                  |
