import Component from "./Component";

export default class RenderOrder implements Component {
  static readonly NAME: string = 'RenderOrder';
  readonly name: string = RenderOrder.NAME;

  /** Forces objects to render in a particular order, based on the strings in
   * `update.engine.rendering.renderOrder`. Items with no RenderOrder are rendered
   * first, then in the order of the `renderOrder` array. If `layer` is not in the
   * `renderOrder` array, the object won't be rendered.
   */
  constructor(public layer: string | undefined) { }
}