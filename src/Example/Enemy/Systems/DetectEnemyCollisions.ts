import KineticBody from "../../../2B2D/Components/KineticBody";
import Position from "../../../2B2D/Components/Position";
import Velocity from "../../../2B2D/Components/Velocity";
import Update from "../../../2B2D/Update";
import AABB from "../../../2B2D/Utils/AABB";
import Player from "../../Player/Components/Player";
import Enemy from "../Components/Enemy";
import EnemyCollision from "../Signals/EnemyCollisionSignal";

const ENEMY_HIT_COOLDOWN = 1000;

export default function DetectEnemyCollisions(update: Update) {
  const player = update.single([Player.NAME, Position.NAME, Velocity.NAME, KineticBody.NAME]);
  if (!player)
    return;

  const enemies = update.query([Enemy.NAME, Position.NAME]);

  const [_player, playerPosition, playerVelocity, playerBody] = player.components as [Player, Position, Velocity, KineticBody];
  const playerGlobalPos = update.resolvePosition(player.entity, playerPosition);

  for (const entity of enemies) {
    const [enemy, enemyPos] = entity.components as [Enemy, Position];
    if (enemy.hitCoolDown > 0) {
      enemy.hitCoolDown -= update.delta();
      continue;
    }

    // Do an AABB "contains" check first because it's very fast and the
    // ray-cast check doesn't always catch collisions.
    const enemyGlobalPosition = update.resolvePosition(entity.entity, enemyPos);
    const enemyAABB = new AABB(enemyGlobalPosition, enemy.hitBox.add(playerBody.size));
    if (enemyAABB.contains(playerGlobalPos)) {
      enemy.hitCoolDown = ENEMY_HIT_COOLDOWN;

      // Hit detection isn't great... So, if you're in the top 90% of the enemy, we'll just count it.
      const enemyTop = enemyAABB.pos.y - enemyAABB.size.y;
      const delta = (playerGlobalPos.y - enemyTop) / (enemyAABB.size.y * 2);
      const isStomp = delta > 0.9;

      update.signals.send(new EnemyCollision(entity.entity, enemy.damage, isStomp));
      continue;
    }

    const hit = enemyAABB.detectRayCollision(playerGlobalPos, playerVelocity.velocity);
    if (hit) {
      enemy.hitCoolDown = ENEMY_HIT_COOLDOWN;
      const isStomp = hit.normal.y > 0;

      update.signals.send(new EnemyCollision(entity.entity, enemy.damage, isStomp));
    }
  }

}