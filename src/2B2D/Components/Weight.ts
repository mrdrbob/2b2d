import Component from "../Component";

export interface WeightComponent extends Component {
  name: 'Weight',
  gravity: number
}

/** A `KineticBody` with `Weight` will fall toward the bottom of the screen. 
 * The acceleration is based of the `gravity` value.
 */
export default function Weight(gravity: number): WeightComponent {
  return {
    name: 'Weight',
    gravity
  };
}
