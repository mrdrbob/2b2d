import { Component } from "../Engine/Component";
import Vec2 from "../Engine/Math/Vec2";

export class MoveAroundComponent implements Component {
  public static readonly NAME:string = 'MoveAroundComponent';

  name(): string { return MoveAroundComponent.NAME; }

  public facing:Vec2 = new Vec2(-1, 0);
}
