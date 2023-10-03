import Component from "../Component";
import Vec2 from "../Math/Vec2";

export default class KineticBody implements Component {
  public static readonly NAME:string;
  name() { return KineticBody.NAME; }

  constructor(public size:Vec2) {}

  public isGrounded:boolean = false;

  public static fromWH(width:number, height:number) { return new KineticBody(new Vec2(width, height)); }
}
