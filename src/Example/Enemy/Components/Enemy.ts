import Component from "../../../2B2D/Component";
import Vec2 from "../../../2B2D/Math/Vec2";

/** An "enemy" is something that can be stomped and will die, but otherwise 
 * will cause damage to the player.*/ 
export default class Enemy implements Component {
  static readonly NAME:string = 'Enemy';
  readonly name:string = Enemy.NAME;

  constructor(
    public damage: number, 
    public hitBox: Vec2
  ) {}

  hitCoolDown:number = 0;
}
