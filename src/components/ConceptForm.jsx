import { useState } from 'react'

const NICHES = [
  { value: 'gaming', label: '🎮 Gaming', description: 'Univers de jeux vidéo' },
  { value: 'luxe', label: '💎 Luxe', description: 'Lifestyle premium' },
  { value: 'nature', label: '🌿 Nature', description: 'Environnements naturels' },
  { value: 'tech', label: '⚡ Tech', description: 'Innovation & futur' },
  { value: 'lifestyle', label: '✨ Lifestyle', description: 'Mode de vie' },
]

const AMBIANCES = [
  { value: 'épique', label: 'Épique', color: 'from-orange-500 to-red-600' },
  { value: 'relaxant', label: 'Relaxant', color: 'from-teal-500 to-cyan-600' },
  { value: 'mystérieux', label: 'Mystérieux', color: 'from-purple-600 to-violet-700' },
  { value: 'énergique', label: 'Énergique', color: 'from-yellow-400 to-orange-500' },
]

export default function ConceptForm({ onGenerate, isLoading }) {
  const [niche, setNiche] = useState('')
  const [theme, setTheme] = useState('')
  const [ambiance, setAmbiance] = useState('')
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_ANTHROPIC_API_KEY || '')
  const [showApiKey, setShowApiKey] = useState(false)

  const canSubmit = niche && theme.trim() && ambiance && apiKey.trim() && !isLoading

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    onGenerate({ niche, theme: theme.trim(), ambiance, apiKey: apiKey.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* API Key */}
      <div className="gradient-border rounded-2xl p-5">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Clé API Anthropic
        </label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="input-field pr-12 font-mono text-sm"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showApiKey ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {!apiKey && (
          <p className="mt-2 text-xs text-amber-400/80">
            Obtenez votre clé sur console.anthropic.com
          </p>
        )}
      </div>

      {/* Niche */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Niche
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {NICHES.map(n => (
            <button
              key={n.value}
              type="button"
              onClick={() => setNiche(n.value)}
              className={`px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                niche === n.value
                  ? 'border-violet-500 bg-violet-500/10 text-white glow-violet'
                  : 'border-studio-border bg-studio-surface text-slate-400 hover:border-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="font-medium text-sm">{n.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{n.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Thème / Sujet de la vidéo
        </label>
        <textarea
          value={theme}
          onChange={e => setTheme(e.target.value)}
          placeholder="Ex: Un château flottant dans les nuages au coucher du soleil, avec des dragons cristallins..."
          rows={3}
          className="input-field resize-none"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Soyez précis — plus c'est détaillé, meilleur est le concept généré.
        </p>
      </div>

      {/* Ambiance */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Ambiance
        </label>
        <div className="grid grid-cols-2 gap-2">
          {AMBIANCES.map(a => (
            <button
              key={a.value}
              type="button"
              onClick={() => setAmbiance(a.value)}
              className={`relative px-4 py-3 rounded-xl border font-semibold transition-all duration-200 overflow-hidden ${
                ambiance === a.value
                  ? 'border-transparent text-white'
                  : 'border-studio-border bg-studio-surface text-slate-400 hover:border-slate-500 hover:text-slate-300'
              }`}
            >
              {ambiance === a.value && (
                <span className={`absolute inset-0 bg-gradient-to-r ${a.color} opacity-80`} />
              )}
              <span className="relative">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="btn-primary w-full flex items-center justify-center gap-3 text-base"
      >
        {isLoading ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Génération en cours
            <span className="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Générer le concept
          </>
        )}
      </button>
    </form>
  )
}
