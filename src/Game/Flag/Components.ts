import Component from "../../Engine/Component";
import Vec2 from "../../Engine/Math/Vec2";

export class FlagCollider implements Component {
  public static readonly NAME = 'FlagCollider';
  name() { return FlagCollider.NAME; }

  constructor(public size:Vec2) { }
}