import Component from "../Component"
import Vec2 from "../Math/Vec2"

export default class Position implements Component {
  static readonly NAME:string = 'Position';
  readonly name:string = Position.NAME;

  /** Represet's a position in 2D space */
  constructor(public pos:Vec2) {}

  static fromXY(x:number, y:number) {
    return new Position(new Vec2(x, y));
  }
}