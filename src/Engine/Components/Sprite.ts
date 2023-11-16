import Component from "../Component";
import Vec2 from "../Math/Vec2";

export default class Sprite implements Component {
  public static readonly NAME:string = 'Sprite';

  name() { return Sprite.NAME; }

  public useDefaultRenderer:boolean = true;
  public scale:Vec2 = new Vec2(1, 1);
  public color:[number, number, number, number] = [1, 1, 1, 1];

  constructor(public texture:string, public atlas:string, public layer:string, public frame:string) { }

  withColor(r:number, g:number, b:number, a:number ) {
    this.color = [r, g, b, a];
    return this;
  }
}
