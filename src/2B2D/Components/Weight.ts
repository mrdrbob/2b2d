import Component from "./Component";

export default class Weight implements Component {
  static readonly NAME: string = 'Weight';
  readonly name: string = Weight.NAME;

  /** A `KineticBody` with `Weight` will fall toward the bottom of the screen. 
   * The acceleration is based of the `gravity` value.
   */
  constructor(public gravity: number) { }
}