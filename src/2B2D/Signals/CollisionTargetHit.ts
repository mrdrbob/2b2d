import { Entity } from "../Entity";
import Vec2 from "../Math/Vec2";
import Signal from "../Signal";

export default class CollisionTargetHit implements Signal {
  static readonly NAME: string = 'CollisionTargetHit';
  readonly name: string = CollisionTargetHit.NAME;

  constructor(
    public sender: string,
    public target: Entity,
    public kineticBody: Entity,
    public position: Vec2
  ) { }
}
