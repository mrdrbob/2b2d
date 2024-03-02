import Component from "../Component";

export interface UseSpriteRendererComponent extends Component {
  name: 'UseSpriteRenderer',
  isStatic: boolean
}

/** Required for the default engine Sprite renderer to render an entity. If you
 * are using a custom renderer for sprites, leave this component off and introduce your
 * own component.
 * NOTE: `isStatic` doesn't do anything yet. In theory, this may be used for optimization 
 * in the future, but not currently implemented.
 */
export default function UseSpriteRenderer(isStatic?: boolean):UseSpriteRendererComponent {
  return {
    name: 'UseSpriteRenderer',
    isStatic: (isStatic !== undefined) ? isStatic : false
  };
}