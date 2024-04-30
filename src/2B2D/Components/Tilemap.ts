import { Handle } from "../Handle";
import Component from "./Component";

export default class Tilemap implements Component {
  static readonly NAME: string = 'Tilemap';
  readonly name: string = Tilemap.NAME;

  constructor(
    public handle: Handle,
    public level: string,
    public layer: string,
    public frame: number = 0
  ) { }

  id() { return `${this.handle}:${this.level}:${this.layer}:${this.frame}`; }
}