import Component from "../Component"
import Vec2 from "../Math/Vec2"

export interface PositionComponent extends Component {
  name: 'Position',
  pos: Vec2
}

/** Represet's a position in 2D space */
function Position(pos:Vec2): PositionComponent {
  return { name: 'Position', pos };
}

Position.from_xy = (x:number, y:number) => {
  return Position(new Vec2(x, y));
}

export default Position;
