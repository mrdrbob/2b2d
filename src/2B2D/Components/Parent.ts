import Component from "../Component";
import { Entity, ResolvableEntity } from "../Entity";

export interface ParentComponent extends Component {
  name: 'Parent',
  entity: Entity | ResolvableEntity
};

/** Some properties can be inherited (or offset from) a parent entity. For exmaple:
 * `Position` values will be offset from the `Parent` entity's position.
 * `Visibility` values will be inherited from any ancestor entity.
 */
export default function Parent(entity: Entity | ResolvableEntity) : ParentComponent {
  return {
    name: 'Parent',
    entity
  };
}