import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar        from './components/layout/Sidebar'
import Dashboard      from './pages/Dashboard'
import PdfManager     from './pages/PdfManager'
import AskPage        from './pages/AskPage'
import ExplainFigure  from './pages/ExplainFigure'
import VisualQuery    from './pages/VisualQuery'
import FigureExplorer from './pages/FigureExplorer'
import ImageInterpret from './pages/ImageInterpret'
import Statistics     from './pages/Statistics'
import RebuildIndex   from './pages/RebuildIndex'

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
            <Sidebar />
            <main className="flex-1 min-w-0 overflow-y-auto">
              <div className="max-w-6xl mx-auto px-8 py-8">
                <Routes>
                  <Route path="/"          element={<Dashboard />}      />
                  <Route path="/pdfs"      element={<PdfManager />}     />
                  <Route path="/ask"       element={<AskPage />}        />
                  <Route path="/explain"   element={<ExplainFigure />}  />
                  <Route path="/visual"    element={<VisualQuery />}    />
                  <Route path="/figures"   element={<FigureExplorer />} />
                  <Route path="/interpret" element={<ImageInterpret />} />
                  <Route path="/stats"     element={<Statistics />}     />
                  <Route path="/rebuild"   element={<RebuildIndex />}   />
                </Routes>
              </div>
            </main>
          </div>
        </BrowserRouter>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            },
            success: { iconTheme: { primary: '#10B981', secondary: 'white' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: 'white' } },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
