import { Entity } from "../Entity";
import Vec2 from "../Math/Vec2";
import Signal from "../Signal";

export interface CollsisionTargetHitSignal extends Signal {
  name: 'CollsisionTargetHit',
  target: Entity,
  kineticBody: Entity,
  position: Vec2
}

export default function CollsisionTargetHit(sender: string, target: Entity, kineticBody: Entity, position: Vec2): CollsisionTargetHitSignal {
  return {
    name: 'CollsisionTargetHit',
    sender, target, kineticBody, position,
  };
}