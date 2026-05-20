const SYSTEM_PROMPT = `Tu es un expert en création de contenu 3D pour TikTok et en direction artistique de vidéos virales.
Tu génères des concepts de vidéos 3D ultra-détaillés, prêts à être produits avec des outils comme Runway ML et Kling AI.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans commentaires.`

export async function generateConcept({ niche, theme, ambiance, apiKey }) {
  const userPrompt = `Génère un concept complet de vidéo 3D TikTok avec les paramètres suivants:
- Niche: ${niche}
- Thème/Sujet: ${theme}
- Ambiance: ${ambiance}

Retourne un JSON avec exactement cette structure (tous les champs sont obligatoires):
{
  "title": "Titre accrocheur de la vidéo",
  "hook": "Phrase d'accroche TikTok (3-5 mots percutants)",
  "script": "Script narratif complet pour un voiceover de 60 secondes (environ 150 mots en français)",
  "scenes": [
    {
      "id": 1,
      "duration": "0-10s",
      "title": "Titre de la scène",
      "visual_description": "Description visuelle 3D ultra-détaillée : géométries, matériaux, éclairages, atmosphère",
      "runway_prompt": "Prompt optimisé en anglais pour Runway ML / Kling AI (max 200 mots)",
      "camera_movement": "Mouvement de caméra précis (ex: Slow dolly forward, 45° orbit right, Dutch tilt pan)",
      "sound_ambiance": "Description de l'ambiance sonore et musicale pour cette scène"
    }
  ],
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "production_tips": "Conseil de production rapide"
}

La liste scenes doit contenir EXACTEMENT 6 scènes numérotées de 1 à 6.
Les hashtags doivent être 15 hashtags TikTok optimisés (sans le #, en minuscules).`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userPrompt }
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text?.trim() || ''

  // Strip potential markdown fences
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

  try {
    return JSON.parse(clean)
  } catch {
    throw new Error('La réponse de l\'IA n\'est pas un JSON valide. Réessayez.')
  }
}
