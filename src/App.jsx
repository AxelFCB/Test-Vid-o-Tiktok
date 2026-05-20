import { useState } from 'react'
import ConceptForm from './components/ConceptForm'
import ResultPanel from './components/ResultPanel'
import { generateConcept } from './services/anthropic'

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-xl opacity-80 blur-sm" />
        <div className="relative w-10 h-10 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.867V15.5a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
        </div>
      </div>
      <div>
        <h1 className="text-lg font-bold text-white leading-none">TikTok 3D Studio</h1>
        <p className="text-xs text-slate-500 mt-0.5">Générateur de concepts par IA</p>
      </div>
    </div>
  )
}

function StepBadge({ step, label, active, done }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${
      done ? 'text-emerald-400' : active ? 'text-white' : 'text-slate-600'
    }`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
        done
          ? 'bg-emerald-500 text-white'
          : active
          ? 'bg-gradient-to-br from-violet-600 to-cyan-500 text-white ring-2 ring-violet-500/30'
          : 'bg-studio-surface border border-studio-border'
      }`}>
        {done ? (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : step}
      </div>
      <span className="hidden sm:inline">{label}</span>
    </div>
  )
}

export default function App() {
  const [concept, setConcept] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleGenerate(params) {
    setIsLoading(true)
    setError(null)
    setConcept(null)
    try {
      const result = await generateConcept(params)
      setConcept(result)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleReset() {
    setConcept(null)
    setError(null)
  }

  const step = concept ? 2 : 0

  return (
    <div className="min-h-screen bg-studio-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-studio-border bg-studio-bg/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <StepBadge step="1" label="Paramètres" active={!concept} done={!!concept} />
            <div className="w-8 h-px bg-studio-border" />
            <StepBadge step="2" label="Résultat" active={!!concept} done={false} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!concept ? (
          <div className="max-w-2xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse-slow" />
                Powered by Claude AI
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
                <span className="text-gradient">Génère ton concept</span>
                <br />
                <span className="text-white">de vidéo 3D TikTok</span>
              </h2>
              <p className="text-slate-400 text-base leading-relaxed max-w-lg mx-auto">
                Remplis le formulaire, l'IA crée un concept complet avec script, 6 scènes, prompts Runway / Kling et hashtags optimisés.
              </p>
            </div>

            {/* Form card */}
            <div className="card">
              <ConceptForm onGenerate={handleGenerate} isLoading={isLoading} />
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 flex gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
                <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-400">Erreur</p>
                  <p className="text-sm text-red-300/80 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Feature grid */}
            <div className="grid grid-cols-3 gap-3 mt-8">
              {[
                { icon: '🎬', label: '6 scènes', desc: '10s chacune' },
                { icon: '🤖', label: 'Prompts IA', desc: 'Runway & Kling' },
                { icon: '📱', label: 'Hashtags', desc: 'Optimisés TikTok' },
              ].map(f => (
                <div key={f.label} className="bg-studio-surface border border-studio-border rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1.5">{f.icon}</div>
                  <div className="text-sm font-semibold text-white">{f.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <ResultPanel concept={concept} onReset={handleReset} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-studio-border mt-16 py-6">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-xs text-slate-600">
          <span>TikTok 3D Studio — Powered by Claude AI</span>
          <span>claude-sonnet-4-6</span>
        </div>
      </footer>
    </div>
  )
}
