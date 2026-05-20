export const FPS = 24;
export const DURATION_S = 60;
export const TOTAL_FRAMES = FPS * DURATION_S;

export const WIDTH = 1080;
export const HEIGHT = 1920;

// Shot boundaries (in frames)
export const SHOTS = {
  REVEAL_START: 0,
  REVEAL_END: 10 * FPS,          // 0–10s
  TRANSFORM_END: 25 * FPS,       // 10–25s
  ORBIT_END: 40 * FPS,           // 25–40s
  DETAIL_PANEL_END: 45 * FPS,    // 40–45s
  DETAIL_BATH_END: 50 * FPS,     // 45–50s
  DETAIL_DOOR_END: 55 * FPS,     // 50–55s
  FINAL_END: 60 * FPS,           // 55–60s
};

// Colors
export const COLORS = {
  concrete: '#4a4a46',
  steel: '#8c9194',
  black: '#1a1a1a',
  olive: '#6b7255',
  ledWarm: '#ffb347',
  ledCool: '#4fc3f7',
  panelBlue: '#1565c0',
  red: '#ff2200',
  hydro: '#4caf50',
};
