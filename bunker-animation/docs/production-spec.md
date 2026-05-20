# Bunker Transformation — Production Specification
**Format:** 9:16 vertical (TikTok) | **Duration:** 60 seconds | **Target:** 8K, 24fps

---

## Technical Specs

| Parameter | Value |
|-----------|-------|
| Resolution | 7680 × 4320 (8K) — downscale to 1080×1920 for delivery |
| Frame Rate | 24 fps (cinematic) |
| Aspect Ratio | 9:16 |
| Render Engine | Cycles (Blender) or Lumen (Unreal Engine 5) |
| Color Grade | Dark Teal + Orange complementary contrast |
| Delivery | H.264 / H.265, max bitrate for TikTok (288 MB cap) |

---

## Scene Overview

### Environment — Bunker Shell
- **Dimensions:** 12m × 8m × 3.2m interior (cinematic scale)
- **Walls:** Poured concrete with formwork tie-holes, exposed aggregate finish
- **Floor:** Rough concrete slab, drainage grate in center
- **Ceiling:** Exposed conduit, junction boxes, I-beam structure
- **Entry:** Blast door (Type B vault door, 60cm thick) — camera enters through this

### Materials Library

| Material | Base Color | Roughness | Notes |
|----------|------------|-----------|-------|
| Aged Concrete | #4A4A46 | 0.95 | Procedural cracks, staining |
| Brushed Steel | #8C9194 | 0.25 | Anisotropic reflections |
| Matte Black Panel | #1A1A1A | 0.6 | Soft sheen |
| Olive Drab | #6B7255 | 0.8 | Military accent |
| LED Strip Warm | #FFB347 | — | Emissive 8.0 strength |
| LED Strip Cool | #4FC3F7 | — | Emissive 10.0 strength |
| Hydroponic Green | #4CAF50 | 0.7 | Subsurface scattering |

---

## Lighting Plan

### Phase 1: Raw Bunker (0–10s)
- **Key:** Single practical red bulb, flickering (simulated via shader node time offset)
  - Color: #FF2200, Intensity: 80W, Spot angle: 110°
