"""
Bunker Transformation — Blender Scene Setup Script
Run via: Blender Scripting tab, or blender --python bunker_scene_setup.py

Tested with Blender 4.x
"""

import bpy
import math
from mathutils import Vector, Euler

# ---------------------------------------------------------------------------
# Utilities
# ---------------------------------------------------------------------------

def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    for block in list(bpy.data.meshes) + list(bpy.data.materials) + list(bpy.data.lights):
        bpy.data.batch_remove([block])


def link(obj):
    bpy.context.collection.objects.link(obj)
    return obj


def new_material(name, base_color, roughness=0.8, metallic=0.0, emission=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*base_color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*emission[0], 1.0)
        bsdf.inputs["Emission Strength"].default_value = emission[1]
    return mat


def assign_material(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


def create_box(name, location, scale, mat=None):
    bpy.ops.mesh.primitive_cube_add(location=location, scale=scale)
    obj = bpy.context.active_object
    obj.name = name
    if mat:
        assign_material(obj, mat)
    return obj


def create_cylinder(name, location, radius, depth, rot=(0, 0, 0), mat=None):
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius, depth=depth,
        location=location,
        rotation=rot
    )
    obj = bpy.context.active_object
    obj.name = name
    if mat:
        assign_material(obj, mat)
    return obj


def add_area_light(name, location, rotation, energy, color, size=1.0):
    bpy.ops.object.light_add(type="AREA", location=location, rotation=rotation)
    light = bpy.context.active_object
    light.name = name
    light.data.energy = energy
    light.data.color = color
    light.data.size = size
    return light


def set_keyframe(obj, attr_path, frame, value):
    """Set a single keyframe; attr_path like 'location' or 'data.energy'."""
    parts = attr_path.split(".")
    target = obj
    for p in parts[:-1]:
        target = getattr(target, p)
    setattr(target, parts[-1], value)
    target.keyframe_insert(data_path=parts[-1], frame=frame)


# ---------------------------------------------------------------------------
# Scene & Render Settings
# ---------------------------------------------------------------------------

def configure_render():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "GPU"
    scene.cycles.samples = 512          # preview; bump to 4096 for final
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1080   # TikTok 9:16 (upscale from 8K in post)
    scene.render.resolution_y = 1920
    scene.render.fps = 24
    scene.frame_start = 1
    scene.frame_end = 1440              # 60s × 24fps
    scene.render.image_settings.file_format = "FFMPEG"
    scene.render.ffmpeg.format = "MPEG4"
    scene.render.ffmpeg.codec = "H264"
    scene.render.ffmpeg.constant_rate_factor = "PERC_LOSSLESS"
    scene.render.filepath = "//render/bunker_animation_"

    # World: pitch black
    world = bpy.data.worlds["World"]
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.0, 0.0, 0.0, 1.0)
    bg.inputs["Strength"].default_value = 0.0


# ---------------------------------------------------------------------------
# Materials
# ---------------------------------------------------------------------------

def build_materials():
    mats = {}
    mats["concrete"] = new_material("Concrete", (0.29, 0.29, 0.27), roughness=0.95)
    mats["steel"]    = new_material("BrushedSteel", (0.55, 0.57, 0.57),
                                    roughness=0.25, metallic=1.0)
    mats["black"]    = new_material("MatteBlack", (0.10, 0.10, 0.10), roughness=0.6)
    mats["olive"]    = new_material("Olive", (0.42, 0.45, 0.33), roughness=0.8)
    mats["led_warm"] = new_material("LED_Warm", (0.05, 0.05, 0.05), roughness=1.0,
                                    emission=((1.0, 0.70, 0.28), 0.0))   # animated 0→8
    mats["led_cool"] = new_material("LED_Cool", (0.05, 0.05, 0.05), roughness=1.0,
                                    emission=((0.31, 0.76, 0.97), 0.0))  # animated 0→10
    mats["panel_ui"] = new_material("PanelUI", (0.03, 0.08, 0.15), roughness=0.4,
                                    emission=((0.08, 0.40, 0.90), 0.0))  # animated 0→6
    mats["glass"]    = new_material("Glass", (0.9, 0.95, 1.0), roughness=0.05)
    mats["plant"]    = new_material("HydroPlant", (0.14, 0.44, 0.18), roughness=0.7)
    return mats


