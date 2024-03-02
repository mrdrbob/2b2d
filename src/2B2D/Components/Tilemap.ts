import { Handle } from "../Asset";
import Component from "../Component";
import { Layer } from "../Layer";

export interface TilemapComponent extends Component {
  name: 'Tilemap',
  layer: Layer,
  texture: Handle,
  tilemap: Handle,
  generation: number
}

/** Creates a Tilemap. Requires a `Position` component. */
export default function Tilemap(layer: string, texture: string, tilemap: Handle): TilemapComponent {
  return { name: 'Tilemap', layer, texture, tilemap, generation: 0 };
}
