import { Entity } from "../../../2B2D/Entity";
import Signal from "../../../2B2D/Signal";

export interface EnemyCollisionSignal extends Signal {
  name: 'EnemyCollision',
  enemy: Entity,
  damage: number,
  isStomp: boolean
}

export default function EnemyCollision(enemy: Entity, damage: number, isStomp: boolean, sender?: string) : EnemyCollisionSignal {
  return {
    name: 'EnemyCollision',
    enemy,
    damage,
    isStomp,
    sender
  };
}