import Vec2 from "../Math/Vec2";
import Component from "./Component";

export default class Velocity implements Component {
  static readonly NAME: string = 'Velocity';
  readonly name: string = Velocity.NAME;

  /** Represents an entity's velocity in 2D space */
  constructor(public velocity: Vec2) { }
}