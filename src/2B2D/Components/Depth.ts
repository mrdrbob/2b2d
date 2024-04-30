import Component from "./Component";

export default class Depth implements Component {
  static readonly NAME: string = 'Depth';
  readonly name: string = Depth.NAME;

  constructor(public depth: number) { }
}