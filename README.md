# Bunker Transformation — TikTok Animation

Cinematic 3D animation project: dark underground bunker transforms into a fully-equipped smart home.
**Format:** 9:16 vertical | **Duration:** 60 seconds | **Style:** Photorealistic, teal-orange grade

---

## Project Structure

```
bunker-animation/
├── docs/
│   ├── production-spec.md      ← Full technical spec (render, lighting, camera, materials)
│   ├── shot-list.md            ← Shot-by-shot breakdown + props checklist + export guide
│   └── ai-image-prompts.md     ← Midjourney/Sora prompts for reference frames & textures
└── scripts/
    ├── bunker_scene_setup.py   ← Blender 4.x Python script — builds entire scene + keyframes
    └── color_grade.py          ← DaVinci Resolve Python script — teal-orange grade nodes
```

---

## Quick Start

### Option A — Blender (full 3D)
1. Open Blender 4.x → Scripting tab
2. Load `scripts/bunker_scene_setup.py`
3. Click **Run Script** — scene, camera, lights, and animation keyframes are generated
4. Render: `Render → Render Animation` (or `Ctrl+F12`)
5. Import rendered frames into DaVinci Resolve, run `scripts/color_grade.py`

### Option B — AI Video Generation
1. Use the prompts in `docs/ai-image-prompts.md` with Sora, Kling, or RunwayML
2. Generate each shot segment separately using the per-shot prompts
3. Edit together in DaVinci Resolve, apply color grade

---

## Animation Sequence

| Time | Scene |
|------|-------|
| 0–10s | Drone flies through blast door into raw concrete bunker |
| 10–25s | Smart panels, bunk beds, kitchen, and storage self-assemble |
| 25–40s | 360° camera orbit reveals the fully transformed interior |
| 40–55s | Close-up detail shots: control panel, bathroom pod, biometric door |
| 55–60s | Dramatic crane pull-back; "Would you live here?" text fade |

---

## Technical Specs
- **Render engine:** Blender Cycles (GPU) or Unreal Engine 5 Lumen
- **Resolution:** 8K source → 1080×1920 delivery
- **Framerate:** 24fps cinematic
- **Color grade:** Dark teal shadows + orange highlights (Kodak 2383 base)
- **Estimated render time:** ~138h on RTX 4090 (full quality)
