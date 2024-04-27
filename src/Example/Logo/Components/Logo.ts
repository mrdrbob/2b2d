import Component from "../../../2B2D/Components/Component";

export default class Logo implements Component {
  static readonly NAME:string = 'Logo';
  readonly name:string = Logo.NAME;

  static readonly Tag:Logo = new Logo();
}