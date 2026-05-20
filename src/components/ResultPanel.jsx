import { useState, useRef } from 'react'
import SceneCard from './SceneCard'

function CopyAllButton({ concept }) {
  const [copied, setCopied] = useState(false)

  function buildText() {
    const lines = [
      `═══════════════════════════════════════`,
      `TIKTOK 3D STUDIO — CONCEPT GÉNÉRÉ`,
      `═══════════════════════════════════════`,
      ``,
      `TITRE: ${concept.title}`,
      `HOOK: ${concept.hook}`,
      ``,
      `SCRIPT (VOICEOVER 60s)`,
      `─────────────────────`,
      concept.script,
      ``,
    ]

    concept.scenes.forEach(s => {
      lines.push(`SCÈNE ${s.id} [${s.duration}] — ${s.title}`)
      lines.push(`─────────────────────`)
      lines.push(`Description 3D: ${s.visual_description}`)
      lines.push(``)
      lines.push(`PROMPT RUNWAY/KLING:`)
      lines.push(s.runway_prompt)
      lines.push(``)
      lines.push(`Caméra: ${s.camera_movement}`)
      lines.push(`Son: ${s.sound_ambiance}`)
      lines.push(``)
    })

    lines.push(`HASHTAGS`)
    lines.push(`─────────`)
    lines.push(concept.hashtags.map(h => `#${h}`).join(' '))
    lines.push(``)
    lines.push(`TIPS DE PRODUCTION: ${concept.production_tips}`)

    return lines.join('\n')
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(buildText())
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <button onClick={handleCopy} className="btn-secondary flex items-center gap-2">
      {copied ? (
        <>
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-emerald-400">Copié !</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copier tous les prompts
        </>
      )}
    </button>
  )
}

function DownloadPDFButton({ concept, contentRef }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
      const margin = 15
      const pageWidth = doc.internal.pageSize.getWidth()
      const maxWidth = pageWidth - margin * 2
      let y = margin

      function checkPageBreak(needed = 10) {
        if (y + needed > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage()
          y = margin
        }
      }

      function addText(text, size, color, bold = false, lineHeight = 6) {
        doc.setFontSize(size)
        doc.setTextColor(...color)
        doc.setFont('helvetica', bold ? 'bold' : 'normal')
        const lines = doc.splitTextToSize(String(text), maxWidth)
        checkPageBreak(lines.length * lineHeight + 4)
        doc.text(lines, margin, y)
        y += lines.length * lineHeight
      }

      function addSpacer(h = 4) { y += h }

      // Header
      doc.setFillColor(10, 10, 15)
      doc.rect(0, 0, pageWidth, 28, 'F')
      doc.setFontSize(18)
      doc.setTextColor(167, 139, 250)
      doc.setFont('helvetica', 'bold')
      doc.text('TikTok 3D Studio', margin, 12)
      doc.setFontSize(9)
      doc.setTextColor(148, 163, 184)
      doc.text('Concept généré par IA', margin, 20)
      y = 36

      // Title & hook
      addText(concept.title, 16, [255, 255, 255], true)
      addSpacer(2)
      addText(`Hook: ${concept.hook}`, 11, [103, 232, 249], false)
      addSpacer(6)

      // Script
      doc.setDrawColor(42, 42, 62)
      doc.line(margin, y, pageWidth - margin, y)
      addSpacer(4)
      addText('SCRIPT VOICEOVER (60s)', 10, [124, 58, 237], true, 5)
      addSpacer(3)
      addText(concept.script, 9, [203, 213, 225], false, 5)
      addSpacer(8)

      // Scenes
      concept.scenes.forEach(s => {
        checkPageBreak(50)
        doc.setFillColor(26, 26, 38)
        doc.roundedRect(margin - 2, y - 2, maxWidth + 4, 8, 2, 2, 'F')
        addText(`SCÈNE ${s.id}  [${s.duration}]  ${s.title}`, 10, [167, 139, 250], true, 6)
        addSpacer(2)
        addText('Description 3D:', 8, [100, 116, 139], true, 5)
        addText(s.visual_description, 8, [203, 213, 225], false, 5)
        addSpacer(2)
        addText('Prompt Runway / Kling:', 8, [6, 182, 212], true, 5)
        addText(s.runway_prompt, 8, [103, 232, 249], false, 5)
        addSpacer(2)
        addText(`Caméra: ${s.camera_movement}`, 8, [148, 163, 184], false, 5)
        addText(`Son: ${s.sound_ambiance}`, 8, [148, 163, 184], false, 5)
        addSpacer(8)
      })

      // Hashtags
      addText('HASHTAGS', 10, [124, 58, 237], true, 5)
      addSpacer(2)
      addText(concept.hashtags.map(h => `#${h}`).join('  '), 9, [103, 232, 249], false, 5)
      addSpacer(5)
      addText(`Tips: ${concept.production_tips}`, 9, [148, 163, 184], false, 5)

      doc.save(`tiktok-3d-concept-${Date.now()}.pdf`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleDownload} disabled={loading} className="btn-secondary flex items-center gap-2">
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Export...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Télécharger PDF
        </>
      )}
    </button>
  )
}

export default function ResultPanel({ concept, onReset }) {
  const contentRef = useRef(null)

  return (
    <div className="animate-fade-in space-y-6" ref={contentRef}>
      {/* Header banner */}
      <div className="gradient-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
                Concept généré
              </span>
            </div>
            <h2 className="text-xl font-bold text-white leading-snug">{concept.title}</h2>
            <p className="mt-1 text-sm text-cyan-300 font-medium">"{concept.hook}"</p>
          </div>
          <button
            onClick={onReset}
            className="shrink-0 flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-studio-border hover:border-slate-500 rounded-xl px-4 py-2 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Nouveau concept
          </button>
        </div>

        {/* Export buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-studio-border">
          <CopyAllButton concept={concept} />
          <DownloadPDFButton concept={concept} contentRef={contentRef} />
        </div>
      </div>

      {/* Script */}
      <div className="card">
        <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Script narratif — Voiceover 60s
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{concept.script}</p>
      </div>

      {/* Scenes */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
          6 Scènes × 10 secondes
        </h3>
        <div className="space-y-3">
          {concept.scenes.map((scene, i) => (
            <SceneCard key={scene.id} scene={scene} index={i} />
          ))}
        </div>
      </div>

      {/* Hashtags */}
      <div className="card">
        <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          Hashtags TikTok optimisés
        </h3>
        <div className="flex flex-wrap gap-2">
          {concept.hashtags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-full bg-studio-surface border border-studio-border text-sm text-slate-300 hover:border-violet-500/50 hover:text-violet-300 transition-colors cursor-default"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Production tip */}
      {concept.production_tips && (
        <div className="flex gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div>
            <p className="text-xs font-semibold text-amber-400 mb-0.5">Conseil de production</p>
            <p className="text-sm text-slate-300">{concept.production_tips}</p>
          </div>
        </div>
      )}
    </div>
  )
}
