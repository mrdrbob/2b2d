import Component from "./Component";

export default class AnimatedTilemap implements Component {
  static readonly NAME:string = 'AnimatedTilemap';
  readonly name:string = AnimatedTilemap.NAME;

  constructor(
    public rate: number
  ) { }

  time: number = 0;
  frame: number = 0;
  totalFrames: number | undefined = undefined;
}