# ---------------------------------------------------------------------------
# Geometry — Bunker Shell
# ---------------------------------------------------------------------------

def build_bunker_shell(mats):
    """12m × 8m × 3.2m interior space."""
    W, D, H, T = 12.0, 8.0, 3.2, 0.3  # width, depth, height, wall thickness

    floor   = create_box("Floor",    (0, 0, -T/2),        (W/2, D/2, T/2),   mats["concrete"])
    ceiling = create_box("Ceiling",  (0, 0, H + T/2),     (W/2, D/2, T/2),   mats["concrete"])
    wall_l  = create_box("Wall_L",   (-W/2 - T/2, 0, H/2),(T/2, D/2, H/2),   mats["concrete"])
    wall_r  = create_box("Wall_R",   ( W/2 + T/2, 0, H/2),(T/2, D/2, H/2),   mats["concrete"])
    wall_b  = create_box("Wall_Back",(0, -D/2 - T/2, H/2),(W/2, T/2, H/2),   mats["concrete"])
    # Front wall has blast door opening — represented as thin panel above/beside door
    wall_f_t = create_box("Wall_Front_Top",  (0, D/2 + T/2, H - 0.5), (W/2, T/2, 0.5/2), mats["concrete"])

    return [floor, ceiling, wall_l, wall_r, wall_b, wall_f_t]


# ---------------------------------------------------------------------------
# Geometry — Blast Door
# ---------------------------------------------------------------------------

def build_blast_door(mats):
    door = create_box("BlastDoor", (0, 4.3, 1.1), (1.2, 0.3, 1.1), mats["steel"])
    # Hinges
    for z in [0.4, 1.8]:
        h = create_cylinder(f"Hinge_{z}", (1.1, 4.3, z), 0.06, 0.25,
                            rot=(math.pi/2, 0, 0), mat=mats["steel"])
    # Biometric lock panel
    lock = create_box("BiometricPanel", (0.9, 4.05, 1.1), (0.12, 0.02, 0.18), mats["black"])
    return [door, lock]


# ---------------------------------------------------------------------------
# Geometry — Modular Furniture
# ---------------------------------------------------------------------------

def build_bunk_bed(mats, location=(-4.0, -2.5, 0)):
    x, y, _ = location
    objs = []
    # Two bunk frames
    for level, z in enumerate([0.5, 1.6]):
        frame = create_box(f"Bunk_{level}", (x, y, z), (0.55, 1.05, 0.06), mats["steel"])
        mattress = create_box(f"Mattress_{level}", (x, y, z + 0.1), (0.5, 1.0, 0.08), mats["olive"])
        led = create_box(f"BunkLED_{level}", (x, y - 1.05, z + 0.12), (0.5, 0.02, 0.02), mats["led_warm"])
        objs += [frame, mattress, led]
    # Vertical supports
    for sx in [-0.5, 0.5]:
        post = create_box(f"BunkPost_{sx}", (x + sx, y, 1.1), (0.04, 0.04, 1.1), mats["steel"])
        objs.append(post)
    return objs


def build_kitchen_unit(mats, location=(3.5, -3.0, 0)):
    x, y, _ = location
    objs = []
    counter = create_box("KitchenCounter", (x, y, 0.45), (1.2, 0.4, 0.45), mats["black"])
    top     = create_box("KitchenTop",     (x, y, 0.93), (1.2, 0.4, 0.03), mats["steel"])
    cabinet = create_box("KitchenCabinet", (x, y, 1.55), (1.2, 0.35, 0.6), mats["black"])
    sink    = create_box("Sink",           (x - 0.4, y - 0.05, 0.94), (0.3, 0.25, 0.06), mats["steel"])
    objs += [counter, top, cabinet, sink]
    return objs


