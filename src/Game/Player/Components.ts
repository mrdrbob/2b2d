import Component from "../../Engine/Component";
import Vec2 from "../../Engine/Math/Vec2";

export class Player implements Component {
  public static NAME:string = 'Player'
  name() { return Player.NAME; }

  public facing:Vec2 = Vec2.ZERO;
  public jumpTimeRemaining:number = 0;
}
