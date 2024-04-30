import Vec2 from "../Math/Vec2";
import Component from "./Component";

export default class Camera implements Component {
  static readonly NAME: string = 'Camera';
  readonly name: string = Camera.NAME;

  constructor(public zoom: Vec2 = new Vec2(8, 8)) {
  }
}