def build_storage_wall(mats, location=(5.5, 0.0, 0)):
    x, y, _ = location
    objs = []
    # Wall-mounted rack system
    backplate = create_box("StorageBack", (x, y, 1.6), (0.05, 2.0, 1.6), mats["black"])
    objs.append(backplate)
    # Shelf rows
    for row, z in enumerate([0.4, 0.85, 1.3, 1.75, 2.2, 2.65]):
        shelf = create_box(f"Shelf_{row}", (x + 0.15, y, z), (0.15, 1.95, 0.03), mats["steel"])
        objs.append(shelf)
    # Gear hooks (cylinders)
    for col in range(6):
        hook = create_cylinder(f"Hook_{col}", (x + 0.28, y - 1.5 + col * 0.6, 2.1),
                               0.025, 0.2, rot=(0, math.pi/2, 0), mat=mats["steel"])
        objs.append(hook)
    return objs


def build_command_desk(mats, location=(0, -3.2, 0)):
    x, y, _ = location
    objs = []
    desk    = create_box("CmdDesk",     (x, y, 0.38), (1.4, 0.55, 0.38), mats["black"])
    desktop = create_box("CmdDesktop",  (x, y, 0.77), (1.4, 0.55, 0.02), mats["steel"])
    # Three monitors
    for i, sx in enumerate([-0.9, 0.0, 0.9]):
        screen = create_box(f"Screen_{i}", (x + sx, y - 0.28, 1.3),
                            (0.38, 0.03, 0.24), mats["led_cool"])
        stand  = create_box(f"Stand_{i}",  (x + sx, y - 0.25, 0.95),
                            (0.03, 0.03, 0.18), mats["steel"])
        objs += [screen, stand]
    objs += [desk, desktop]
    return objs


def build_hydroponic_wall(mats, location=(-5.9, 0, 0)):
    x, y, _ = location
    objs = []
    frame = create_box("HydroFrame", (x, y, 1.6), (0.08, 2.5, 1.6), mats["steel"])
    objs.append(frame)
    # Plant modules (3 rows × 5 cols)
    for row in range(3):
        for col in range(5):
            pz = 0.6 + row * 0.8
            py = y - 2.0 + col * 1.0
            pod = create_box(f"PlantPod_{row}_{col}", (x + 0.18, py, pz),
                             (0.12, 0.38, 0.3), mats["plant"])
            grow_light = create_box(f"GrowLight_{row}_{col}", (x + 0.18, py, pz + 0.33),
                                    (0.1, 0.3, 0.02), mats["led_cool"])
            objs += [pod, grow_light]
    return objs


def build_water_filtration(mats, location=(4.5, -3.0, 0)):
    x, y, _ = location
    objs = []
    tank     = create_cylinder("FilterTank", (x, y, 0.7), 0.25, 1.4, mat=mats["steel"])
    pipe_v   = create_cylinder("FilterPipe_V", (x + 0.28, y, 0.9), 0.04, 1.8, mat=mats["steel"])
    pipe_h   = create_cylinder("FilterPipe_H", (x + 0.28, y, 1.8), 0.04, 0.6,
                               rot=(0, math.pi/2, 0), mat=mats["steel"])
    indicator = create_box("FilterLED", (x + 0.27, y - 0.08, 0.5), (0.03, 0.03, 0.03),
                           mats["led_cool"])
    objs += [tank, pipe_v, pipe_h, indicator]
    return objs


def build_smart_panels(mats):
    objs = []
    panel_positions = [
        ("Panel_L1", (-5.7, -1.0, 1.4)),
        ("Panel_L2", (-5.7,  1.0, 1.4)),
        ("Panel_R1", ( 5.7, -1.0, 1.4)),
        ("Panel_R2", ( 5.7,  1.0, 1.4)),
    ]
    for name, loc in panel_positions:
        panel = create_box(name, loc, (0.04, 0.45, 0.65), mats["panel_ui"])
        objs.append(panel)
    return objs


