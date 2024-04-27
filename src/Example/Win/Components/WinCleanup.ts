import Component from "../../../2B2D/Components/Component";

export default class WinCleanup implements Component {
  static readonly NAME:string = 'WinCleanup';
  readonly name:string = WinCleanup.NAME;

  static readonly Tag = new WinCleanup();
}