import Component from "../Component";
import Vec2 from "../Math/Vec2";

export interface CollsisionTargetComponent extends Component {
  name: 'CollsisionTarget',
  type: string,
  size: Vec2,
  /** A cooldown, in frames, from when the next collision can be detected.
   * Because this sends a signal, and the signal takes a frame to process,
   * a cooldown helps de-bounce collision detection.
   */
  cooldown: number,
  ticks: number
}

/** Makes a target that will fire a `CollsisionTargetHit` event when a `KineticBody` collides with the target. */
export default function CollsisionTarget(type:string, size:Vec2, cooldown?:number) : CollsisionTargetComponent {
  return {
    name: 'CollsisionTarget',
    type,
    size,
    cooldown: cooldown === undefined ? 2 : cooldown,
    ticks: 0
  };
}
