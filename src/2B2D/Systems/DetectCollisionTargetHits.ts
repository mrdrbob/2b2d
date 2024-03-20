import CollisionTarget from "../Components/CollisionTarget";
import KineticBody from "../Components/KineticBody";
import Position from "../Components/Position";
import CollisionTargetHit from "../Signals/CollisionTargetHit";
import Update from "../Update";
import AABB from "../Utils/AABB";

export default function DetectCollisionTargetHittHits(update: Update) {
  const player = update.single([Position.NAME, KineticBody.NAME]);
  if (!player)
    return;

  const [playerPosition, body] = player.components as [Position, KineticBody];
  const playerGlobalPosition = update.resolvePosition(player.entity, playerPosition);

  const query = update.query([CollisionTarget.NAME, Position.NAME]);
  for (const entity of query) {
    const [collider, pos] = entity.components as [CollisionTarget, Position];

    if (collider.ticks > 0) {
      collider.ticks -= 1;
      continue;
    }

    const globalPos = update.resolvePosition(entity.entity, pos);
    const aabb = new AABB(globalPos, collider.size.add(body.size));
    if (aabb.contains(playerGlobalPosition)) {
      const signal = new CollisionTargetHit(
        collider.type,
        entity.entity,
        player.entity,
        playerGlobalPosition
      );
      update.signals.send(signal);
      collider.ticks = collider.cooldown;
      return;
    }
  }
}