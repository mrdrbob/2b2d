import Component from "../Component";

export default class AnimatedTilemap implements Component {
  static readonly NAME:string = 'AnimatedTilemap';
  readonly name:string = AnimatedTilemap.NAME;

  /** Generates an animated tilemap. See the `platform.ldtk` example LDTK map for tiles with custom-data
   * for an example.
   */
  constructor(public tags: string[], public rate: number) {}

  time: number = 0;
  frame: number = 0;
}
