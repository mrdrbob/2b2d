import Component from "./Component";

export default class AnimatedTilemap implements Component {
  static readonly NAME: string = 'AnimatedTilemap';
  readonly name: string = AnimatedTilemap.NAME;

  /** Animates a tileset between a set number of frames at a set framerate.
   * To create an animated tilemap in LDtk, add Custom Data to each tile 
   * that should change. The Custom Data should be an array of grid-based offsets,
   * one per frame. For example, `[[0,1]]` is one additional frame of animation, 
   * where the tile this Custom Data is set on will be replaced by the tile in the
   * same colum (X = 0), one row down (Y = 1).
   */
  constructor(
    public rate: number
  ) { }

  time: number = 0;
  frame: number = 0;
  totalFrames: number | undefined = undefined;
}