def build_bathroom_pod(mats, location=(2.5, 3.0, 0)):
    x, y, _ = location
    objs = []
    # Prefab pod shell
    walls = [
        create_box("Bath_Wall_L", (x - 0.85, y, 1.1), (0.04, 1.0, 1.1), mats["black"]),
        create_box("Bath_Wall_R", (x + 0.85, y, 1.1), (0.04, 1.0, 1.1), mats["black"]),
        create_box("Bath_Wall_B", (x, y - 1.0, 1.1), (0.85, 0.04, 1.1), mats["black"]),
        create_box("Bath_Ceiling",(x, y, 2.22),       (0.85, 1.0, 0.04), mats["black"]),
    ]
    toilet = create_box("Toilet", (x + 0.45, y - 0.65, 0.22), (0.22, 0.35, 0.22), mats["steel"])
    shower = create_box("Shower", (x - 0.4,  y - 0.5,  0.9),  (0.35, 0.4,  0.9),  mats["glass"])
    sink   = create_box("BathSink", (x + 0.45, y + 0.2, 0.45),(0.22, 0.22, 0.06), mats["steel"])
    objs += walls + [toilet, shower, sink]
    return objs


# ---------------------------------------------------------------------------
# Lighting
# ---------------------------------------------------------------------------

def build_lights():
    lights = []

    # Phase 1 — flickering red practical
    bpy.ops.object.light_add(type="POINT", location=(0, 0, 2.9))
    red = bpy.context.active_object
    red.name = "RedPractical"
    red.data.color = (1.0, 0.13, 0.0)
    red.data.energy = 80.0
    red.data.shadow_soft_size = 0.15
    lights.append(red)

    # Phase 2+ — cool blue LED strips (simulated as area lights along ceiling)
    for i, x in enumerate([-4, -1.5, 1.5, 4]):
        cool = add_area_light(f"CoolStrip_{i}", (x, 0, 3.1), (0, 0, 0),
                              energy=0.0, color=(0.31, 0.76, 0.97), size=0.1)
        cool.data.shape = "RECTANGLE"
        cool.data.size = 0.1
        cool.data.size_y = 1.5
        lights.append(cool)

    # Warm amber accent strips over bunk area
    for i, y in enumerate([-1.0, -2.5]):
        warm = add_area_light(f"WarmStrip_{i}", (-4.0, y, 2.5), (0, 0, 0),
                              energy=0.0, color=(1.0, 0.70, 0.28), size=0.08)
        warm.data.shape = "RECTANGLE"
        warm.data.size = 0.08
        warm.data.size_y = 2.5
        lights.append(warm)

    # Command center key (cool fill for screens)
    cmd_key = add_area_light("CmdKey", (0, -2.5, 2.8), (math.radians(-30), 0, 0),
                             energy=0.0, color=(0.5, 0.8, 1.0), size=1.2)
    lights.append(cmd_key)

    # Final wide — dramatic top key
    hero = add_area_light("HeroKey", (0, 0, 3.0), (0, 0, 0),
                          energy=0.0, color=(0.9, 0.95, 1.0), size=6.0)
    lights.append(hero)

    return lights


# ---------------------------------------------------------------------------
# Camera
# ---------------------------------------------------------------------------

def build_camera():
    bpy.ops.object.camera_add(location=(0, 5.5, 1.4), rotation=(math.radians(90), 0, math.radians(180)))
    cam = bpy.context.active_object
    cam.name = "MainCamera"
    cam.data.lens = 35          # wide — adjusted per shot via keyframes
    cam.data.dof.use_dof = True
    cam.data.dof.aperture_fstop = 5.6   # open up to 1.8 for macro shots
    bpy.context.scene.camera = cam
    return cam


# ---------------------------------------------------------------------------
# Camera Animation (keyframe-based)
# ---------------------------------------------------------------------------

