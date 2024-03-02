import Component from "../Component";
import Vec2 from "../Math/Vec2";

export interface StaticBodyComponent extends Component {
  name: 'StaticBody',
  size: Vec2
}

/** A collider that prevents `KineticBody` entities from passing through. */
export default function StaticBody(size: Vec2): StaticBodyComponent {
  return {
    name: 'StaticBody',
    size
  };
}
