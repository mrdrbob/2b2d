import Component from "../Component";
import Color from "../Math/Color";
import Vec2 from "../Math/Vec2";

export default class Gradient implements Component {
  public static NAME:string = 'Gradient';
  name() { return Gradient.NAME; }

  constructor(public layer:string, public nw:Color, public ne:Color, public sw:Color, public se:Color, public size:Vec2) {}
}