def animate_camera(cam):
    fps = 24

    def f(sec):
        return int(sec * fps) + 1

    # --- SHOT 1: Drone fly-through (0–10s) ---
    cam.location = (0, 5.5, 1.4)
    cam.keyframe_insert(data_path="location", frame=f(0))
    cam.rotation_euler = Euler((math.radians(90), 0, math.radians(180)), "XYZ")
    cam.keyframe_insert(data_path="rotation_euler", frame=f(0))

    cam.location = (0, 1.8, 1.6)
    cam.keyframe_insert(data_path="location", frame=f(10))
    cam.rotation_euler = Euler((math.radians(87), 0, math.radians(180)), "XYZ")
    cam.keyframe_insert(data_path="rotation_euler", frame=f(10))

    # --- SHOT 2: Wide observation push-in (10–25s) ---
    cam.location = (0, 1.8, 2.4)
    cam.keyframe_insert(data_path="location", frame=f(10))
    cam.location = (0, -0.3, 2.4)
    cam.keyframe_insert(data_path="location", frame=f(25))

    # --- SHOT 3: 360° turntable (25–40s) ---
    radius = 3.5
    height = 1.5
    steps = 24  # one keyframe per second
    for i in range(steps + 1):
        t = 25 + i * (15 / steps)
        angle = math.radians(i * (360 / steps))
        cam.location = (math.sin(angle) * radius, math.cos(angle) * radius, height)
        cam.rotation_euler = Euler((math.radians(85), 0, angle + math.pi), "XYZ")
        cam.keyframe_insert(data_path="location", frame=f(t))
        cam.keyframe_insert(data_path="rotation_euler", frame=f(t))

    # --- SHOT 4a: Control panel macro (40–45s) ---
    cam.location = (-5.3, -1.0, 1.4)
    cam.rotation_euler = Euler((math.radians(90), 0, math.radians(90)), "XYZ")
    cam.keyframe_insert(data_path="location", frame=f(40))
    cam.keyframe_insert(data_path="rotation_euler", frame=f(40))
    cam.location = (-5.31, -1.0, 1.4)    # micro push
    cam.keyframe_insert(data_path="location", frame=f(45))

    # --- SHOT 4b: Bathroom pod macro (45–50s) ---
    cam.location = (2.5, 4.0, 1.1)
    cam.rotation_euler = Euler((math.radians(90), 0, math.radians(180)), "XYZ")
    cam.keyframe_insert(data_path="location", frame=f(45))
    cam.keyframe_insert(data_path="rotation_euler", frame=f(45))
    cam.location = (2.2, 4.0, 1.1)       # lateral slide
    cam.keyframe_insert(data_path="location", frame=f(50))

    # --- SHOT 4c: Biometric door macro (50–55s) ---
    cam.location = (0.6, 4.2, 1.1)
    cam.rotation_euler = Euler((math.radians(90), 0, math.radians(180)), "XYZ")
    cam.keyframe_insert(data_path="location", frame=f(50))
    cam.keyframe_insert(data_path="rotation_euler", frame=f(50))
    # DOF rack focus — drive focus distance via keyframes
    cam.data.dof.focus_distance = 0.35
    cam.data.keyframe_insert(data_path="dof.focus_distance", frame=f(50))
    cam.data.dof.focus_distance = 0.15
    cam.data.keyframe_insert(data_path="dof.focus_distance", frame=f(55))

    # --- SHOT 5: Cinematic pull-back (55–60s) ---
    cam.location = (0, -1.5, 1.5)
    cam.rotation_euler = Euler((math.radians(90), 0, math.radians(180)), "XYZ")
    cam.keyframe_insert(data_path="location", frame=f(55))
    cam.keyframe_insert(data_path="rotation_euler", frame=f(55))
    cam.location = (0, -5.0, 3.5)
    cam.rotation_euler = Euler((math.radians(70), 0, math.radians(180)), "XYZ")
    cam.keyframe_insert(data_path="location", frame=f(60))
    cam.keyframe_insert(data_path="rotation_euler", frame=f(60))


