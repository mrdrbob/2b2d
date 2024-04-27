import Vec2 from "../Math/Vec2";
import Component from "./Component";

export default class KineticBody implements Component {
  static readonly NAME:string = 'KineticBody';
  readonly name:string = KineticBody.NAME;

  constructor(public size:Vec2) { }

  isGrounded = false;
}