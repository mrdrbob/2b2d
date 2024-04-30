import Component from "../../../2B2D/Components/Component";

export default class Enemy implements Component {
  static readonly NAME: string = 'Enemy';
  readonly name: string = Enemy.NAME;

  constructor(
    public damage: number
  ) { }
}
