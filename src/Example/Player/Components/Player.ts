import Component from "../../../2B2D/Components/Component";
import Vec2 from "../../../2B2D/Math/Vec2";

export default class Player implements Component {
  static readonly NAME: string = 'Player';
  readonly name: string = Player.NAME;

  controlsEnabled = true;
  facing = Vec2.ONE;
  invincibleTime = 0;
}