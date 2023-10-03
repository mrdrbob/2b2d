import Component from "../Component";
import Vec2 from "../Math/Vec2";

export default class Debug implements Component {
  public static NAME:string = 'Debug';
  name() { return Debug.NAME; }

  constructor(public position:Vec2, public size:Vec2, public color: [number, number, number, number]) {}
}