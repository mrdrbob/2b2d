import { Component } from "../Component";
import Vec2 from "../Math/Vec2";

export default class Position implements Component {
  public static readonly NAME:string = 'Position';

  name() { return Position.NAME; }

  constructor(public pos:Vec2) {
  }

  static fromXY(x:number, y:number) { return new Position(new Vec2(x, y)); }
  
}