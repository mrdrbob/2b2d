import { Component } from "../Component";
import Vec2 from "../Math/Vec2";

export default class Velocity implements Component {
  public static readonly NAME:string = 'Velocity';

  name(): string { return Velocity.NAME; }

  constructor(public velocity:Vec2) { }

  static zero() { return new Velocity(Vec2.ZERO) };
}