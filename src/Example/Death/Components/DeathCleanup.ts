import Component from "../../../2B2D/Components/Component";

export default class DeathCleanup implements Component {
  static readonly NAME: string = 'DeathCleanup';
  readonly name: string = DeathCleanup.NAME;

  static readonly Tag = new DeathCleanup();
}