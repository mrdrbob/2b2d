import { Component } from "../Component";

export default class Sprite implements Component {
  public static readonly NAME:string = 'Sprite';

  name() { return Sprite.NAME; }

  constructor(public texture:string, public atlas:string, public layer:string, public frame:string) { }
}
