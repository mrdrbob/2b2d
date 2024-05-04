import Vec2 from "../Math/Vec2";
import Component from "./Component";

export default class KineticBody implements Component {
  static readonly NAME: string = 'KineticBody';
  readonly name: string = KineticBody.NAME;

  /** Represents an object that can move, but can't pass through `StaticBody` entities. `isGrounded` will be true if
   * the object is colliding with a `StaticBody` "below" it.
   */
  constructor(public size: Vec2) { }

  isGrounded = false;
}