# ---------------------------------------------------------------------------
# Light Animation
# ---------------------------------------------------------------------------

def animate_lights(lights_by_name):
    fps = 24

    def f(sec):
        return int(sec * fps) + 1

    red = lights_by_name["RedPractical"]

    # Flicker simulation: rapid energy keyframes 0–10s
    import random
    random.seed(42)
    for frame in range(1, f(10), 2):
        red.data.energy = random.uniform(40, 90)
        red.data.keyframe_insert(data_path="energy", frame=frame)
    # Fade red out as panels appear
    red.data.energy = 70
    red.data.keyframe_insert(data_path="energy", frame=f(10))
    red.data.energy = 10
    red.data.keyframe_insert(data_path="energy", frame=f(25))
    red.data.energy = 0
    red.data.keyframe_insert(data_path="energy", frame=f(30))

    # Cool strips: ramp in staggered 10→25s
    for i, name in enumerate([f"CoolStrip_{j}" for j in range(4)]):
        if name not in lights_by_name:
            continue
        strip = lights_by_name[name]
        strip.data.energy = 0
        strip.data.keyframe_insert(data_path="energy", frame=f(12 + i * 1.5))
        strip.data.energy = 400
        strip.data.keyframe_insert(data_path="energy", frame=f(15 + i * 1.5))

    # Warm strips: on at bunk reveal
    for i, name in enumerate(["WarmStrip_0", "WarmStrip_1"]):
        if name not in lights_by_name:
            continue
        strip = lights_by_name[name]
        strip.data.energy = 0
        strip.data.keyframe_insert(data_path="energy", frame=f(17))
        strip.data.energy = 300
        strip.data.keyframe_insert(data_path="energy", frame=f(19))

    # Command key: on at 22s
    if "CmdKey" in lights_by_name:
        cmd = lights_by_name["CmdKey"]
        cmd.data.energy = 0
        cmd.data.keyframe_insert(data_path="energy", frame=f(22))
        cmd.data.energy = 600
        cmd.data.keyframe_insert(data_path="energy", frame=f(24))

    # Hero key: on for final shot
    if "HeroKey" in lights_by_name:
        hero = lights_by_name["HeroKey"]
        hero.data.energy = 0
        hero.data.keyframe_insert(data_path="energy", frame=f(54))
        hero.data.energy = 800
        hero.data.keyframe_insert(data_path="energy", frame=f(57))


# ---------------------------------------------------------------------------
# Furniture Assembly Animation
# ---------------------------------------------------------------------------

def animate_furniture_assembly(scene_objects):
    fps = 24

    def f(sec):
        return int(sec * fps) + 1

    # Smart panels: scale Z 0→1
    for i, name in enumerate(["Panel_L1", "Panel_L2", "Panel_R1", "Panel_R2"]):
        obj = scene_objects.get(name)
        if not obj:
            continue
        start = f(10 + i * 0.6)
        obj.scale = (1, 1, 0.001)
        obj.keyframe_insert(data_path="scale", frame=start)
        obj.scale = (1, 1, 1)
        obj.keyframe_insert(data_path="scale", frame=start + int(fps * 3))

    # Kitchen unit: slide in from +X wall
    kitchen_objs = [n for n in scene_objects if n.startswith("Kitchen") or n == "Sink"]
    for name in kitchen_objs:
        obj = scene_objects.get(name)
        if not obj:
            continue
        orig_x = obj.location.x
        obj.location.x = orig_x + 3.5    # start hidden in wall
        obj.keyframe_insert(data_path="location", frame=f(16))
        obj.location.x = orig_x
        obj.keyframe_insert(data_path="location", frame=f(19))

    # Bunk beds: unfold via scale Y then Z
    for name in [n for n in scene_objects if n.startswith("Bunk") or n.startswith("Mattress")]:
        obj = scene_objects.get(name)
        if not obj:
            continue
        obj.scale = (1, 0.001, 0.001)
        obj.keyframe_insert(data_path="scale", frame=f(13))
        obj.scale = (1, 1, 0.001)
        obj.keyframe_insert(data_path="scale", frame=f(15))
        obj.scale = (1, 1, 1)
        obj.keyframe_insert(data_path="scale", frame=f(17))

    # Command desk: drop from ceiling (location Z)
    desk_objs = [n for n in scene_objects if n.startswith("Cmd") or n.startswith("Screen") or n.startswith("Stand")]
    for name in desk_objs:
        obj = scene_objects.get(name)
        if not obj:
            continue
        orig_z = obj.location.z
        obj.location.z = orig_z + 4.0
        obj.keyframe_insert(data_path="location", frame=f(22))
        obj.location.z = orig_z
        obj.keyframe_insert(data_path="location", frame=f(24))


