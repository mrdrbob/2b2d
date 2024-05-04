import Component from "./Component";

export default class Depth implements Component {
  static readonly NAME: string = 'Depth';
  readonly name: string = Depth.NAME;

  /** Sets the depth for a sprite. Depth should be greather than
   * zero, less than one. Larger numbers are further back, and smaller 
   * numbers are closer to the camera.
   */
  constructor(public depth: number) { }
}