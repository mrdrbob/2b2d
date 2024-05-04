import { Entity } from "../Entity";
import Vec2 from "../Math/Vec2";
import Signal from "../Signal";

export interface CollisionEntity {
  entity: Entity,
  size: Vec2,
  position: Vec2
}

export default class CollisionTargetHitSignal implements Signal {
  static readonly NAME: string = 'CollisionTargetHitSignal';
  readonly name: string = CollisionTargetHitSignal.NAME;

  constructor(
    public sender: string,
    public target: CollisionEntity,
    public kineticBody: CollisionEntity,
  ) { }
}