import Component from "../Component";

export interface AnimatedTilemapComponent extends Component {
  name: "AnimatedTilemap",
  tags: string[],
  rate: number,
  time: number,
  frame: number
}

/** Generates an animated tilemap. See the `platform.ldtk` example LDTK map for tiles with custom-data
 * for an example.
 */
export default function AnimatedTilemap(tags: string[], rate: number): AnimatedTilemapComponent {
  return {
    name: 'AnimatedTilemap',
    tags,
    rate,
    time: 0,
    frame: 0
  };
}
