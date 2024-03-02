import Component from "../Component";
import Vec2 from "../Math/Vec2";

export interface KineticBodyComponent extends Component {
  name: 'KineticBody',
  size: Vec2,
  isGrounded: boolean
}

/** Represents an object that can move, but can't pass through `StaticBody` entities. `isGrounded` will be true if
 * the object is colliding with a `StaticBody` "below" it.
 */
export default function KineticBody(size: Vec2): KineticBodyComponent {
  return {
    name: 'KineticBody',
    size,
    isGrounded: false
  };
}