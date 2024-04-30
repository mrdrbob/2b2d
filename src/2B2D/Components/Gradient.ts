import Color from "../Math/Color";
import Vec2 from "../Math/Vec2";
import Component from "./Component";

export default class Gradient implements Component {
  static readonly NAME: string = 'Gradient';
  readonly name: string = Gradient.NAME;

  /** Generates a gradient. Colors are given for each corner. */
  constructor(
    public nw: Color,
    public ne: Color,
    public sw: Color,
    public se: Color,
    public size: Vec2
  ) { }

  static SolidBox(color: Color, size: Vec2) {
    return new Gradient(color, color, color, color, size);
  }
}