- **Fill:** Near-zero ambient — deep shadow everywhere
- **Accent:** Thin rim light through blast door crack (cool daylight bleed #E8F4FD)

### Phase 2: Transformation (10–25s)
- Smart panels emit blue UI glow (#1565C0, emissive strength ramps 0→6)
- LED strip lights animate ON progressively (bunk → kitchen → storage)
- Reduce flicker on practical; increase overall exposure +1.2 EV over 15s

### Phase 3: Full Reveal (25–40s)
- **Dual zone lighting:**
  - Cool zone (command center): #4FC3F7, 6500K
  - Warm zone (bunk / kitchen): #FFB347, 2800K
- Volumetric fog at 0.02 density (slight haze for depth)
- HDRI environment blocked — fully interior practical lights only

### Phase 4: Detail Shots (40–55s)
- Per-shot dedicated key light (softbox emulator, area light 0.5m²)
- Macro lens simulation: focal length 85mm, f/2.0, bokeh on BG

### Phase 5: Final Wide (55–60s)
- Full bunker lit, dramatic top-down motivated fill
- Lens flare on nearest LED strip
- Exposure pulls down slightly at text overlay moment

---

## Camera Work

### Shot 1 — Drone Fly-Through (0–10s)
```
Start: EXT, 2m outside blast door, camera height 1.4m
Move:  Dolly forward at 0.4m/s through door opening
End:   INT, 4m inside bunker, camera height 1.6m, slight tilt up
FOV:   85mm equivalent (tight for drama)
Easing: Ease-in + ease-out on dolly path (bezier)
```

### Shot 2 — Wide Observation (10–25s)
```
Position: Bunker center, 2.4m height
Move:     Slow push-in toward back wall (0.15m/s)
Rotation: Slight yaw oscillation ±3° (hand-held simulation)
FOV:      50mm equivalent
```

### Shot 3 — 360° Turntable (25–40s)
```
Pivot:    World origin, radius 3.5m, height 1.5m
Rotation: 360° over 15s (24 deg/sec)
Tilt:     -5° (looking slightly downward to include floor detail)
FOV:      35mm equivalent (wide to capture space)
Motion:   Constant angular velocity, no ease
```

### Shot 4a — Control Panel Macro (40–45s)
```
Position: 0.4m from panel surface
FOV:      100mm equivalent
DOF:      f/1.8 — sharp on screen text, bokeh on room
Move:     Static with micro push-in 2cm over 5s
```

### Shot 4b — Bathroom Pod Macro (45–50s)
```
Position: Through bathroom pod door, 0.6m from fixtures
FOV:      85mm equivalent
Move:     Slow lateral slide 0.3m left to right
```

### Shot 4c — Biometric Door Macro (50–55s)
```
Position: 0.3m from door panel, eye height
FOV:      100mm equivalent
Move:     Rack focus: door handle → fingerprint scanner → keypad
```

### Shot 5 — Cinematic Pull-Back (55–60s)
```
Start:   4m inside bunker, 1.5m height
Move:    Crane-style: forward+up simultaneously
         → Camera rises to 3m while pulling back to 8m
End:     Wide bird's eye, full bunker in frame
FOV:     28mm equivalent
Text:    "Would you live here?" — fade in at 57s, opacity 0→1 over 2s
         Font: Helvetica Neue Light, white, 72pt equivalent, center-bottom
```

---

## Object Animation Timeline

| Object | Appears | Animation | Duration |
|--------|---------|-----------|----------|
| Smart wall panels (×4) | 10s | Scale Z: 0→1 + emissive ramp | 3s each, staggered 0.5s |
| Bunk bed frame | 13s | Unfold from wall (hinge constraint) | 4s |
| Bunk LED strips | 17s | Emissive 0→8 | 1s |
| Kitchen unit | 16s | Slide X from wall (+2.5m travel) | 3s |
| Storage wall | 19s | Rack slots populate top-to-bottom | 3s |
| Command desk | 22s | Drop from ceiling mount + screens power on | 2s |
| Screens (×3) | 24s | Emissive boot sequence texture | 1.5s |
| Hydroponic wall | 23s | Subsurface scatter ramp + grow lights on | 2s |
| Water filtration | 25s | Already placed, indicator light blinks on | 0.5s |
| Ventilation grilles | 25s | Fan rotation starts (constant after) | — |
| Bathroom pod | 25s | Pre-assembled, reveal via camera only | — |

---

## Color Grade — DaVinci Resolve Node Tree

```
[Input] → [Normalize Exposure]
         → [Lift/Gamma/Gain: Teal shadows, neutral mids, orange highlights]
         → [Curves: Crush blacks to 5%, pull whites to 95%]
         → [Hue vs Sat: Boost teal +40%, orange +35%, desaturate greens slightly]
         → [Vignette: 40% strength, soft falloff radius 0.7]
         → [Film Grain: 4K grain plate overlay, 15% opacity]
         → [Sharpen: 0.3 radius, edge-only]
         → [Output: Rec.709 for TikTok delivery]
```

**LUT:** Start from Kodak 2383 print emulation, push teal-orange manually.

---

## Audio Suggestions (not included in render)

| Timecode | Sound |
|----------|-------|
| 0–10s | Low industrial drone, distant metal creaks |
| 10–25s | Rising electronic hum, mechanical assembly SFX |
| 25–40s | Ambient electronic tone, subtle bass pulse |
| 40–55s | UI interaction beeps, water flow, ventilation hiss |
| 55–60s | Cinematic swell, short stinger at text reveal |

---

## Render Farm Estimates (Cycles, 4096 samples)

| Sequence | Frames | Est. Time/Frame (RTX 4090) | Total |
|----------|--------|---------------------------|-------|
| Reveal (0–10s) | 240 | ~4 min | ~16h |
| Transformation (10–25s) | 360 | ~6 min | ~36h |
| Full Reveal (25–40s) | 360 | ~7 min | ~42h |
| Detail Shots (40–55s) | 360 | ~5 min | ~30h |
| Final Wide (55–60s) | 120 | ~7 min | ~14h |
| **Total** | **1440** | | **~138h** |

*Use Blender's denoiser (OptiX) + 512 samples for preview renders (~1/8 time).*
