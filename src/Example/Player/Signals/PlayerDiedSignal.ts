import Vec2 from "../../../2B2D/Math/Vec2";
import Signal from "../../../2B2D/Signal";

export interface PlayerDiedSignal extends Signal {
  name: 'PlayerDied',
  position: Vec2
}

export default function PlayerDied(position: Vec2, sender?: string): PlayerDiedSignal {
  return { name: 'PlayerDied', position, sender };
}
