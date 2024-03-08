import { Handle } from "../Asset";
import Component from "../Component";
import { Layer } from "../Layer";

export default class Tilemap implements Component {
  static readonly NAME:string = 'Tilemap';
  readonly name:string = Tilemap.NAME;

  constructor(
    public layer: Layer, 
    public texture: string, 
    public tilemap: Handle
  ) {}

  generation: number = 0;
}
