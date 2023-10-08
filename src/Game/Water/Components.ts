import Component from "../../Engine/Component";
import Vec2 from "../../Engine/Math/Vec2";

// Not really "water", but any zone that will kill the player.
export class WaterCollider implements Component {
  public static readonly NAME:string = 'WaterCollider';
  name() { return WaterCollider.NAME; }
  
  constructor(public size:Vec2) { }
}
