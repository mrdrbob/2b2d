import CollisionTarget from "../Components/CollisionTarget";
import KineticBody from "../Components/KineticBody";
import Position from "../Components/Position";
import AABB from "../Math/AABB";
import CollisionTargetHitSignal from "../Signals/CollisionTargetHitSignal";
import Update from "../Update";

export default function DetectCollisionTargetHits(update: Update) {
  const players = update.ecs.query(KineticBody, Position);
  for (const player of players) {
    const [playerBody, playerPos] = player.components;
    const playerResolvedPosition = update.resolve.position(player.entity, playerPos);

    const targets = update.ecs.query(CollisionTarget, Position);
    for (const target of targets) {
      const [collider, colPosition] = target.components;

      if (collider.ticks > 0) {
        collider.ticks -= 1;
        continue;
      }

      const colliderResolvedPosition = update.resolve.position(target.entity, colPosition);

      const aabb = new AABB(colliderResolvedPosition, collider.size.add(playerBody.size));
      if (aabb.contains(playerResolvedPosition)) {
        const signal = new CollisionTargetHitSignal(
          collider.target,
          { entity: target.entity, position: colliderResolvedPosition, size: collider.size },
          { entity: player.entity, position: playerResolvedPosition, size: playerBody.size },
        );
        update.signals.send(signal);
        collider.ticks = collider.cooldown;
        break;
      }
    }
  }
}