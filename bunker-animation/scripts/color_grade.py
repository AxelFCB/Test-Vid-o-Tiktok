"""
Color Grade — DaVinci Resolve Python API Script
Apply the dark teal + orange cinematic look to the rendered footage.

Usage:
  Open DaVinci Resolve → Workspace → Console → paste this script
  (Requires Resolve Studio with scripting enabled)
"""

import DaVinciResolveScript as dvr_script

resolve = dvr_script.scriptapp("Resolve")
project_manager = resolve.GetProjectManager()
project = project_manager.GetCurrentProject()
media_pool = project.GetMediaPool()
timeline = project.GetCurrentTimeline()
color_page = resolve.OpenPage("color")

# Get first clip on track 1
clip = timeline.GetItemListInTrack("video", 1)[0]
clip.SetCurrentVersionName("Bunker_Grade")

# -------------------------------------------------------
# Node 1: Exposure Normalize
# -------------------------------------------------------
clip.AddNode("serial")
clip.SetNodeLabel(1, "Normalize")
# Lift, Gamma, Gain via offset/contrast
clip.SetFormat("Log")

# -------------------------------------------------------
# Node 2: Teal-Orange Grade (Lift/Gamma/Gain)
# -------------------------------------------------------
clip.AddNode("serial")
clip.SetNodeLabel(2, "TealOrange")
# Shadows toward teal
clip.SetLift({"r": -0.04, "g": 0.0, "b": 0.06, "master": 0.0})
# Highlights toward orange
clip.SetGain({"r": 1.08, "g": 1.02, "b": 0.88, "master": 1.0})
# Mids neutral
clip.SetGamma({"r": 1.0, "g": 1.0, "b": 1.0, "master": 0.98})

# -------------------------------------------------------
# Node 3: Curves — crush blacks, clip whites
# -------------------------------------------------------
clip.AddNode("serial")
clip.SetNodeLabel(3, "Curves")
# Black point: raise input black to 5% to add lift
# White point: pull ceiling to 95%
# (Curve points set via SetCustomCurve — simplified representation)
clip.SetCustomCurve("lum", [
    {"x": 0.0,  "y": 0.05},   # crush blacks
    {"x": 0.5,  "y": 0.48},   # mid contrast
    {"x": 1.0,  "y": 0.95},   # clip highlights
])

# -------------------------------------------------------
# Node 4: Hue vs Saturation
# -------------------------------------------------------
clip.AddNode("serial")
clip.SetNodeLabel(4, "HueSat")
# Boost cyan/teal and orange, desaturate greens slightly
clip.SetHueSatCurve("hue_vs_sat", [
    {"hue": 180, "sat": 1.4},  # teal/cyan +40%
    {"hue": 30,  "sat": 1.35}, # orange +35%
    {"hue": 120, "sat": 0.85}, # green -15%
])

# -------------------------------------------------------
# Node 5: Vignette (Power Window)
# -------------------------------------------------------
clip.AddNode("serial")
clip.SetNodeLabel(5, "Vignette")
# Circular power window, inverted, soften exposure
window = clip.AddPowerWindow("circle")
window.SetSoftness(0.7)
clip.SetGain({"master": 0.6})  # darken outside window

# -------------------------------------------------------
# Node 6: Film Grain (Fusion composition node)
# -------------------------------------------------------
clip.AddNode("serial")
clip.SetNodeLabel(6, "FilmGrain")
# Grain overlay at 15% blend — attach FilmGrain OFX plugin
clip.AddPlugin("ResolveFX Film Grain")
clip.SetPluginParam("Film Grain", "Grain Strength", 0.15)
clip.SetPluginParam("Film Grain", "Grain Size", 2.5)

print("Color grade applied. Review in Color page before render.")
