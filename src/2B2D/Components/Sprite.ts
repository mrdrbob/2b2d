import { Handle } from "../Asset";
import Component from "../Component";
import { Layer } from "../Layer";
import Color from "../Math/Color";
import Vec2 from "../Math/Vec2";

export default class Sprite implements Component {
  static readonly NAME: string = 'Sprite';
  readonly name: string = Sprite.NAME;

  constructor(
    public texture: Handle,
    public atlas: Handle,
    public layer: Layer,
    public frame: string = '0',
    public scale: Vec2 = Vec2.ONE,
    public color: Color = Color.White(1),
    public radians: number = 0
  ) {
  }
}
