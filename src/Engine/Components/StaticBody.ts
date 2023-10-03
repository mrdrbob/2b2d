import Component from "../Component";
import Vec2 from "../Math/Vec2";

export default class StaticBody implements Component {
  public static readonly NAME:string = 'StaticBody';
  name(): string { return StaticBody.NAME; }

  constructor(public size:Vec2) {}

  public static fromWH(width:number, height:number) { return new StaticBody(new Vec2(width, height)); }
}

