import Component from "../../../2B2D/Components/Component";

export default class HealthDisplayComponent implements Component {
  static readonly NAME: string = 'HealthDisplayComponent';
  readonly name: string = HealthDisplayComponent.NAME;

  constructor(
    public empty: number, // <= is empty
    public half: number, // == is half
    public full: number // >= is full
  ) { }
}