import { Handle } from "../Handle";
import Color from "../Math/Color";
import Vec2 from "../Math/Vec2";
import Component from "./Component";

export default class Sprite implements Component {
  static readonly NAME: string = 'Sprite';
  readonly name: string = Sprite.NAME;

  /** A sprite. Can be paired with `Animated` to make an animated sprite. */
  constructor(
    public handle: Handle,
    public frame: string = '0',
    public scale: Vec2 = Vec2.ONE,
    public color: Color = Color.White(1),
    public radians: number = 0
  ) { }
}