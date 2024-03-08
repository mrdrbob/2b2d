import Component from "../Component";
import Vec2 from "../Math/Vec2";

export default class Velocity implements Component {
  static readonly NAME:string = 'Velocity';
  readonly name:string = Velocity.NAME;

  /** Reprsents an entity's velocity in 2D space */
  constructor(public velocity:Vec2 = Vec2.ZERO) {}
}
