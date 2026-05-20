# Bunker Animation — Shot List
**Duration:** 60s | **Format:** 9:16 | **Framerate:** 24fps

---

| # | Timecode | Duration | Shot Type | Camera | Focal Length | Key Action | Lighting State |
|---|----------|----------|-----------|--------|-------------|------------|----------------|
| 1 | 00:00–00:10 | 10s | Drone fly-through | Dolly in | 35mm | Enter blast door, first look at raw bunker | Red practical, flicker |
| 2 | 00:10–00:25 | 15s | Wide push-in | Slow push | 50mm | Smart panels appear; furniture assembles | Panels + LED ramp in |
| 3 | 00:25–00:40 | 15s | 360° turntable | Orbital | 28mm | Full reveal of completed bunker | Dual-zone LED full |
| 4a | 00:40–00:45 | 5s | Macro/ECU | Static + micro push | 85mm | Control panel UI detail | Soft box key |
| 4b | 00:45–00:50 | 5s | Macro lateral | Slide R→L | 85mm | Compact bathroom pod | Soft box key |
| 4c | 00:50–00:55 | 5s | Macro rack focus | Static | 100mm | Biometric door panel | Soft box key |
| 5 | 00:55–01:00 | 5s | Crane pull-back | Rise + pull back | 28mm | Full hero shot; text overlay | Hero key full |

---

## Props Checklist

### Structural
- [ ] Blast door (vault-style, brushed steel, hinge detail)
- [ ] Concrete walls — procedural cracks and staining
- [ ] Exposed ceiling conduit + junction boxes
- [ ] Drainage grate (floor center)
- [ ] I-beam structural supports (ceiling)

### Smart Home / Tech
- [ ] 4× wall-mounted smart panels (glowing UI screens)
- [ ] Command center desk + 3 monitors
- [ ] Biometric fingerprint + keypad door lock
- [ ] Ventilation grille with visible fan blades
- [ ] Water filtration unit with status LEDs

### Furniture / Living
- [ ] Military bunk beds (2-level, fold-out)
- [ ] LED strips under bunk shelves
- [ ] Compact kitchen counter + cabinet + sink
- [ ] Tactical storage wall (shelves + gear hooks)
- [ ] Bathroom pod (toilet, shower, sink)

### Nature / Wellness
- [ ] Hydroponic plant wall (3×5 pod grid, grow lights)

### Lighting Fixtures
- [ ] Red emergency practical bulb (hanging, cage mount)
- [ ] Ceiling LED strips × 4 (cool blue zones)
- [ ] Under-bunk LED strips (warm amber)
- [ ] Grow lights (green-tinted cool strips)
- [ ] Monitor screen glow (blue fill)

---

## VFX Notes

### Flickering Red Light
Implement via shader node: `Object Info → Random` → `Math (Multiply)` → `Emission Strength`
Driver expression: `sin(frame * 3.7) * 0.3 + 0.7 + noise(frame)` — bake to keyframes.

### Smart Panel UI Boot Sequence
Use a looping video texture (UV-mapped to panel face):
- Boot screen: black → progress bar → dashboard grid
- Resolution: 512×1024px for each panel
- Frame rate: 24fps texture sequence

### Furniture Assembly
All assembly animations use Scale constraints from 0 to full over 2–4 seconds.
Use Blender's Graph Editor to add ease-in/out (bezier) on all scale keyframes.
Apply `Subdivision Surface` (level 2) to all furniture for smooth silhouettes.

### Hydroponic Wall Grow Effect
Animate subsurface scatter strength: `0.0 → 0.4` over 2 seconds.
Simultaneously ramp grow light emissive: `0 → 8`.
Add particle system for small floating dust motes (50 particles, slow rise).

### 360° Turntable Smoothness
Lock turntable keyframes to **constant velocity** (no easing) for a professional look.
Apply gentle camera shake: Noise modifier on location X/Y, amplitude 0.005, frequency 0.8Hz.

---

## Export Settings (Final Delivery)

| Parameter | Value |
|-----------|-------|
| Codec | H.265 (HEVC) |
| Bitrate | 50 Mbps CBR |
| Color Space | Rec.709 |
| Audio | AAC 320kbps (add in post) |
| File Name | `bunker_transformation_final_9x16.mp4` |
| Max File Size | 287 MB (TikTok limit) |

---

## TikTok Upload Checklist

- [ ] Duration confirmed ≤ 60s
- [ ] Aspect ratio 9:16 verified (no black bars)
- [ ] File size < 287 MB
- [ ] H.264 or H.265 codec
- [ ] Sound added (royalty-free track)
- [ ] Caption: "Would you live underground? 🏠⚡ #bunker #smarthome #architecture #futuristic"
- [ ] Cover frame: Shot 3 (360° reveal) at 30s mark — most visually striking
