import { Curtain } from "../Curtain/Plugin";
import KineticBody from "../Engine/Components/KineticBody";
import Position from "../Engine/Components/Position";
import Velocity from "../Engine/Components/Velocity";
import { Entity } from "../Engine/Entity";
import Vec2 from "../Engine/Math/Vec2";
import Update from "../Engine/Update";
import AABB from "../Engine/Utils/AABB";
import { Enemy } from "./Enemy/Components";
import { Player } from "./Player/Components";
import { Event } from "../Engine/Events/EventManager";
import { CleanupOnGameLoopExit } from "./Components";

const ENEMY_HIT_COOLDOWN = 1000;

export class PlayerEnemyCollisionEvent {
  public static readonly NAME:string = 'PlayerEnemyCollisionEvent';
  constructor(public enemy:Entity, public damage:number, public fromAbove:boolean) {}
}

export class PlayerDiedEvent {
  public static readonly NAME:string = 'PlayerDiedEvent';
  constructor(public playerPosition: Vec2) { }
}

export function closeCurtains(update:Update) {
  const topCurtain = update.query([ Curtain.NAME, 'curtain:top' ])[0].components[0] as Curtain;
  topCurtain.continue(new Vec2(0, -150), 1000, Curtain.DespawnAfter);

  const middleCurtain = update.query([ Curtain.NAME, 'curtain:middle' ])[0].components[0] as Curtain;
  middleCurtain.continue(new Vec2(0, -300), 1000, Curtain.DespawnAfter);
}

export function cleanUpLevel(update:Update) {
  const query = update.query([ CleanupOnGameLoopExit.NAME ]);
  for (const entity of query) {
    update.despawn(entity.entity);
  }
}

export function playerInteractWithEnemies(update:Update) {
  const playerQuery = update.queryCached('playerInteractWithEnemies:player', [ Player.NAME, Position.NAME, Velocity.NAME, KineticBody.NAME ]);
  if (playerQuery.length == 0)
    return;
  const enemies = update.queryCached('playerInteractWithEnemies:enemies', [ Enemy.NAME, Position.NAME ]);

  const [ player, playerPosition, playerVelocity, playerBody ] = playerQuery[0].components as [ Player, Position, Velocity, KineticBody ];
  const playerGlobalPos = playerPosition.globalPosition();

  let event:Event<PlayerEnemyCollisionEvent> | null = null; 
  
  for (const entity of enemies) {
    const [enemy, enemyPos] = entity.components as [ Enemy, Position ];
    if (enemy.hitCoolDown > 0) {
      enemy.hitCoolDown -= update.deltaTime();
      continue;
    }

    const enemyAABB = new AABB(enemyPos.globalPosition(), enemy.hitBox.add(playerBody.size));
    if (enemyAABB.contains(playerGlobalPos)) {
      enemy.hitCoolDown = ENEMY_HIT_COOLDOWN;
      event = event || update.event<PlayerEnemyCollisionEvent>(PlayerEnemyCollisionEvent.NAME);

      // Hit detection isn't great... So, if you're in the top 90% of the enemy, we'll just count it.
      const enemyTop = enemyAABB.pos.y - enemyAABB.size.y;
      const delta = (playerGlobalPos.y - enemyTop) / (enemyAABB.size.y * 2);
      const hitTop = delta > 0.9;

      event.push({
        enemy: entity.entity,
        damage: enemy.damageToDo,
        fromAbove: hitTop
      });
      continue;
    }

    const hit = enemyAABB.detectRayCollision(playerGlobalPos, playerVelocity.velocity);
    if (hit) {
      enemy.hitCoolDown = ENEMY_HIT_COOLDOWN;
      const fromAbove = hit.normal.y > 0;
      event = event || update.event<PlayerEnemyCollisionEvent>(PlayerEnemyCollisionEvent.NAME);

      event.push({
        enemy: entity.entity,
        damage: enemy.damageToDo,
        fromAbove: fromAbove
      });
    }
  }
}