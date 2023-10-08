import Component from "../Component";

export default class Tilemap implements Component {
  public static readonly NAME:string = 'Tilemap';

  name(): string { return Tilemap.NAME; }

  constructor(public layer:string, public texture:string, public tilemap:string, public atlas:string) {
    
  }
}
