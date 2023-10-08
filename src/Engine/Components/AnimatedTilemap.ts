import Component from "../Component";

export default class AnimatedTilemap implements Component {
  public static NAME:string = 'AnimatedTilemap';
  name() { return AnimatedTilemap.NAME; }

  constructor (public tags:string[], public rate:number) { }

  public time:number = 0;
  public frame:number = 0;
}