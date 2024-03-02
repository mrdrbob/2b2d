import Component from "../Component";
import Vec2 from "../Math/Vec2";

export interface VelocityComponent extends Component {
  name: 'Velocity',
  velocity: Vec2
}

/** Reprsents an entity's velocity in 2D space */
export default function Velocity(velocity?:Vec2): VelocityComponent {
  return {
    name: 'Velocity',
    velocity: velocity ?? Vec2.ZERO
  };
}
