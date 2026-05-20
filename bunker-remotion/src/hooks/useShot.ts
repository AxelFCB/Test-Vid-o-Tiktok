import { useCurrentFrame } from 'remotion';
import { SHOTS } from '../constants';

export type ShotName =
  | 'reveal'
  | 'transform'
  | 'orbit'
  | 'detail_panel'
  | 'detail_bath'
  | 'detail_door'
  | 'final';

export function useShot(): { shot: ShotName; localProgress: number; frame: number } {
  const frame = useCurrentFrame();

  let shot: ShotName;
  let start: number;
  let end: number;

  if (frame < SHOTS.REVEAL_END) {
    shot = 'reveal'; start = SHOTS.REVEAL_START; end = SHOTS.REVEAL_END;
  } else if (frame < SHOTS.TRANSFORM_END) {
    shot = 'transform'; start = SHOTS.REVEAL_END; end = SHOTS.TRANSFORM_END;
  } else if (frame < SHOTS.ORBIT_END) {
    shot = 'orbit'; start = SHOTS.TRANSFORM_END; end = SHOTS.ORBIT_END;
  } else if (frame < SHOTS.DETAIL_PANEL_END) {
    shot = 'detail_panel'; start = SHOTS.ORBIT_END; end = SHOTS.DETAIL_PANEL_END;
  } else if (frame < SHOTS.DETAIL_BATH_END) {
    shot = 'detail_bath'; start = SHOTS.DETAIL_PANEL_END; end = SHOTS.DETAIL_BATH_END;
  } else if (frame < SHOTS.DETAIL_DOOR_END) {
    shot = 'detail_door'; start = SHOTS.DETAIL_BATH_END; end = SHOTS.DETAIL_DOOR_END;
  } else {
    shot = 'final'; start = SHOTS.DETAIL_DOOR_END; end = SHOTS.FINAL_END;
  }

  const localProgress = (frame - start) / (end - start);
  return { shot, localProgress: Math.min(1, Math.max(0, localProgress)), frame };
}
