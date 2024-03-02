import { Handle } from "../Asset";
import Component from "../Component";
import { Layer } from "../Layer";
import Color from "../Math/Color";
import Vec2 from "../Math/Vec2";

export interface SpriteComponent extends Component {
  name: 'Sprite',
  texture: Handle,
  atlas: Handle,
  layer: Layer,
  frame: string,
  scale: Vec2,
  color: Color
}

export interface Test {
  (name: string, age: number): string,
  other: string
}

/** Represents an image. Must be used with a sprite atlas, even if the sprite is the only image on the texture.
 * Unless you use a custom renderer, you will need to include `UseSpriteRenderer` to render the sprite.
 * Will also require a `Position` component to render.
 */
function Sprite(
  texture:Handle, 
  atlas:Handle, 
  layer:Layer, 
  frame?:string, 
  scale?:Vec2,
  color?:Color
) : SpriteComponent {
  return {
    name: 'Sprite',
    texture: texture,
    atlas: atlas,
    layer,
    frame: frame ?? '0',
    scale: scale ?? Vec2.ONE,
    color: color ?? Color.White(1)
  }
}

export default Sprite;