import Vec2 from "../../../2B2D/Math/Vec2";
import Signal from "../../../2B2D/Signal";

export default class PlayerDiedSignal implements Signal {
  static readonly NAME: string = 'PlayerDiedSignal';
  readonly name: string = PlayerDiedSignal.NAME;

  constructor(
    public sender: string,
    public position: Vec2
  ) { }
}