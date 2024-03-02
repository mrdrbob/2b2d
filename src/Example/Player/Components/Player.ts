import Component from "../../../2B2D/Component";
import Vec2 from "../../../2B2D/Math/Vec2";

export interface PlayerComponent extends Component {
  name: 'Player',
  facing: Vec2,
  jumpTimeRemaining: number,
  invincibleTimeRemaining:number,
  controlsEnabled: boolean
}

export default function Player(): PlayerComponent {
  return { name: 'Player', facing: new Vec2(1, 0), jumpTimeRemaining: 0, invincibleTimeRemaining: 0, controlsEnabled: true }
}