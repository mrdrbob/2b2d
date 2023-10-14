import Component from "../Component";

/**
 * Does nothing on it's own, but can be used to stop audio
 * on systems exits, etc.
 */
export default class Sound implements Component {
  public static readonly NAME:string = 'Sound';
  name() { return Sound.NAME; }

  public constructor(public soundId:number) { }
}