import Component from "../Component";
import Vec2 from "../Math/Vec2";

export default class StaticBody implements Component {
  static readonly NAME:string = 'StaticBody';
  readonly name:string = StaticBody.NAME;

  /** A collider that prevents `KineticBody` entities from passing through. */
  constructor(public size: Vec2) { }
}
