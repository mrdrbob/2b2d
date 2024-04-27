import Component from "./Component";

export default class RenderOrder implements Component {
  static readonly NAME:string = 'RenderOrder';
  readonly name:string = RenderOrder.NAME;

  constructor(public layer:string | undefined) { }
}