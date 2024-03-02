import Component from "../../../2B2D/Component";
import Vec2 from "../../../2B2D/Math/Vec2";

export interface EnemyComponent extends Component {
  name: 'Enemy',
  damage: number,
  hitBox: Vec2,
  hitCoolDown:number
}

// An "enemy" is something that can be stomped and will die, but otherwise
// will cause damage to the player.
export default function Enemy(damage: number, hitBox: Vec2): EnemyComponent {
  return {
    name: 'Enemy',
    damage,
    hitBox,
    hitCoolDown: 0
  };
}