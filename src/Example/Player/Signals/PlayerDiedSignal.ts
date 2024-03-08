import Vec2 from "../../../2B2D/Math/Vec2";
import Signal from "../../../2B2D/Signal";

export default class PlayerDied implements Signal {
  static readonly NAME:string = 'PlayerDied';
  readonly name:string = PlayerDied.NAME;

  constructor(
    public position: Vec2, 
    public sender: string | undefined = undefined,
  ) { }
}
