import Component from "../Component";
import Vec2 from "../Math/Vec2";

export default class CollsisionTarget implements Component {
  static readonly NAME: string = 'CollsisionTarget';
  readonly name: string = CollsisionTarget.NAME;

  /** Makes a target that will fire a `CollsisionTargetHit` event when a `KineticBody` collides with the target. 
   * The cooldown, in frames, is from when the next collision can be detected. Because this sends a signal, and 
   * the signal takes a frame to process, a cooldown helps de-bounce collision detection.
  */
  constructor(public type: string, public size: Vec2, public cooldown: number = 2) { }

  ticks: number = 0;

}
