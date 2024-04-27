import Component from "./Component";

export default class Visible implements Component {
  static readonly NAME: string = 'Visible';
  readonly name: string = Visible.NAME;
  visible: boolean;

  /** Use this component to optionally prevent renderables from rendering.
   * If a renderable entity does not have a `Visibility`, and has no ancestors 
   * with a `Visible` component, the entity will be assumed to be *visible*.
   */
  constructor(visible?: boolean) {
    this.visible = visible === undefined ? true : visible;
  }
}
