import Vec2 from "../Math/Vec2";
import Component from "./Component";

export default class CollisionTarget implements Component {
  static readonly NAME: string = 'CollisionTarget';
  readonly name: string = CollisionTarget.NAME;

  /** Makes a target that will fire a `CollisionTargetHit` event when a `KineticBody` collides with the target. 
   * The cooldown, in frames, is from when the next collision can be detected. Because this sends a signal, and 
   * the signal takes a frame to process, a cooldown helps de-bounce collision detection.
  */
  constructor(public target: string, public size: Vec2, public cooldown: number = 2) { }

  ticks: number = 0;

}