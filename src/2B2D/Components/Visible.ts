import Component from "../Component";

export interface VisibleComponent extends Component {
  name: 'Visible',
  visible: boolean
}

/** Use this component to optionally prevent renderables from rendering.
 * If a renderable entity does not have a `Visibility`, and has no ancestors 
 * with a `Visible` component, the entity will be assumed to be *visible*.
 */
export default function Visible(visible?:boolean): VisibleComponent {
  return {
    name: 'Visible',
    visible: visible === undefined ? true : visible
  };
}
