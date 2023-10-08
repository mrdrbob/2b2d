import KineticBody from "../../Engine/Components/KineticBody";
import Position from "../../Engine/Components/Position";
import Update from "../../Engine/Update";
import AABB from "../../Engine/Utils/AABB";
import { Player } from "../Player/Components";
import { GameStateResource } from "../Resources";
import { PlayerDiedEvent } from "../Systems";
import { WaterCollider } from "./Components";

export function checkForWaterCollision(update:Update) {
  const playerQuery = update.queryCached('checkForWaterCollision:player', [ Player.NAME, Position.NAME, KineticBody.NAME ]);
  if (playerQuery.length == 0)
    return;
  

  const [ _player, playerPos, body ] = playerQuery[0].components as [ Player, Position, KineticBody ];
  const globalPosition = playerPos.globalPosition();

  const waterColliders = update.queryCached('checkForWaterCollision:water', [ WaterCollider.NAME, Position.NAME ]);
  for (const entity of waterColliders) {
    const [ collider, pos ] = entity.components as [ WaterCollider, Position ];
    const aabb = new AABB(pos.globalPosition(), collider.size.add(body.size));
    if (aabb.contains(globalPosition)) {
      const gameState = update.resource<GameStateResource>(GameStateResource.NAME);
      gameState.health = 0;
      const writer = update.event<PlayerDiedEvent>(PlayerDiedEvent.NAME);
      console.log('hit water');
      writer.push({
        playerPosition: globalPosition
      });
      update.despawn(playerQuery[0].entity);
      return;
    }
  }
}