# ---------------------------------------------------------------------------
# Text Overlay (Compositor)
# ---------------------------------------------------------------------------

def add_text_overlay():
    """Add 'Would you live here?' via compositor image node."""
    scene = bpy.context.scene
    scene.use_nodes = True
    tree = scene.node_tree
    tree.nodes.clear()

    render_layers = tree.nodes.new("CompositorNodeRLayers")
    render_layers.location = (0, 0)

    composite = tree.nodes.new("CompositorNodeComposite")
    composite.location = (600, 0)

    # Alpha over node for text
    alpha_over = tree.nodes.new("CompositorNodeAlphaOver")
    alpha_over.location = (400, 0)

    # Text input (rendered as image — export separately from Blender text object)
    # For automation, use a pre-rendered PNG with alpha
    text_img_node = tree.nodes.new("CompositorNodeImage")
    text_img_node.location = (0, -200)
    text_img_node.label = "TEXT_OVERLAY — assign 'would_you_live_here.png'"

    # Fade in: keyframe alpha_over.inputs[0] (fac) 0→1 at 57s
    alpha_over.inputs[0].default_value = 0.0
    alpha_over.inputs[0].keyframe_insert(data_path="default_value",
                                          frame=int(57 * 24) + 1)
    alpha_over.inputs[0].default_value = 1.0
    alpha_over.inputs[0].keyframe_insert(data_path="default_value",
                                          frame=int(60 * 24) + 1)

    tree.links.new(render_layers.outputs["Image"], alpha_over.inputs[1])
    tree.links.new(text_img_node.outputs["Image"], alpha_over.inputs[2])
    tree.links.new(alpha_over.outputs["Image"], composite.inputs["Image"])


# ---------------------------------------------------------------------------
# Main Entry Point
# ---------------------------------------------------------------------------

def main():
    print("=== Bunker Animation: Scene Setup Starting ===")

    clear_scene()
    configure_render()

    mats = build_materials()

    # Build geometry
    build_bunker_shell(mats)
    build_blast_door(mats)
    build_smart_panels(mats)
    bunk_objs    = build_bunk_bed(mats)
    kitchen_objs = build_kitchen_unit(mats)
    storage_objs = build_storage_wall(mats)
    cmd_objs     = build_command_desk(mats)
    hydro_objs   = build_hydroponic_wall(mats)
    filter_objs  = build_water_filtration(mats)
    bath_objs    = build_bathroom_pod(mats)

    # Index scene objects for animation
    scene_objects = {obj.name: obj for obj in bpy.context.scene.objects}

    # Build and animate lights
    lights = build_lights()
    lights_by_name = {l.name: l for l in lights}
    animate_lights(lights_by_name)

    # Camera
    cam = build_camera()
    animate_camera(cam)

    # Furniture animation
    animate_furniture_assembly(scene_objects)

    # Compositor text overlay
    add_text_overlay()

    print("=== Scene setup complete. Ready to render. ===")
    print(f"Total frames: {bpy.context.scene.frame_end}")
    print(f"Resolution: {bpy.context.scene.render.resolution_x}x{bpy.context.scene.render.resolution_y}")
    print("Output: //render/bunker_animation_")


if __name__ == "__main__":
    main()
