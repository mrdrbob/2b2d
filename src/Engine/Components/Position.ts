import Component from "../Component";
import Vec2 from "../Math/Vec2";

export default class Position implements Component {
  public static readonly NAME:string = 'Position';

  name() { return Position.NAME; }

  constructor(public pos:Vec2) {
  }

  // Not ideal... but... ¯\_(ツ)_/¯
  public parent:Position | undefined;

  static fromXY(x:number, y:number) { return new Position(new Vec2(x, y)); }

  public globalPosition() : Vec2 {
    if (this.parent) {
      return this.parent.globalPosition().add(this.pos);
    }
    return this.pos;
  }

  public follow(parent:Position) {
    this.parent = parent;
    return this;
  }
  
}