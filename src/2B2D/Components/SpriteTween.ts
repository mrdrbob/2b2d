import Component from "../Component";
import { ResolvableEntity } from "../Entity";
import Color from "../Math/Color";
import Vec2 from "../Math/Vec2";

export interface SpriteTweenComponent extends Component {
  name: 'SpriteTween',
  entity: ResolvableEntity | undefined
  startPos: Vec2,
  endPos: Vec2,
  startColor: Color,
  endColor: Color
}

/** A tween that can either reference another entity, or be attached to an entity. 
 * The target etntity is expected to have a Sprite and Position component. This tween 
 * can change the position and color of a sprite over time.
 * To be useful, this component must be paired with a `Timer` component.
 * The `Timer` component will despawn the entity it's attached to. If you want to tween 
 * an entity and NOT despawn it at the end of the tween, do not attach the `SpriteTween`
 * and `Timer` to that entity, but rather create a separate entity and reference the target 
 * entity with the `entity` argument.
 */
export default function SpriteTween(startPos: Vec2, endPos: Vec2, startColor: Color, endColor: Color, entity?: ResolvableEntity): SpriteTweenComponent {
  return {
    name: 'SpriteTween',
    entity,
    startPos,
    endPos,
    startColor,
    endColor
  };
}
