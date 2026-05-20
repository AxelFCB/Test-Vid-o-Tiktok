import { useState } from 'react'

const SCENE_COLORS = [
  'from-violet-600 to-purple-700',
  'from-cyan-500 to-blue-600',
  'from-pink-500 to-rose-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-indigo-500 to-violet-600',
]

function CopyButton({ text, label = 'Copier' }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-emerald-400">Copié !</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  )
}

export default function SceneCard({ scene, index }) {
  const [expanded, setExpanded] = useState(true)
  const colorClass = SCENE_COLORS[(index) % SCENE_COLORS.length]

  return (
    <div className="card animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center font-bold text-white text-sm shadow-lg`}>
            {scene.id}
          </div>
          <div>
            <h3 className="font-semibold text-white">{scene.title}</h3>
            <span className="text-xs text-slate-500 font-mono">{scene.duration}</span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <svg className={`w-5 h-5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Visual description */}
          <div className="bg-studio-surface rounded-xl p-4 border border-studio-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.867V15.5a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
                Description visuelle 3D
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{scene.visual_description}</p>
          </div>

          {/* Runway / Kling Prompt */}
          <div className="bg-studio-bg rounded-xl p-4 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Prompt Runway ML / Kling
              </span>
              <CopyButton text={scene.runway_prompt} label="Copier le prompt" />
            </div>
            <p className="text-sm text-cyan-100/80 leading-relaxed font-mono">{scene.runway_prompt}</p>
          </div>

          {/* Camera & Sound row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-studio-surface rounded-xl p-3.5 border border-studio-border">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Caméra
              </span>
              <p className="text-sm text-slate-300">{scene.camera_movement}</p>
            </div>

            <div className="bg-studio-surface rounded-xl p-3.5 border border-studio-border">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                Son & Ambiance
              </span>
              <p className="text-sm text-slate-300">{scene.sound_ambiance}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
