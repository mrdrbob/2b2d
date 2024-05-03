import Vec2 from "../Math/Vec2";
import Component from "./Component";

export default class Position implements Component {
  static readonly NAME: string = 'Position';
  readonly name = Position.NAME;

  /** Represet's a position in 2D space */
  constructor(public position: Vec2) { }

  static from(...points: number[]) {
    return new Position(Vec2.from(...points));
  }
}