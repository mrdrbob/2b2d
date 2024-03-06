import CollsisionTarget, { CollsisionTargetComponent } from "../Components/CollissionTarget";
import KineticBody, { KineticBodyComponent } from "../Components/KineticBody";
import Position, { PositionComponent } from "../Components/Position";
import CollsisionTargetHit from "../Signals/CollsisionTargetHit";
import Update from "../Update";
import AABB from "../Utils/AABB";

export default function DetectCollissionTargetHits(update:Update) {
  const player = update.single([ Position.name, KineticBody.name ]);
  if (!player)
    return;

  const [ playerPosition, body ] = player.components as [ PositionComponent, KineticBodyComponent ];
  const playerGlobalPosition = update.resolvePosition(player.entity, playerPosition);

  const query = update.query([ CollsisionTarget.name, Position.name ]);
  for (const entity of query) {
    const [ collider, pos ] = entity.components as [ CollsisionTargetComponent, PositionComponent ];

    if (collider.ticks > 0) {
      collider.ticks -= 1;
      continue;
    }
    
    const globalPos = update.resolvePosition(entity.entity, pos);
    const aabb = new AABB(globalPos, collider.size.add(body.size));
    if (aabb.contains(playerGlobalPosition)) {
      const signal = CollsisionTargetHit(
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